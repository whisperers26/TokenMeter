import type { Register, RenderSurface, Settings, Timer } from 'claude-code'

import { bandOf } from './band'
import type { Host } from './host'
import { statusOf } from './status'
import type { Status, Told } from './status'

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
  let status: Status | null = null
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
    status = await statusOf(host, {
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
