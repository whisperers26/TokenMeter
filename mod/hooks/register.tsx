import type { ProcessRunInit, ProcessRunResult, Register, Timer } from 'claude-code'

import { parseAnsi } from './ansi'
import type { Line } from './ansi'

/** The engine's entry point, under the plugin's own folder. */
const ENGINE_ENTRY = 'engine/ccstatusline.js'

/**
 * What the mod asks of the engine it runs in, bound once at `session.start`
 * so that work outliving a hook's dispatch (a timer, a refresh) can ask too.
 */
type Host = {
  root: string
  after: (ms: number, fn: () => void) => Timer
  run: (
    argv: readonly string[],
    init?: ProcessRunInit,
  ) => Promise<ProcessRunResult>
  invalidate: () => void
}

export const register: Register = on => {
  let host: Host | null = null
  let lines: Line[] | null = null
  let queued: Timer | null = null

  async function refresh(engine: Host) {
    const ran = await engine.run(['node', `${engine.root}/${ENGINE_ENTRY}`], {
      stdin: '{}',
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
      after: (ms, fn) => $.clock.after(ms, fn),
      run: (argv, init) => $.process.run(argv, init),
      invalidate: () => $.ui.invalidate('ui.render'),
    }

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
