import type {
  PluginOptions,
  Register,
  RenderSurface,
  Settings,
  Timer,
} from 'claude-code'

import { bandOf } from './band'
import { editLayout, isEditAsked } from './edit'
import { effortLevelOf, effortOf, effortSaidBy } from './effort'
import type { Host } from './host'
import { installJetBrains, isJetBrainsAsked } from './jetbrains'
import { reportOf } from './report'
import { keepSnapshot, snapshotPathOf } from './snapshot'
import { engineOf, engineSettingsPathIn, statusOf } from './status'
import type { Status, Told } from './status'
import { alignTerminal, editOffOf, widenTerminal } from './terminal'
import { isUninstallAsked, uninstall } from './uninstall'
import { isUpdateAsked, update } from './update'

/** What runs the engine unless the person names another runtime. */
const DEFAULT_RUNTIME = 'node'

/** How often the lines are run again while nothing else asks, in seconds. */
const DEFAULT_REFRESH_SECONDS = 30

/** A width, in cells, wider than any status line. */
const UNBOUNDED_COLUMNS = 1000

/**
 * How often Claude Code's flag layer is looked at for a change of effort, in
 * milliseconds: a read in this process, and no run of the engine.
 */
const SETTINGS_WATCH_MS = 2000

/** The pick a level leaving the flag layer stands for: see `watchEffort`. */
const HIDDEN_PICK = 'max'

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
  let watching: Timer | null = null
  let running: Promise<void> | null = null
  let isStale = false
  let told: Told = {}

  /** The level the flag layer held when last looked at: a host's pick. */
  let flagEffort: string | undefined

  /** The effort the settings gave the session when last looked at. */
  let effectiveEffort: string | undefined

  // A terminal shows these lines under its prompt with a status line of its
  // own: ccstatusline itself, which the mod installs where there is none. The
  // band is the desktop app's
  const drawsOn = (surface: RenderSurface) => surface === 'desktop'

  /** Whether this session has looked at the terminal's ccstatusline. */
  let isTerminalLookedAt = false

  /** The surfaces drawing the band. */
  const drawing = new Set<RenderSurface>()

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

        // The desktop app lays text out in a proportional font, where a width
        // in cells means nothing, and a snapshot's reader lays the lines out
        // itself: for both the engine is given room no line reaches, and what
        // shows the lines spaces the padded groups
        const columns =
          drawing.size > 0 || snapshotPath !== undefined
            ? UNBOUNDED_COLUMNS
            : undefined

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
    if (drawing.size > 0 || (await snapshotPathFor(host)) !== undefined) {
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
    if (bound && (drawing.size > 0 || !isOnSurface)) {
      schedule(bound)
    }
  }

  /**
   * Looks at where the session's effort is set, and asks for fresh lines when
   * it is not the one last seen. In-process reads, not a run of the engine.
   *
   * A host that sets the effort puts its pick in the flag layer, which holds a
   * level the persisted settings can hold (low to xhigh) and is empty for `max`
   * and for the model's own: the merged settings then fall back to the settings
   * file's level, which is no word on the session. A level that leaves the
   * layer is told as max, the pick a person sets by hand that the layer cannot
   * hold; the turn that follows says the level it ran with.
   *
   * A terminal's `/effort` picker saves the level for the model in the user's
   * settings instead, and a switch of model moves to that model's saved level:
   * with the layer unchanged, the level the settings give is the session's.
   */
  function watchEffort() {
    const host = bound

    if (!host || (drawing.size === 0 && isOnSurface)) {
      return
    }

    void Promise.all([host.settings('flag'), host.settings(), host.model()])
      .then(([flag, settings, model]) => {
        const level = effortLevelOf(flag)
        const effective = effortOf(settings, flag, model)

        if (level !== flagEffort) {
          flagEffort = level
          effectiveEffort = effective
          told = { ...told, effort: level ?? HIDDEN_PICK }
          request()
        } else if (effective !== effectiveEffort) {
          effectiveEffort = effective
          told = { ...told, effort: effective }
          request()
        }
      })
      .catch(() => undefined)
  }

  on('session.start', async ($, e, next) => {
    bound = {
      root: $.plugin.root,
      now: () => $.clock.now(),
      after: (ms, fn) => $.clock.after(ms, fn),
      every: (ms, fn) => $.clock.every(ms, fn),
      run: (argv, init) => $.process.run(argv, init),
      invalidate: () => $.ui.invalidate('ui.render'),
      // As with the version below: an older Claude Code rejects
      ask: async (question, options) => $.ui.ask(question, options),
      log: text => $.ui.log(text),
      recall: key => $.store.get(key),
      remember: (key, value) => $.store.set(key, value),
      sessionId: () => $.session.id(),
      cwd: () => $.session.cwd(),
      projectRoot: () => $.session.root(),
      model: () => $.session.model(),
      // An older Claude Code has no such call: asked there, it rejects
      version: async () => $.session.version(),
      usage: () => $.session.usage(),
      surfaces: () => $.session.surfaces(),
      settings: source =>
        source === undefined ? $.settings.read() : $.settings.read({ source }),
      exists: path => $.fs.exists(path),
      readFile: path => $.fs.read(path),
      writeFile: (path, text) => $.fs.write(path, text),
      configDir: () => $.env.get('CLAUDE_CONFIG_DIR'),
      home: async () =>
        (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')),
    }

    isOnSurface ||= e.surface !== null

    const settings = await $.settings.read().catch(() => undefined)
    const flag = await $.settings.read({ source: 'flag' }).catch(() => undefined)

    flagEffort = flag && effortLevelOf(flag)
    effectiveEffort =
      settings && effortOf(settings, flag ?? {}, await $.session.model().catch(() => ''))

    ticking?.cancel()
    ticking = refreshMs === undefined ? null : bound.every(refreshMs, request)

    watching?.cancel()
    watching = bound.every(SETTINGS_WATCH_MS, watchEffort)

    // The band does not depend on the command: a name already taken costs
    // the command alone
    await $.command
      .register({
        name: 'ccstatusline-desktop',
        description:
          'Show the status lines as text, and where they are configured; with "edit", open the configurator; with "update", update the mod and the JetBrains plugin; with "uninstall", uninstall either or both; with "jetbrains", install the JetBrains plugin',
        argumentHint: '[edit|update|uninstall|jetbrains]',
      })
      .catch(() => undefined)

    // A band drawn before this hook bound the host was passed on, and that
    // answer stands until something asks for it again
    $.ui.invalidate('ui.render')

    // Where nothing draws, a snapshot's reader is shown the lines from the start
    request()

    return next(e)
  })

  on('command.run', { command: 'ccstatusline-desktop' }, async ($, e) => {
    if (!bound) {
      return { text: 'ccstatusline desktop: the session has not started' }
    }

    if (isJetBrainsAsked(e.args)) {
      return { text: await installJetBrains(bound, runtime) }
    }

    if (isEditAsked(e.args)) {
      // A layout is about to be saved to the file the terminal's own
      // ccstatusline reads: the moment to ask again about one out of range
      const { standing, aligned } = await alignTerminal(bound, runtime, 'again')

      // One left out of range reads the file a save here would write: edit is off
      const answered =
        (standing && editOffOf(standing)) ?? (await editLayout(bound, runtime))

      return { text: aligned ? `${aligned.said}\n\n${answered}` : answered }
    }

    if (isUpdateAsked(e.args)) {
      // The terminal's own ccstatusline is brought up to date before the mod
      // is, an older one without a question: one left out of range does not
      // hold the update back
      const { aligned } = await alignTerminal(bound, runtime, 'updating')
      const updated = await update(bound, runtime)

      return { text: aligned ? `${aligned.said}\n\n${updated}` : updated }
    }

    if (isUninstallAsked(e.args)) {
      return { text: await uninstall(bound, runtime) }
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
    drawing.delete(e.surface)

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

  // The terminal's status line command runs again once `/effort` has printed
  // its answer, and shows the level it set: no event of a turn says it first
  on('command.run', { command: 'effort' }, async ($, e, next) => {
    const answered = await next(e)
    const said = effortSaidBy(answered.text ?? '')

    if (said !== undefined) {
      told = { ...told, effort: said ?? undefined }
      request()
    }

    return answered
  })

  // A turn's first request names the effort it is sent with: the one place a
  // level the settings cannot hold (max) is said before the turn has ended
  on('turn.step', async function* ($, e, next) {
    if (
      e.agentId === undefined &&
      typeof e.effort === 'string' &&
      e.effort !== told.effort
    ) {
      told = { ...told, effort: e.effort }
      request()
    }

    return yield* next(e)
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

    // A surface that draws has a person at it to ask: once a session, and
    // from outside the draw, which does not wait on a dialog
    if (bound && !isTerminalLookedAt) {
      const host = bound

      isTerminalLookedAt = true

      host.after(0, () => {
        void alignTerminal(host, runtime, 'once')
          .then(({ aligned }) => aligned && host.log(aligned.said))
          // After it: an install just made sets the width itself
          .then(() => widenTerminal(host, runtime))
          .then(said => said !== undefined && host.log(said))
          .catch(() => undefined)
      })
    }

    if (!bound || e.props.hasSurvey || !drawsOn(e.surface)) {
      return next(e)
    }

    const isFirstDraw = !drawing.has(e.surface)

    drawing.add(e.surface)

    // A surface's first draw starts a run; after that a draw starts none
    // unless there is nothing to show and no run under way
    if (isFirstDraw || (status === null && running === null)) {
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
