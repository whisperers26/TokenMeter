import { describe, expect, test } from 'claude-code/testing'

import { BAND } from './fixtures/band'
import { ENGINE_OUTPUT } from './fixtures/engine-output'
import { rowsOf } from './fixtures/rows-of'
import { exited, isLeftAlone, printed, worldOf } from './fixtures/world'
import type { World } from './fixtures/world'

/** A session the desktop app hosts: no terminal, a person at the prompt. */
const START = { surface: null, isInteractive: true, cwd: '/work/app' } as const

const TRANSCRIPT = '/home/me/.claude/projects/-work-app/session-1.jsonl'

/** How the host refuses a run whose command is not on the PATH. */
const NO_NODE =
  "process.run(node) failed to start: ENOENT: Command 'node' not found"

/** Claude Code settings that already run a status line under a terminal. */
const OWN_STATUS_LINE = {
  statusLine: { type: 'command', command: 'npx -y ccstatusline@latest' },
}

/** What the mod wrote to the engine's standard input on its `at`th run. */
const stdinOf = (runs: World['runs'], at = 0): unknown =>
  JSON.parse(runs[at]?.init?.stdin ?? 'null')

/** The width the mod told the engine for one run. */
const widthOf = (run: World['runs'][number]) => run.init?.env?.CCSTATUSLINE_WIDTH

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

  test('yields the band to a survey, running nothing for it', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)

    const ui = await $.ui.mount({
      ...BAND,
      surface: 'desktop',
      props: { ...BAND.props, hasSurvey: true },
    })

    await clock.settle()

    expect([runs, isLeftAlone(await ui.drawn())]).toEqual([[], true])
  })

  test('stays quiet on a terminal that has a statusLine of its own', async ($, on) => {
    const { clock, runs } = worldOf(on, { settings: OWN_STATUS_LINE })

    await $.session.start({ ...START, surface: 'terminal' })

    const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

    await clock.settle()

    expect([runs, isLeftAlone(await ui.drawn())]).toEqual([[], true])
  })

  test('draws on a terminal that has no statusLine', async ($, on) => {
    const { clock } = worldOf(on)

    await $.session.start({ ...START, surface: 'terminal' })

    const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

    await clock.settle()

    expect(rowsOf(await ui.drawn())).toHaveLength(2)
  })

  test("draws on desktop whatever the terminal's statusLine", async ($, on) => {
    const { clock } = worldOf(on, { settings: OWN_STATUS_LINE })

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()

    expect(rowsOf(await ui.drawn())).toHaveLength(2)
  })

  test("tells the engine the band's width plus its flex reserve", async ($, on) => {
    const { clock, runs, reads } = worldOf(on, {
      engineSettings: JSON.stringify({ flexMode: 'full-minus-40' }),
    })

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect([reads, runs.map(widthOf)]).toEqual([
      ['/home/me/.config/ccstatusline/settings.json'],
      ['140'],
    ])
  })

  test("reserves the engine's default when it has no settings file", async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()

    expect(runs.map(widthOf)).toEqual(['106'])
  })

  test("runs the engine again when the band's width changes", async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()
    await ui.redraw({ ...BAND.props, bodyColumns: 80 })
    await clock.settle()

    expect(runs.map(widthOf)).toEqual(['106', '86'])
  })

  test('a redraw at the same width runs nothing more', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()
    await ui.redraw({ ...BAND.props, isWorking: true })
    await clock.settle()

    expect(runs).toHaveLength(1)
  })

  test('says why in the band when the engine cannot be started', async ($, on) => {
    const { clock } = worldOf(on, { run: () => ({ deny: NO_NODE }) })

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()

    const rows = rowsOf(await ui.drawn())

    expect(rows.map(row => row.length)).toEqual([1])
    expect(rows[0]?.[0]).toMatchObject({ dimColor: true })
    expect(rows[0]?.[0]?.text).toMatch(
      /^Token Meter: the engine did not run \(.*ENOENT: Command 'node' not found\)$/,
    )
  })

  test('says why in the band when the engine fails', async ($, on) => {
    const { clock } = worldOf(on, {
      run: () =>
        exited(1, '\nInvalid status JSON format: expected object\n    at main\n'),
    })

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()

    expect(rowsOf(await ui.drawn()).map(row => row.map(span => span.text))).toEqual([
      ['Token Meter: the engine failed (Invalid status JSON format: expected object)'],
    ])
  })

  test('an engine that fails without a word is reported by its exit code', async ($, on) => {
    const { clock } = worldOf(on, { run: () => exited(3, '') })

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()

    expect(rowsOf(await ui.drawn()).map(row => row.map(span => span.text))).toEqual([
      ['Token Meter: the engine failed (exit code 3)'],
    ])
  })

  test('an engine that prints nothing leaves the band to Claude Code', async ($, on) => {
    const { clock } = worldOf(on, { run: () => printed('') })

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()

    expect(isLeftAlone(await ui.drawn())).toBe(true)
  })

  test('draws the lines again once the engine recovers', async ($, on) => {
    let isBroken = true

    const { clock } = worldOf(on, {
      run: () => (isBroken ? { deny: NO_NODE } : printed(ENGINE_OUTPUT)),
    })

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()
    isBroken = false
    await ui.redraw({ ...BAND.props, bodyColumns: 80 })
    await clock.settle()

    expect(rowsOf(await ui.drawn())).toHaveLength(2)
  })
})
