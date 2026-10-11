import { describe, expect, test } from 'claude-code/testing'

import { BAND } from './fixtures/band'
import { rowsOf } from './fixtures/rows-of'
import { worldOf } from './fixtures/world'
import type { World } from './fixtures/world'

/** A session the desktop app hosts: no terminal, a person at the prompt. */
const START = { surface: null, isInteractive: true, cwd: '/work/app' } as const

const TRANSCRIPT = '/home/me/.claude/projects/-work-app/session-1.jsonl'

/** What the mod wrote to the engine's standard input on its `at`th run. */
const stdinOf = (runs: World['runs'], at = 0): unknown =>
  JSON.parse(runs[at]?.init?.stdin ?? 'null')

describe('register', () => {
  test("draws the engine's lines in the band on desktop", async ($, on) => {
    const { clock } = worldOf(on)

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()

    expect(rowsOf(await ui.drawn())).toEqual([
      [
        { text: 'Model: Opus 5.5', color: '#008787' },
        { text: ' | ' },
        { text: 'Ctx: 183.4k', color: '#5f5f5f' },
      ],
      [
        { text: 'Total: 22.7M', color: '#008787' },
        { text: ' | ' },
        { text: 'Session: 42.5%', color: '#87afff' },
      ],
    ])
  })

  test("runs the engine that ships in the plugin's own folder with node", async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect(runs.map(run => [run.argv[0], run.argv[1]?.replace(/^.*[\\/]mod[\\/]/, '')])).toEqual([
      ['node', 'engine/ccstatusline.js'],
    ])
  })

  test("hands the engine the session's figures on standard input", async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect(stdinOf(runs)).toMatchObject({
      hook_event_name: 'Status',
      session_id: 'session-1',
      cwd: '/work/app',
      workspace: { current_dir: '/work/app', project_dir: '/work/app' },
      model: { id: 'claude-opus-5-5', display_name: 'Opus 5.5' },
      version: '2.1.296',
      cost: { total_cost_usd: 1.23, total_duration_ms: 900_000 },
      context_window: { context_window_size: 1_000_000, used_percentage: 18 },
      rate_limits: {
        five_hour: { used_percentage: 42.5, resets_at: 1_000_000_000 },
        seven_day: { used_percentage: 15 },
      },
    })
  })

  test('passes on the transcript and the effort the session events named', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.classic.SessionStart({ source: 'startup', transcript_path: TRANSCRIPT })
    await $.classic.Stop({ stop_hook_active: false, effort: { level: 'xhigh' } })
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect(stdinOf(runs)).toMatchObject({
      transcript_path: TRANSCRIPT,
      effort: { level: 'xhigh' },
    })
  })

  test("finds the transcript by the session's id when no event named it", async ($, on) => {
    const { clock, runs } = worldOf(on, { existing: [TRANSCRIPT] })

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect(stdinOf(runs)).toMatchObject({ transcript_path: TRANSCRIPT })
  })

  test('leaves the transcript out when none is found', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect(Object.keys(stdinOf(runs) as object)).not.toContain('transcript_path')
  })

  test("carries the output style of Claude Code's settings", async ($, on) => {
    const { clock, runs } = worldOf(on, { settings: { outputStyle: 'Explanatory' } })

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect(stdinOf(runs)).toMatchObject({ output_style: { name: 'Explanatory' } })
  })
})
