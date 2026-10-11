import { mock } from 'claude-code/testing'
import type { MockClock } from 'claude-code/testing'
import type { Args, EventResult, On, SessionUsage, Settings } from 'claude-code'

import { ENGINE_OUTPUT } from './engine-output'

type Ran = EventResult<'process.run'>

export type WorldOptions = {
  /** How a run of the engine ends; left out, it prints ENGINE_OUTPUT. */
  run?: (e: Args<'process.run'>) => Ran | Promise<Ran>
  /** Claude Code's settings, as `$.settings.read()` answers them. */
  settings?: Settings
  /** The engine's own settings file as text; left out, there is none. */
  engineSettings?: string
  usage?: SessionUsage
  /** The paths `$.fs.exists` finds. */
  existing?: readonly string[]
}

export type World = {
  /** Every run of the engine the mod asked for, oldest first. */
  runs: Args<'process.run'>[]
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

/**
 * Stands the world beneath the mod: a session in /work/app a quarter of an
 * hour old, a clock the test moves, and an engine that prints two lines.
 *
 * @param on the test's `on`
 * @param options what differs from that world in this test
 * @returns the engine runs recorded so far, and the clock
 */
export function worldOf(on: On, options: WorldOptions = {}): World {
  const runs: Args<'process.run'>[] = []
  const clock = mock.clock(on, { now: USAGE.startedAt + 900_000 })

  mock.env(on, { HOME: '/home/me' })

  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.attach', ($, e) => ({ clientId: e.clientId }))
  on('session.detach', ($, e) => ({ clientId: e.clientId }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.cwd', () => ({ value: '/work/app' }))
  on('session.root', () => ({ value: '/work/app' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.version', () => ({ value: { version: '2.1.296' } }))
  on('session.usage', () => ({ value: options.usage ?? USAGE }))
  on('settings.read', () => ({ value: options.settings ?? {} }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('turn.complete', () => ({ text: '' }))
  on('classic.SessionStart', () => ({}))
  on('classic.UserPromptSubmit', () => ({}))
  on('classic.Stop', () => ({}))
  on('classic.PostCompact', () => ({}))
  on('classic.PostModelSwitch', () => ({}))
  on('classic.CwdChanged', () => ({}))

  on('fs.read', ($, e) =>
    options.engineSettings === undefined
      ? { deny: `ENOENT: no such file or directory, open '${e.path}'` }
      : { value: options.engineSettings },
  )

  on('fs.exists', ($, e) => ({
    value: (options.existing ?? []).includes(e.path),
  }))

  on('process.run', ($, e) => {
    runs.push(e)

    return options.run?.(e) ?? printed(ENGINE_OUTPUT)
  })

  on('ui.render', { component: 'AbovePrompt' }, ($, e) =>
    $.ui.resolve(e).Box({}),
  )

  return { runs, clock }
}
