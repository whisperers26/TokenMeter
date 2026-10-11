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
import { engineOf, engineSettingsPathIn, statusOf } from './status'
import type { Status, Told } from './status'

/** The slash command that reports the lines as text. */
const COMMAND = 'token-meter'

/** What runs the engine unless the person names another runtime. */
const DEFAULT_RUNTIME = 'node'

/** How often the lines are run again while nothing else asks, in seconds. */
const DEFAULT_REFRESH_SECONDS = 30

/** The shortest period the timer takes: each tick starts a process. */
const MIN_REFRESH_SECONDS = 5

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

  function note(e: ToldBy) {
    told = {
      ...told,
      ...(e.transcript_path !== '' && { transcriptPath: e.transcript_path }),
      ...(e.effort !== undefined && { effort: e.effort.level }),
    }
  }

  async function run(host: Host) {
    try {
      do {
        isStale = false

        status = await statusOf(host, {
          runtime,
          told,
          columns:
            columnsOf.size === 0 ? undefined : Math.min(...columnsOf.values()),
        })

        host.invalidate()
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

  function schedule(host: Host) {
    queued ??= host.after(0, () => {
      queued = null
      void refresh(host)
    })
  }

  /** Asks for fresh lines, while some surface is drawing them. */
  function request() {
    if (bound && columnsOf.size > 0) {
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
      settings: () => $.settings.read(),
      exists: path => $.fs.exists(path),
      readFile: path => $.fs.read(path),
      configDir: () => $.env.get('CLAUDE_CONFIG_DIR'),
      home: async () =>
        (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')),
    }

    isTerminalFree = await $.settings.read().then(
      settings => !hasOwnStatusLine(settings),
      () => false,
    )

    ticking?.cancel()
    ticking = refreshMs === undefined ? null : bound.every(refreshMs, request)

    await $.command.register({
      name: COMMAND,
      description: 'Show the status lines as text, and where they are configured',
    })

    return next(e)
  })

  on('command.run', { command: 'token-meter' }, async () => {
    if (!bound) {
      return { text: 'Token Meter: the session has not started' }
    }

    await refresh(bound)

    return {
      text: reportOf(status ?? { failure: 'the engine has not run' }, {
        engine: engineOf(bound, runtime),
        settingsPath: engineSettingsPathIn(await bound.home()),
      }),
    }
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
    if (!bound || e.props.hasSurvey || !drawsOn(e.surface)) {
      return next(e)
    }

    const isResized = columnsOf.get(e.surface) !== e.props.bodyColumns

    columnsOf.set(e.surface, e.props.bodyColumns)

    if (isResized || status === null) {
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
