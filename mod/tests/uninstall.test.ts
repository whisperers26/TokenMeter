import { describe, expect, test } from 'claude-code/testing'

import type { Host } from '../hooks/host'
import { isUninstallAsked, uninstall } from '../hooks/uninstall'

type Run = Host['run']
type Ran = Awaited<ReturnType<Run>>

const ROOT = '/plugins/ccstatusline-desktop'
const MOD_UNINSTALLER = `${ROOT}/scripts/uninstall-mod.mjs`
const JETBRAINS_UNINSTALLER = `${ROOT}/scripts/uninstall-jetbrains.mjs`

const MOD_GONE = '✔ Successfully uninstalled plugin: ccstatusline-desktop (scope: user)'
const PLUGIN_GONE = 'Rider2026.2: uninstalled'

/** What is said after the mod's own uninstall, whatever came of it. */
const KEPT =
  'This session keeps the band until it ends. Your layout in `~/.config/ccstatusline/settings.json` stays.'

const ended = (exitCode: number, stdout: string, stderr = ''): Ran => ({
  exitCode,
  stdout,
  stderr,
  isStdoutTruncated: false,
  isStderrTruncated: false,
})

/** A machine where both uninstalls are made. */
const works: Run = async ([, script]) =>
  script === MOD_UNINSTALLER ? ended(0, `${MOD_GONE}\n`) : ended(0, `${PLUGIN_GONE}\n`)

/** A host whose person answers the dialog with `answer`, or dismisses it. */
function hostOf(answer: string | undefined, run: Run = works) {
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

describe('uninstall', () => {
  test('uninstall is asked for by that word alone, in any case', () => {
    expect(['uninstall', ' Uninstall ', '', 'update', 'uninstall mod'].map(isUninstallAsked)).toEqual([
      true,
      true,
      false,
      false,
      false,
    ])
  })

  test('asks what to uninstall before it runs anything', async () => {
    const { host, asked } = hostOf('Not now')

    await uninstall(host, 'node')

    expect(asked).toEqual([
      [
        'What should be uninstalled?',
        { header: 'Uninstall', options: ['The mod', 'The JetBrains plugin', 'Both', 'Not now'] },
      ],
    ])
  })

  test('the mod alone is uninstalled by its script, on the runtime the engine runs on', async () => {
    const { host, runs } = hostOf('The mod')

    expect([await uninstall(host, 'bun'), runs]).toEqual([
      `${MOD_GONE}\n\n${KEPT}`,
      [['bun', MOD_UNINSTALLER]],
    ])
  })

  test('the JetBrains plugin alone is taken out of the IDEs, the mod left', async () => {
    const { host, runs } = hostOf('The JetBrains plugin')

    expect([await uninstall(host, 'node'), runs]).toEqual([
      PLUGIN_GONE,
      [['node', JETBRAINS_UNINSTALLER]],
    ])
  })

  test("both: the JetBrains plugin first, while the mod's script for it is still there", async () => {
    const { host, runs } = hostOf('Both')

    expect([await uninstall(host, 'node'), runs]).toEqual([
      `${PLUGIN_GONE}\n\n${MOD_GONE}\n\n${KEPT}`,
      [
        ['node', JETBRAINS_UNINSTALLER],
        ['node', MOD_UNINSTALLER],
      ],
    ])
  })

  test('an uninstall that failed says why', async () => {
    const { host } = hostOf('The mod', async () =>
      ended(1, '', 'ccstatusline desktop: the mod was not uninstalled (the claude command was not found)\n'),
    )

    expect(await uninstall(host, 'node')).toBe(
      `ccstatusline desktop: the mod was not uninstalled (the claude command was not found)\n\n${KEPT}`,
    )
  })

  test('an uninstaller that did not run says so', async () => {
    const { host } = hostOf('The JetBrains plugin', async () => {
      throw new Error("ENOENT: Command 'node' not found")
    })

    expect(await uninstall(host, 'node')).toBe(
      "ccstatusline desktop: the JetBrains plugin was not uninstalled (ENOENT: Command 'node' not found)",
    )
  })

  test('on Not now, a dismissed dialog, or nobody to ask, nothing runs and it says how to by hand', async () => {
    const left = await Promise.all(
      ['Not now', undefined, 'everything'].map(async answer => {
        const { host, runs } = hostOf(answer)

        return [await uninstall(host, 'node'), runs]
      }),
    )

    expect(left).toEqual(
      left.map(() => [
        'Nothing was uninstalled. To uninstall the mod yourself, run this in a terminal: `claude plugin uninstall ccstatusline-desktop@ccstatusline-desktop`.',
        [],
      ]),
    )
  })
})
