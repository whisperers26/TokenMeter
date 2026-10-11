import type { Register, RenderSurface, Settings, Timer } from 'claude-code'

import type { Line } from './ansi'
import type { Host } from './host'
import { statusLinesOf } from './status'
import type { Told } from './status'

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
  let bound: Host | null = null
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

  async function refresh(host: Host) {
    lines = await statusLinesOf(host, {
      told,
      columns: columnsOf.size === 0 ? undefined : Math.min(...columnsOf.values()),
    })

    host.invalidate()
  }

  function schedule(host: Host) {
    queued ??= host.after(0, () => {
      queued = null
      void refresh(host)
    })
  }

  on('session.start', async ($, e, next) => {
    bound = {
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
    if (!bound || e.props.hasSurvey || !drawsOn(e.surface)) {
      return next(e)
    }

    const isResized = columnsOf.get(e.surface) !== e.props.bodyColumns

    columnsOf.set(e.surface, e.props.bodyColumns)

    if (isResized || lines === null) {
      schedule(bound)
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
