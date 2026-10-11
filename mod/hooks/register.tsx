import type {
  PluginOptions,
  Register,
  RenderSurface,
  Settings,
  Timer,
} from 'claude-code'

import { bandOf } from './band'
import type { Host } from './host'
import { reportOf } from './report'
import { keepSnapshot, snapshotPathOf } from './snapshot'
import { engineOf, engineSettingsPathIn, statusOf } from './status'
import type { Status, Told } from './status'

/** What runs the engine unless the person names another runtime. */
const DEFAULT_RUNTIME = 'node'

/** How often the lines are run again while nothing else asks, in seconds. */
const DEFAULT_REFRESH_SECONDS = 30

/** A width, in cells, wider than any status line. */
const UNBOUNDED_COLUMNS = 1000

/** The shortest period the timer takes: each tick starts a process. */
const MIN_REFRESH_SECONDS = 5

/**
 * How many of the timer's periods a snapshot's lines stay fresh for: a run
 * may come late, and one may be lost.
 */
const FRESH_PERIODS = 3

type ToldBy = { transcript_path: string; effort?: { level: string } }

/** The timer's period in milliseconds; undefined with the timer off. */
function refreshMsOf({ refreshSeconds }: PluginOptions): number | undefined {
  const seconds =
    typeof refreshSeconds === 'number' && Number.isFinite(refreshSeconds)
      ? refreshSeconds
      : DEFAULT_REFRESH_SECONDS

  return seconds > 0
    ? Math.max(MIN_REFRESH_SECONDS, seconds) * 1000
    : undefined
}

/** Whether Claude Code's settings run a status line command of their own. */
function hasOwnStatusLine({ statusLine }: Settings): boolean {
  const command =
    typeof statusLine === 'object' && statusLine !== null
      ? (statusLine as { command?: unknown }).command
      : undefined

  return typeof command === 'string' && command.trim() !== ''
}

/** The command the engine is run with: the option's, or node. */
function runtimeOf({ runtime }: PluginOptions): string {
  return typeof runtime === 'string' && runtime.trim() !== ''
    ? runtime.trim()
    : DEFAULT_RUNTIME
}

export const register: Register = (on, options) => {
  const refreshMs = refreshMsOf(options)
  const runtime = runtimeOf(options)

  const freshFor =
    refreshMs === undefined ? undefined : FRESH_PERIODS * refreshMs

  let bound: Host | null = null
  let status: Status | null = null
  let queued: Timer | null = null
  let ticking: Timer | null = null
  let running: Promise<void> | null = null
  let isStale = false
  let told: Told = {}

  // A terminal that runs a status line of its own already shows these lines
  // under the prompt; until the settings say it runs none, it is left alone
  let isTerminalFree = false

  const drawsOn = (surface: RenderSurface) =>
    surface === 'desktop' || (surface === 'terminal' && isTerminalFree)

  /** The band's width on each surface that draws it, in character cells. */
  const columnsOf = new Map<RenderSurface, number>()

  /** The narrowest band a surface has measured; undefined when none has. */
  function narrowestBand() {
    const measured = [...columnsOf.values()].filter(columns => columns > 0)

    return measured.length === 0 ? undefined : Math.min(...measured)
  }

  function note(e: ToldBy) {
    told = {
      ...told,
      ...(e.transcript_path !== '' && { transcriptPath: e.transcript_path }),
      ...(e.effort !== undefined && { effort: e.effort.level }),
    }
  }

  // A session an SDK host runs has no surface to draw the band on, and what
  // hosts it reads a snapshot of the lines instead. A session is on a surface
  // once it starts under one, one attaches, or one asks for the band, drawn
  // there or not
  let isOnSurface = false

  /**
   * Where the session's snapshot goes, when it keeps one: the session is on
   * no surface, and snapshots are read.
   */
  async function snapshotPathFor(host: Host) {
    // A surface may have attached before this module was there to be told
    if (!isOnSurface && (await host.surfaces()).length > 0) {
      isOnSurface = true
    }

    return isOnSurface ? undefined : snapshotPathOf(host)
  }

  async function run(host: Host) {
    try {
      do {
        isStale = false

        const snapshotPath = await snapshotPathFor(host)

        // A snapshot's reader lays the lines out itself, as the desktop app
        // does: for it too the engine is given room no line reaches
        const columns =
          narrowestBand() ??
          (snapshotPath === undefined ? undefined : UNBOUNDED_COLUMNS)

        status = await statusOf(host, { runtime, told, columns })

        host.invalidate()

        if (snapshotPath !== undefined) {
          await keepSnapshot(host, snapshotPath, status, freshFor)
        }
      } while (isStale)
    } finally {
      running = null
    }
  }

  /**
   * Runs the engine and redraws the band with what it printed. One run at a
   * time: a refresh asked for meanwhile is answered by one more run after it.
   *
   * @returns settles once no run is under way and none is owed
   */
  function refresh(host: Host): Promise<void> {
    if (running) {
      isStale = true
    } else {
      running = run(host)
    }

    return running
  }

  /**
   * A refresh, where the lines are still shown somewhere when its turn comes:
   * on a surface that draws the band, or in a snapshot that is read.
   */
  async function refreshIfShown(host: Host) {
    if (columnsOf.size > 0 || (await snapshotPathFor(host)) !== undefined) {
      await refresh(host)
    }
  }

  function schedule(host: Host) {
    queued ??= host.after(0, () => {
      queued = null
      void refreshIfShown(host).catch(() => undefined)
    })
  }

  /**
   * Asks for fresh lines, while some surface is drawing them or the session,
   * on no surface, may keep a snapshot of them.
   */
  function request() {
    if (bound && (columnsOf.size > 0 || !isOnSurface)) {
      schedule(bound)
    }
  }

  on('session.start', async ($, e, next) => {
    bound = {
      root: $.plugin.root,
      now: () => $.clock.now(),
      after: (ms, fn) => $.clock.after(ms, fn),
      every: (ms, fn) => $.clock.every(ms, fn),
      run: (argv, init) => $.process.run(argv, init),
      invalidate: () => $.ui.invalidate('ui.render'),
      sessionId: () => $.session.id(),
      cwd: () => $.session.cwd(),
      projectRoot: () => $.session.root(),
      model: () => $.session.model(),
      version: () => $.session.version(),
      usage: () => $.session.usage(),
      surfaces: () => $.session.surfaces(),
      settings: () => $.settings.read(),
      exists: path => $.fs.exists(path),
      readFile: path => $.fs.read(path),
      writeFile: (path, text) => $.fs.write(path, text),
      configDir: () => $.env.get('CLAUDE_CONFIG_DIR'),
      home: async () =>
        (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')),
    }

    isOnSurface ||= e.surface !== null

    isTerminalFree = await $.settings.read().then(
      settings => !hasOwnStatusLine(settings),
      () => false,
    )

    ticking?.cancel()
    ticking = refreshMs === undefined ? null : bound.every(refreshMs, request)

    // The band does not depend on the command: a name already taken costs
    // the command alone
    await $.command
      .register({
        name: 'token-meter',
        description: 'Show the status lines as text, and where they are configured',
      })
      .catch(() => undefined)

    // A band drawn before this hook bound the host was passed on, and that
    // answer stands until something asks for it again
    $.ui.invalidate('ui.render')

    // Where nothing draws, a snapshot's reader is shown the lines from the start
    request()

    return next(e)
  })

  on('command.run', { command: 'token-meter' }, async () => {
    if (!bound) {
      return { text: 'Token Meter: the session has not started' }
    }

    await refresh(bound).catch(() => undefined)

    return {
      text: reportOf(status ?? { failure: 'the engine has not run' }, {
        engine: engineOf(bound, runtime),
        settingsPath: engineSettingsPathIn(await bound.home()),
      }),
    }
  })

  on('session.attach', ($, e, next) => {
    isOnSurface = true

    return next(e)
  })

  on('session.detach', ($, e, next) => {
    columnsOf.delete(e.surface)

    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined) {
      request()
    }

    return next(e)
  })

  on('classic.SessionStart', ($, e, next) => {
    note(e)
    request()

    return next(e)
  })

  on('classic.PostCompact', ($, e, next) => {
    note(e)
    request()

    return next(e)
  })

  on('classic.PostModelSwitch', ($, e, next) => {
    note(e)
    request()

    return next(e)
  })

  on('classic.CwdChanged', ($, e, next) => {
    note(e)
    request()

    return next(e)
  })

  on('classic.UserPromptSubmit', ($, e, next) => {
    note(e)

    return next(e)
  })

  on('classic.Stop', ($, e, next) => {
    note(e)

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, ($, e, next) => {
    isOnSurface = true

    if (!bound || e.props.hasSurvey || !drawsOn(e.surface)) {
      return next(e)
    }

    // The desktop app lays text out in a proportional font, where a width in
    // cells means nothing: the engine is given room no line reaches, and the
    // band spaces the padded groups itself
    const columns =
      e.surface === 'desktop' ? UNBOUNDED_COLUMNS : e.props.bodyColumns

    const isResized = columnsOf.get(e.surface) !== columns

    columnsOf.set(e.surface, columns)

    // The first draw starts the first run; after that only a new width does
    if (isResized || (status === null && running === null)) {
      schedule(bound)
    }

    // Nothing to show yet, or an engine with no line to show: the band stays
    // Claude Code's own
    if (status === null || ('lines' in status && status.lines.length === 0)) {
      return next(e)
    }

    return bandOf($.ui.resolve(e), status)
  })
}
