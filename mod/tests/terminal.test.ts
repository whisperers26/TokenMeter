import type { Settings } from 'claude-code'
import { describe, expect, test } from 'claude-code/testing'

import type { Host } from '../hooks/host'
import { alignTerminal, mismatchOf } from '../hooks/terminal'

type Run = Host['run']
type Ran = Awaited<ReturnType<Run>>

const ROOT = '/plugins/ccstatusline-desktop'
const SCRIPT = `${ROOT}/scripts/terminal-ccstatusline.mjs`

const UPGRADED = "ccstatusline 2.2.32 is installed globally with npm: the terminal's status line runs it."

const ended = (exitCode: number, stdout: string, stderr = ''): Ran => ({
  exitCode,
  stdout,
  stderr,
  isStdoutTruncated: false,
  isStderrTruncated: false,
})

type Machine = {
  /** The `statusLine` command of Claude Code's settings; left out, there is none. */
  command?: string
  /** What the script's look finds, as it prints it. */
  found?: unknown
  /** What the person answers the dialog with; left out, they dismiss it. */
  answer?: string
  /** What the store keeps as the mismatch last answered about. */
  answered?: unknown
  /** How a change ends; left out, it is made. */
  change?: () => Ran | Promise<Ran>
}

/** A host on a machine whose terminal runs what `found` says, the engine at 2.2.32. */
function hostOf({ command = 'ccstatusline', found, answer, answered, change }: Machine) {
  const asked: unknown[][] = []
  const runs: (readonly string[])[] = []
  const store = new Map<string, unknown>(answered === undefined ? [] : [['terminalAnswered', answered]])

  const host: Pick<Host, 'root' | 'settings' | 'readFile' | 'recall' | 'remember' | 'ask' | 'run'> = {
    root: ROOT,
    settings: async (): Promise<Settings> =>
      command === '' ? {} : { statusLine: { type: 'command', command } },
    readFile: async () => '2.2.32\n',
    recall: async (key: string) => store.get(key),
    remember: async (key: string, value: unknown) => {
      store.set(key, value)
    },
    ask: async (...args: unknown[]) => {
      asked.push(args)

      if (answer === undefined) {
        throw new Error('dismissed')
      }

      return answer
    },
    run: (async argv => {
      runs.push(argv)

      return argv[2] === 'detect'
        ? ended(0, `${JSON.stringify(found ?? { kind: 'none' })}\n`)
        : (change?.() ?? ended(0, `${UPGRADED}\n`))
    }) as Run,
  }

  return { host: host as Host, asked, runs, store }
}

const OLDER = { kind: 'global', manager: 'npm', version: '2.2.20' }
const NEWER = { kind: 'runner', runner: 'npx', version: '2.3.0' }

describe('terminal', () => {
  test('a version before the settings format, or after the engine, is a mismatch; one between is not', async () => {
    const found = await Promise.all(
      ['2.2.28', '2.1.40', '2.2.29', '2.2.32', '2.2.33', '3.0.0'].map(version =>
        mismatchOf(hostOf({ found: { kind: 'global', version } }).host, 'node'),
      ),
    )

    expect(found.map(mismatch => mismatch && [mismatch.version, mismatch.isNewer])).toEqual([
      ['2.2.28', false],
      ['2.1.40', false],
      undefined,
      undefined,
      ['2.2.33', true],
      ['3.0.0', true],
    ])
  })

  test('looks with the script on the runtime the engine runs on', async () => {
    const { host, runs } = hostOf({ found: OLDER })

    await mismatchOf(host, 'bun')

    expect(runs).toEqual([['bun', SCRIPT, 'detect']])
  })

  test('runs nothing where the settings run no ccstatusline', async () => {
    const found = await Promise.all(
      ['', '~/bin/statusline.sh'].map(async command => {
        const { host, runs } = hostOf({ command, found: OLDER })

        return [await mismatchOf(host, 'node'), runs]
      }),
    )

    expect(found).toEqual([
      [undefined, []],
      [undefined, []],
    ])
  })

  test('a look that could not tell the version finds no mismatch', async () => {
    const found = await Promise.all(
      [{ kind: 'global' }, { kind: 'none' }, { kind: 'global', version: 'next' }].map(found =>
        mismatchOf(hostOf({ found }).host, 'node'),
      ),
    )

    expect(found).toEqual([undefined, undefined, undefined])
  })

  test('an older one can be upgraded to the version of the engine, uninstalled, or left', async () => {
    const { host, asked } = hostOf({ found: OLDER, answer: 'Not now' })

    await alignTerminal(host, 'node', false)

    expect(asked).toEqual([
      [
        expect.stringMatching(/^Your terminal runs ccstatusline 2\.2\.20, older than .*\(2\.2\.29 to 2\.2\.32\)/),
        { header: 'Terminal', options: ['Upgrade to 2.2.32', 'Uninstall it', 'Not now'] },
      ],
    ])
  })

  test('a newer one can only be uninstalled, or left', async () => {
    const { host, asked } = hostOf({ found: NEWER, answer: 'Not now' })

    await alignTerminal(host, 'node', false)

    expect(asked).toEqual([
      [
        expect.stringMatching(/^Your terminal runs ccstatusline 2\.3\.0, newer than the 2\.2\.32 /),
        { header: 'Terminal', options: ['Uninstall it', 'Not now'] },
      ],
    ])
  })

  test('upgrades on that answer, to the version of the engine, and says what the script said', async () => {
    const { host, runs } = hostOf({ found: OLDER, answer: 'Upgrade to 2.2.32' })

    expect([await alignTerminal(host, 'node', false), runs.at(-1)]).toEqual([
      { isChanged: true, said: UPGRADED },
      ['node', SCRIPT, 'upgrade', '2.2.32'],
    ])
  })

  test('uninstalls on that answer', async () => {
    const { host, runs } = hostOf({ found: NEWER, answer: 'Uninstall it' })

    await alignTerminal(host, 'node', false)

    expect(runs.at(-1)).toEqual(['node', SCRIPT, 'uninstall'])
  })

  test('changes nothing on Not now, on a dismissal, or on words of the person\'s own', async () => {
    const left = await Promise.all(
      ['Not now', undefined, 'Upgrade to 9.9.9'].map(async answer => {
        const { host, runs } = hostOf({ found: OLDER, answer })

        return [await alignTerminal(host, 'node', false), runs.length]
      }),
    )

    expect(left).toEqual([
      [undefined, 1],
      [undefined, 1],
      [undefined, 1],
    ])
  })

  test('a mismatch answered about is not asked about again, until it is another', async () => {
    const same = hostOf({ found: OLDER, answer: 'Not now', answered: '2.2.20 beside 2.2.32' })
    const other = hostOf({ found: OLDER, answer: 'Not now', answered: '2.2.9 beside 2.2.32' })

    await alignTerminal(same.host, 'node', false)
    await alignTerminal(other.host, 'node', false)

    expect([same.asked.length, other.asked.length, other.store.get('terminalAnswered')]).toEqual([
      0,
      1,
      '2.2.20 beside 2.2.32',
    ])
  })

  test('a dismissed dialog is asked again', async () => {
    const { host, store } = hostOf({ found: OLDER })

    await alignTerminal(host, 'node', false)

    expect(store.size).toBe(0)
  })

  test('asked to repeat, it asks about a mismatch already answered about', async () => {
    const { host, asked } = hostOf({ found: OLDER, answer: 'Not now', answered: '2.2.20 beside 2.2.32' })

    await alignTerminal(host, 'node', true)

    expect(asked).toHaveLength(1)
  })

  test('a change that failed says why, and counts as none', async () => {
    const { host } = hostOf({
      found: OLDER,
      answer: 'Uninstall it',
      change: () => ended(1, '', "ccstatusline desktop: the terminal's ccstatusline was left as it is (EACCES)\n"),
    })

    expect(await alignTerminal(host, 'node', false)).toEqual({
      isChanged: false,
      said: "ccstatusline desktop: the terminal's ccstatusline was left as it is (EACCES)",
    })
  })

  test('a change that did not run says so', async () => {
    const { host } = hostOf({
      found: OLDER,
      answer: 'Uninstall it',
      change: () => {
        throw new Error("ENOENT: Command 'node' not found")
      },
    })

    expect(await alignTerminal(host, 'node', false)).toEqual({
      isChanged: false,
      said: "ccstatusline desktop: the terminal's ccstatusline was left as it is (ENOENT: Command 'node' not found)",
    })
  })
})
