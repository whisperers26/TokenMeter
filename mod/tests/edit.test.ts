import { describe, expect, test } from 'claude-code/testing'

import { editLayout, isEditAsked } from '../hooks/edit'
import type { Host } from '../hooks/host'

type Run = Host['run']

const ROOT = 'C:\\Users\\me\\.claude\\plugins\\ccstatusline-desktop'

/** How the configurator is opened by hand, as the answer spells it. */
const BY_HAND =
  'run this in a terminal: `node "C:\\Users\\me\\.claude\\plugins\\ccstatusline-desktop\\engine\\ccstatusline.js"`'

const ended = (exitCode: number, stdout: string, stderr = '') => ({
  exitCode,
  stdout,
  stderr,
  isStdoutTruncated: false,
  isStderrTruncated: false,
})

/** A host whose person answers the dialog with `answer`, or dismisses it. */
function hostOf(answer: string | undefined, run: Run = async () => ended(0, 'opened\n')) {
  const asked: unknown[][] = []
  const runs: (readonly string[])[] = []

  const host = {
    root: ROOT,
    ask: async (...args: unknown[]) => {
      asked.push(args)

      if (answer === undefined) {
        throw new Error('dismissed')
      }

      return answer
    },
    run: (async (argv, init) => {
      runs.push(argv)

      return run(argv, init)
    }) as Run,
  } as Host

  return { host, asked, runs }
}

describe('edit', () => {
  test('edit is asked for by that word alone, in any case', () => {
    expect(['edit', ' Edit ', '', 'jetbrains', 'edit now'].map(isEditAsked)).toEqual([
      true,
      true,
      false,
      false,
      false,
    ])
  })

  test('asks before it opens anything, with the two answers', async () => {
    const { host, asked } = hostOf('Not now')

    await editLayout(host, 'node')

    expect(asked).toEqual([
      [
        'Open the ccstatusline configurator in a new terminal window?',
        { header: 'Layout', options: ['Open the configurator', 'Not now'] },
      ],
    ])
  })

  test('opens the configurator on the runtime the engine runs on, and says what the opener said', async () => {
    const { host, runs } = hostOf('Open the configurator')

    expect([await editLayout(host, 'bun'), runs]).toEqual([
      'opened',
      [['bun', `${ROOT}\\scripts\\open-configurator.mjs`]],
    ])
  })

  test('opens nothing on Not now, and says how to open it by hand', async () => {
    const { host, runs } = hostOf('Not now')

    const text = await editLayout(host, 'node')

    expect([runs, text.startsWith('The configurator was left closed.'), text.includes(BY_HAND)]).toEqual([
      [],
      true,
      true,
    ])
  })

  test('where nobody can be asked, or the dialog is dismissed, it opens nothing either', async () => {
    const { host, runs } = hostOf(undefined)

    const text = await editLayout(host, 'node')

    expect([runs, text.includes(BY_HAND)]).toEqual([[], true])
  })

  test('an opener that found no terminal says why, then how to open it by hand', async () => {
    const { host } = hostOf('Open the configurator', async () =>
      ended(1, '', 'ccstatusline desktop: the configurator was not opened (no display)\n'),
    )

    expect(await editLayout(host, 'node')).toBe(
      `ccstatusline desktop: the configurator was not opened (no display)\nTo open it yourself, ${BY_HAND}`,
    )
  })

  test('an opener that did not run says so, then how to open it by hand', async () => {
    const { host } = hostOf('Open the configurator', async () => {
      throw new Error("ENOENT: Command 'node' not found")
    })

    expect(await editLayout(host, 'node')).toBe(
      `ccstatusline desktop: the configurator was not opened (ENOENT: Command 'node' not found)\nTo open it yourself, ${BY_HAND}`,
    )
  })
})
