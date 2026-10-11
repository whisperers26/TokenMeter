import { describe, expect, test } from 'claude-code/testing'

import { BAND } from './fixtures/band'
import { ENGINE_OUTPUT } from './fixtures/engine-output'
import { rowsOf } from './fixtures/rows-of'
import { exited, isLeftAlone, printed, worldOf } from './fixtures/world'
import type { World } from './fixtures/world'

/** A session the desktop app hosts: no terminal, a person at the prompt. */
const START = { surface: null, isInteractive: true, cwd: '/work/app' } as const

const TRANSCRIPT = '/home/me/.claude/projects/-work-app/session-1.jsonl'

/** `/token-meter` as the person types it, where no terminal has measured. */
const COMMAND = {
  command: 'token-meter',
  args: '',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 80 },
} as const

/** The end of a turn on the main loop, answered. */
const TURN = {
  answer: 'done',
  durationMs: 1_200,
  isAborted: false,
  turnId: 'turn-1',
  reason: 'answer',
} as const

/** A switch of the main loop's model from the picker. */
const MODEL_SWITCH = {
  from_model: 'claude-opus-5-5',
  to_model: 'claude-sonnet-5-5',
  requested_model: 'sonnet',
  source: 'picker',
  context_tokens: 183_412,
  prompt_cache_warm: false,
  cache_ttl: '1h',
  estimated_cache_write_usd: 0.4,
  pricing: 'catalog',
} as const

/** A line whose first words the engine wrapped in an OSC 8 hyperlink. */
const LINKED_OUTPUT =
  '\x1b]8;;https://github.com/o/r/pull/7\x1b\\\x1b[32mPR #7\x1b]8;;\x1b\\ open\n'

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

    expect(
      runs.map(run => [
        run.argv[0],
        run.argv[1]?.replaceAll('\\', '/').replace(/^.*\/mod\//, ''),
      ]),
    ).toEqual([['node', 'engine/ccstatusline.js']])
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

  test('a redraw while the first run is under way starts no second run', async ($, on) => {
    let release = () => {}

    const { clock, runs } = worldOf(on, {
      run: () =>
        new Promise(resolve => {
          release = () => resolve(printed(ENGINE_OUTPUT))
        }),
    })

    await $.session.start(START)

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.settle()
    await ui.redraw({ ...BAND.props, isWorking: true })
    await clock.settle()
    release()
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

  test('a hyperlink the engine wrote is drawn as a link on every surface', async ($, on) => {
    const { clock } = worldOf(on, { run: () => printed(LINKED_OUTPUT) })

    await $.session.start({ ...START, surface: 'terminal' })

    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ ...BAND, surface })

      await clock.settle()

      expect(rowsOf(await ui.drawn())).toEqual([
        [
          { text: 'PR #7', color: '#00cd00', href: 'https://github.com/o/r/pull/7' },
          { text: ' open', color: '#00cd00' },
        ],
      ])
    }
  })

  test('runs the engine again when a turn completes', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()
    await $.turn.complete(TURN)
    await clock.settle()

    expect(runs).toHaveLength(2)
  })

  test("a subagent's turn runs nothing more", async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()
    await $.turn.complete({ ...TURN, agentId: 'agent-1' })
    await clock.settle()

    expect(runs).toHaveLength(1)
  })

  test('runs the engine again every half minute', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()
    await clock.advance(29_000)

    const before = runs.length

    await clock.advance(1_000)
    await clock.advance(30_000)

    expect([before, runs.length]).toEqual([1, 3])
  })

  test(
    'runs the engine again as often as the refresh option says',
    { options: { refreshSeconds: 10 } },
    async ($, on) => {
      const { clock, runs } = worldOf(on)

      await $.session.start(START)
      await $.ui.mount({ ...BAND, surface: 'desktop' })
      await clock.settle()
      await clock.advance(30_000)

      expect(runs).toHaveLength(4)
    },
  )

  test(
    'a refresh option under five seconds is held to five',
    { options: { refreshSeconds: 1 } },
    async ($, on) => {
      const { clock, runs } = worldOf(on)

      await $.session.start(START)
      await $.ui.mount({ ...BAND, surface: 'desktop' })
      await clock.settle()
      await clock.advance(10_000)

      expect(runs).toHaveLength(3)
    },
  )

  test(
    'a refresh option of zero leaves the timer off',
    { options: { refreshSeconds: 0 } },
    async ($, on) => {
      const { clock, runs } = worldOf(on)

      await $.session.start(START)
      await $.ui.mount({ ...BAND, surface: 'desktop' })
      await clock.settle()
      await clock.advance(600_000)

      expect(runs).toHaveLength(1)
    },
  )

  test('runs the engine again after a compaction, a model switch and a move', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()
    await $.classic.PostCompact({ trigger: 'auto', compact_summary: 'so far' })
    await clock.settle()
    await $.classic.PostModelSwitch(MODEL_SWITCH)
    await clock.settle()
    await $.classic.CwdChanged({ old_cwd: '/work/app', new_cwd: '/work/app/src' })
    await clock.settle()

    expect(runs).toHaveLength(4)
  })

  test('runs nothing while no surface draws the band', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.turn.complete(TURN)
    await clock.advance(120_000)

    expect(runs).toEqual([])
  })

  test('stops running once the surface that drew the band detaches', async ($, on) => {
    const { clock, runs } = worldOf(on)

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()
    await $.session.detach({ surface: 'desktop', clientId: 'desktop:default', reason: 'detach' })
    await $.turn.complete(TURN)
    await clock.advance(120_000)

    expect(runs).toHaveLength(1)
  })

  test('a run asked for while one is under way follows it, once', async ($, on) => {
    let release = () => {}

    const { clock, runs } = worldOf(on, {
      run: () =>
        runs.length > 1
          ? printed(ENGINE_OUTPUT)
          : new Promise(resolve => {
              release = () => resolve(printed(ENGINE_OUTPUT))
            }),
    })

    await $.session.start(START)
    await $.ui.mount({ ...BAND, surface: 'desktop' })
    await clock.settle()
    await $.turn.complete(TURN)
    await clock.settle()
    await $.turn.complete(TURN)
    await clock.settle()

    const whileHeld = runs.length

    release()
    await clock.settle()

    expect([whileHeld, runs.length]).toEqual([1, 2])
  })

  test(
    'runs the engine with the runtime the option names',
    { options: { runtime: ' /opt/bun/bin/bun ' } },
    async ($, on) => {
      const { clock, runs } = worldOf(on)

      await $.session.start(START)
      await $.ui.mount({ ...BAND, surface: 'desktop' })
      await clock.settle()

      expect(runs.map(run => run.argv[0])).toEqual(['/opt/bun/bin/bun'])
    },
  )

  test(
    'a blank runtime option means node',
    { options: { runtime: '  ' } },
    async ($, on) => {
      const { clock, runs } = worldOf(on)

      await $.session.start(START)
      await $.ui.mount({ ...BAND, surface: 'desktop' })
      await clock.settle()

      expect(runs.map(run => run.argv[0])).toEqual(['node'])
    },
  )

  test('/token-meter runs the engine and reports its lines as text', async ($, on) => {
    const { runs } = worldOf(on)

    await $.session.start(START)

    const { text } = await $.command.run(COMMAND)

    expect([runs.length, text?.split('\n').slice(0, 2)]).toEqual([
      1,
      ['Model: Opus 5.5 | Ctx: 183.4k', 'Total: 22.7M | Session: 42.5%'],
    ])
  })

  test('/token-meter says why when the engine did not run', async ($, on) => {
    worldOf(on, { run: () => ({ deny: NO_NODE }) })

    await $.session.start(START)

    const { text } = await $.command.run(COMMAND)

    expect(text).toMatch(/^Token Meter: the engine did not run \(.*ENOENT/)
  })

  test("/token-meter names the engine's settings file under the home directory", async ($, on) => {
    worldOf(on)

    await $.session.start(START)

    const { text } = await $.command.run(COMMAND)

    expect(text).toContain('/home/me/.config/ccstatusline/settings.json')
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
