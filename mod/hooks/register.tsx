import type {
  ProcessRunInit,
  ProcessRunResult,
  Register,
  RenderSurface,
  SessionUsage,
  SessionVersion,
  Settings,
  Timer,
} from 'claude-code'

import { parseAnsi } from './ansi'
import type { Line } from './ansi'
import { pathIn } from './path-in'
import { payloadOf } from './payload'
import type { SessionFacts } from './payload'
import { transcriptPathIn } from './transcript'
import { flexReserveOf } from './width'

/** The engine's entry point, under the plugin's own folder. */
const ENGINE_ENTRY = 'engine/ccstatusline.js'

/** The engine's settings file, under the home directory on every platform. */
const ENGINE_SETTINGS = ['.config', 'ccstatusline', 'settings.json'] as const

/**
 * What the mod asks of the engine it runs in, bound once at `session.start`
 * so that work outliving a hook's dispatch (a timer, a refresh) can ask too.
 */
type Host = {
  root: string
  now: () => Promise<number>
  after: (ms: number, fn: () => void) => Timer
  run: (
    argv: readonly string[],
    init?: ProcessRunInit,
  ) => Promise<ProcessRunResult>
  invalidate: () => void
  sessionId: () => Promise<string>
  cwd: () => Promise<string>
  projectRoot: () => Promise<string>
  model: () => Promise<string>
  version: () => Promise<SessionVersion>
  usage: () => Promise<SessionUsage>
  settings: () => Promise<Settings>
  exists: (path: string) => Promise<boolean>
  readFile: (path: string) => Promise<string>
  configDir: () => Promise<string | undefined>
  home: () => Promise<string | undefined>
}

/** What a classic hook event carries that the status line shows. */
type Told = { transcriptPath?: string; effort?: string }

type ToldBy = { transcript_path: string; effort?: { level: string } }

/** Whether Claude Code's settings run a status line command of their own. */
function hasOwnStatusLine({ statusLine }: Settings): boolean {
  const command =
    typeof statusLine === 'object' && statusLine !== null
      ? (statusLine as { command?: unknown }).command
      : undefined

  return typeof command === 'string' && command.trim() !== ''
}

export const register: Register = on => {
  let host: Host | null = null
  let lines: Line[] | null = null
  let queued: Timer | null = null
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

  /**
   * The session's transcript: the one an event named, else the file Claude
   * Code would have written for this session, when it is there.
   */
  async function transcriptOf(engine: Host, root: string, sessionId: string) {
    if (told.transcriptPath !== undefined) {
      return told.transcriptPath
    }

    const home = await engine.home()

    const configDir =
      (await engine.configDir()) ??
      (home === undefined ? undefined : pathIn(home, '.claude'))

    if (configDir === undefined) {
      return undefined
    }

    const guess = transcriptPathIn(configDir, root, sessionId)

    return (await engine.exists(guess)) ? guess : undefined
  }

  async function factsOf(engine: Host): Promise<SessionFacts> {
    const [sessionId, cwd, root, model, { version }, usage, now, settings] =
      await Promise.all([
        engine.sessionId(),
        engine.cwd(),
        engine.projectRoot(),
        engine.model(),
        engine.version(),
        engine.usage(),
        engine.now(),
        engine.settings(),
      ])

    const transcriptPath = await transcriptOf(engine, root, sessionId)
    const { outputStyle } = settings

    return {
      sessionId,
      cwd,
      root,
      model,
      version,
      now,
      usage,
      ...(transcriptPath !== undefined && { transcriptPath }),
      ...(told.effort !== undefined && { effort: told.effort }),
      ...(typeof outputStyle === 'string' && { outputStyle }),
    }
  }

  /**
   * The width to tell the engine so that its lines fill the narrowest band
   * drawn: that band's columns, plus what the engine will hold back of them.
   */
  async function widthOf(engine: Host, contextPercent: number | undefined) {
    if (columnsOf.size === 0) {
      return undefined
    }

    const home = await engine.home()

    const settingsText =
      home === undefined
        ? undefined
        : await engine
            .readFile(pathIn(home, ...ENGINE_SETTINGS))
            .catch(() => undefined)

    return (
      Math.min(...columnsOf.values()) +
      flexReserveOf(settingsText, contextPercent)
    )
  }

  async function refresh(engine: Host) {
    const facts = await factsOf(engine)
    const width = await widthOf(engine, facts.usage.context.percent)

    const ran = await engine.run(['node', pathIn(engine.root, ENGINE_ENTRY)], {
      stdin: JSON.stringify(payloadOf(facts)),
      ...(width !== undefined && { env: { CCSTATUSLINE_WIDTH: String(width) } }),
    })

    lines = parseAnsi(ran.stdout)
    engine.invalidate()
  }

  function schedule(engine: Host) {
    queued ??= engine.after(0, () => {
      queued = null
      void refresh(engine)
    })
  }

  on('session.start', async ($, e, next) => {
    host = {
      root: $.plugin.root,
      now: () => $.clock.now(),
      after: (ms, fn) => $.clock.after(ms, fn),
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

    return next(e)
  })

  on('classic.SessionStart', ($, e, next) => {
    note(e)

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
    if (!host || e.props.hasSurvey || !drawsOn(e.surface)) {
      return next(e)
    }

    const isResized = columnsOf.get(e.surface) !== e.props.bodyColumns

    columnsOf.set(e.surface, e.props.bodyColumns)

    if (isResized || lines === null) {
      schedule(host)
    }

    if (lines === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {lines.map(line => (
          <Text wrap="truncate-end">
            {line.map(({ text, href: _href, ...style }) => (
              <Text {...style}>{text}</Text>
            ))}
          </Text>
        ))}
      </Box>
    )
  })
}
