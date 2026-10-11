import type {
  ProcessRunInit,
  ProcessRunResult,
  Register,
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

/** The engine's entry point, under the plugin's own folder. */
const ENGINE_ENTRY = 'engine/ccstatusline.js'

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
  configDir: () => Promise<string | undefined>
  home: () => Promise<string | undefined>
}

/** What a classic hook event carries that the status line shows. */
type Told = { transcriptPath?: string; effort?: string }

type ToldBy = { transcript_path: string; effort?: { level: string } }

export const register: Register = on => {
  let host: Host | null = null
  let lines: Line[] | null = null
  let queued: Timer | null = null
  let told: Told = {}

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

  async function refresh(engine: Host) {
    const payload = payloadOf(await factsOf(engine))

    const ran = await engine.run(['node', pathIn(engine.root, ENGINE_ENTRY)], {
      stdin: JSON.stringify(payload),
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

  on('session.start', ($, e, next) => {
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
      configDir: () => $.env.get('CLAUDE_CONFIG_DIR'),
      home: async () =>
        (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')),
    }

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
    if (!host) {
      return next(e)
    }

    if (lines === null) {
      schedule(host)

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
