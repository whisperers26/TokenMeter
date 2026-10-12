import { mock } from 'claude-code/testing'
import type { MockClock } from 'claude-code/testing'
import type {
  Args,
  EventResult,
  On,
  RenderSurface,
  SessionUsage,
  Settings,
} from 'claude-code'

import { ENGINE_OUTPUT } from './engine-output'

type Ran = EventResult<'process.run'>

export type WorldOptions = {
  /** How a run of the engine ends; left out, it prints ENGINE_OUTPUT. */
  run?: (e: Args<'process.run'>) => Ran | Promise<Ran>
  /** Claude Code's settings, as `$.settings.read()` answers them. */
  settings?: Settings
  /**
   * The flag layer of Claude Code's settings, as `$.settings.read({ source:
   * 'flag' })` answers it: where a host that sets the effort puts a level the
   * persisted settings can hold. Left out, it is empty.
   */
  flagSettings?: Settings
  /**
   * When a reader of snapshots was last there, in milliseconds since the
   * epoch: what its sign of life file holds. Left out, there is no such file.
   */
  readerSeenAt?: number
  usage?: SessionUsage
  /** A Claude Code too old to say its version: the call is refused. */
  hasNoVersion?: boolean
  /** The paths `$.fs.exists` finds. */
  existing?: readonly string[]
  /** The surfaces the session draws on, as `$.session.surfaces()` answers. */
  surfaces?: readonly RenderSurface[]
  /** How a write ends; left out, the file is written. */
  write?: (e: Args<'fs.write'>) => EventResult<'fs.write'>
  /**
   * How a run of the script that looks at the terminal's ccstatusline ends;
   * left out, it finds none.
   */
  terminal?: (e: Args<'process.run'>) => Ran | Promise<Ran>
  /**
   * How the script's handing of the terminal's width to its ccstatusline
   * ends; left out, there is nothing to do and it says nothing.
   */
  widen?: (e: Args<'process.run'>) => Ran | Promise<Ran>
  /** What the mod's own store holds at the start. */
  stored?: Readonly<Record<string, unknown>>
}

export type World = {
  /** Every run of the engine the mod asked for, oldest first. */
  runs: Args<'process.run'>[]
  /** What each run of the script on the terminal's ccstatusline was told, oldest first. */
  terminalRuns: string[][]
  /** Every line the mod wrote to the transcript, oldest first. */
  logged: string[]
  /** Every file the mod read, as the test would spell its path. */
  reads: string[]
  /** Every file the mod wrote, its path spelled the same way, oldest first. */
  writes: { path: string; text: string }[]
  clock: MockClock
}

/** The session's figures a quarter of an hour in, on a subscription. */
export const USAGE: SessionUsage = {
  startedAt: 1_700_000_000_000,
  context: { window: 1_000_000, tokens: 183_412, percent: 18 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 42.5, resetsAt: '2001-09-09T01:46:40.000Z' },
    { kind: 'seven_day', percentUsed: 15 },
  ],
  cost: { usd: 1.23 },
}

/** The file a reader of snapshots keeps its sign of life in. */
const READER = '/home/me/.cache/ccstatusline-desktop/reader'

/** The file that names the version of the engine the mod runs. */
const ENGINE_VERSION = /\/engine\/VERSION$/

/** The script that looks at the terminal's ccstatusline, and changes it. */
const TERMINAL_SCRIPT = /[\\/]scripts[\\/]terminal-ccstatusline\.mjs$/

/** The key of the band Claude Code draws when the mod draws none. */
const OWN_BAND = 'claude-code-own-band'

/** Whether a drawn band is Claude Code's own: the mod passed the draw on. */
export const isLeftAlone = (tree: unknown): boolean =>
  (tree as { props?: { key?: unknown } }).props?.key === OWN_BAND

/**
 * A path as the test wrote it: the host hands a hook the path resolved its
 * own way, a drive letter and backslashes on Windows.
 */
const plain = (path: string) =>
  path.replace(/^[A-Za-z]:/, '').replaceAll('\\', '/')

/** A run of the engine that printed `stdout` and exited clean. */
export const printed = (stdout: string): Ran => ({
  value: {
    exitCode: 0,
    stdout,
    stderr: '',
    isStdoutTruncated: false,
    isStderrTruncated: false,
  },
})

/** A run of the engine that printed no lines and exited with `exitCode`. */
export const exited = (exitCode: number, stderr: string): Ran => ({
  value: {
    exitCode,
    stdout: '',
    stderr,
    isStdoutTruncated: false,
    isStderrTruncated: false,
  },
})

/**
 * Stands the world beneath the mod: a session in /work/app a quarter of an
 * hour old, a clock the test moves, and an engine that prints two lines.
 *
 * @param on the test's `on`
 * @param options what differs from that world in this test
 * @returns the engine runs and the files read and written so far, and the clock
 */
export function worldOf(on: On, options: WorldOptions = {}): World {
  const runs: Args<'process.run'>[] = []
  const reads: string[] = []
  const writes: World['writes'] = []
  const terminalRuns: string[][] = []
  const logged: string[] = []
  const clock = mock.clock(on, { now: USAGE.startedAt + 900_000 })

  mock.env(on, { HOME: '/home/me' })
  mock.store(on, options.stored)

  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.attach', ($, e) => ({ clientId: e.clientId }))
  on('session.detach', ($, e) => ({ clientId: e.clientId }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.cwd', () => ({ value: '/work/app' }))
  on('session.root', () => ({ value: '/work/app' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.version', () =>
    options.hasNoVersion
      ? { deny: '$.session.version is not a function' }
      : { value: { version: '2.1.296' } },
  )
  on('session.usage', () => ({ value: options.usage ?? USAGE }))
  on('session.surfaces', () => ({ value: options.surfaces ?? [] }))
  on('settings.read', ($, e) => ({
    value:
      e.source === 'flag' ? (options.flagSettings ?? {}) : (options.settings ?? {}),
  }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('turn.complete', () => ({ text: '' }))
  on('classic.SessionStart', () => ({}))
  on('classic.UserPromptSubmit', () => ({}))
  on('classic.Stop', () => ({}))
  on('classic.PostCompact', () => ({}))
  on('classic.PostModelSwitch', () => ({}))
  on('classic.CwdChanged', () => ({}))

  on('ui.log', ($, e) => {
    logged.push(e.text)

    return { value: undefined }
  })

  on('fs.read', ($, e) => {
    if (ENGINE_VERSION.test(plain(e.path))) {
      return { value: '2.2.32\n' }
    }

    reads.push(plain(e.path))

    const text =
      plain(e.path) === READER ? options.readerSeenAt?.toString() : undefined

    return text === undefined
      ? { deny: `ENOENT: no such file or directory, open '${e.path}'` }
      : { value: text }
  })

  on('fs.exists', ($, e) => ({
    value: (options.existing ?? []).some(path => plain(path) === plain(e.path)),
  }))

  on('fs.write', ($, e) => {
    writes.push({ path: plain(e.path), text: e.text })

    return options.write?.(e) ?? { value: undefined }
  })

  on('process.run', ($, e) => {
    if (TERMINAL_SCRIPT.test(e.argv[1] ?? '')) {
      // The look at the width is made at every first draw, and finds nothing
      // to do unless the test says otherwise
      if (e.argv[2] === 'widen') {
        return options.widen?.(e) ?? printed('')
      }

      terminalRuns.push(e.argv.slice(2))

      return options.terminal?.(e) ?? printed('{"kind":"none"}\n')
    }

    runs.push(e)

    return options.run?.(e) ?? printed(ENGINE_OUTPUT)
  })

  on('ui.render', { component: 'AbovePrompt' }, ($, e) =>
    $.ui.resolve(e).Box({ key: OWN_BAND }),
  )

  return { runs, terminalRuns, logged, reads, writes, clock }
}
