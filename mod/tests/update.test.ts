import { describe, expect, test } from 'claude-code/testing'

import type { Host } from '../hooks/host'
import { isUpdateAsked, update } from '../hooks/update'

type Run = Host['run']
type Ran = Awaited<ReturnType<Run>>

const ROOT = '/plugins/ccstatusline-desktop'
const UPDATER = `${ROOT}/scripts/update-mod.mjs`
const INSTALLER = `${ROOT}/scripts/install-jetbrains.mjs`

const UPDATED = '✔ Plugin "ccstatusline-desktop" updated from 1.0.0 to 1.1.0 for scope user.'

const ended = (exitCode: number, stdout: string, stderr = ''): Ran => ({
  exitCode,
  stdout,
  stderr,
  isStdoutTruncated: false,
  isStderrTruncated: false,
})

/** A machine where the mod updates and the installer finds one IDE. */
const works: Run = async ([, script]) =>
  script === UPDATER ? ended(0, `${UPDATED}\n`) : ended(0, 'Rider2026.2: installed\n')

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

describe('update', () => {
  test('update is asked for by that word alone, in any case', () => {
    expect(['update', ' Update ', '', 'edit', 'update mod'].map(isUpdateAsked)).toEqual([
      true,
      true,
      false,
      false,
      false,
    ])
  })

  test('asks what to update before it runs anything', async () => {
    const { host, asked } = hostOf('Not now')

    await update(host, 'node')

    expect(asked).toEqual([
      [
        'What should be updated to the latest release?',
        {
          header: 'Update',
          options: ['The mod', 'The JetBrains plugin', 'Both', 'Not now'],
        },
      ],
    ])
  })

  test('the mod alone is updated by the updater, on the runtime the engine runs on', async () => {
    const { host, runs } = hostOf('The mod')

    expect([await update(host, 'bun'), runs]).toEqual([
      `${UPDATED}\nA new version loads in the sessions started after this one.`,
      [['bun', UPDATER]],
    ])
  })

  test("the JetBrains plugin alone is installed at the mod's own version", async () => {
    const { host, runs } = hostOf('The JetBrains plugin')

    expect([await update(host, 'node'), runs]).toEqual([
      'Rider2026.2: installed',
      [['node', INSTALLER]],
    ])
  })

  test("both: the mod first, then the plugin of the latest release, which is the mod's new one", async () => {
    const { host, runs } = hostOf('Both')

    expect([await update(host, 'node'), runs]).toEqual([
      `${UPDATED}\nA new version loads in the sessions started after this one.\n\nRider2026.2: installed`,
      [
        ['node', UPDATER],
        ['node', INSTALLER, '--latest'],
      ],
    ])
  })

  test("both, where the mod was not updated: the plugin stays at the mod's own version", async () => {
    const { host, runs } = hostOf('Both', async ([, script]) =>
      script === UPDATER
        ? ended(1, '', 'ccstatusline desktop: the mod was not updated (the claude command was not found)\n')
        : ended(0, 'Rider2026.2: installed\n'),
    )

    const text = await update(host, 'node')

    expect([text.split('\n'), runs]).toEqual([
      [
        'ccstatusline desktop: the mod was not updated (the claude command was not found)',
        'To update it yourself, run these in a terminal: `claude plugin marketplace update ccstatusline-desktop`, then `claude plugin update ccstatusline-desktop@ccstatusline-desktop`',
        '',
        'Rider2026.2: installed',
      ],
      [
        ['node', UPDATER],
        ['node', INSTALLER],
      ],
    ])
  })

  test('an updater that did not run says so, and how to update by hand', async () => {
    const { host } = hostOf('The mod', async () => {
      throw new Error("ENOENT: Command 'node' not found")
    })

    expect((await update(host, 'node')).split('\n')[0]).toBe(
      "ccstatusline desktop: the mod was not updated (ENOENT: Command 'node' not found)",
    )
  })

  test('on Not now, a dismissed dialog, or nobody to ask, nothing runs and it says how to by hand', async () => {
    for (const answer of ['Not now', undefined]) {
      const { host, runs } = hostOf(answer)

      expect([await update(host, 'node'), runs]).toEqual([
        'Nothing was updated. To update the mod yourself, run these in a terminal: `claude plugin marketplace update ccstatusline-desktop`, then `claude plugin update ccstatusline-desktop@ccstatusline-desktop`. For the JetBrains plugin, run `/ccstatusline-desktop jetbrains`.',
        [],
      ])
    }
  })
})
