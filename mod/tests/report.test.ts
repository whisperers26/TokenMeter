import { describe, expect, test } from 'claude-code/testing'

import { reportOf } from '../hooks/report'

const DETAILS = {
  engine: ['node', '/plugins/ccstatusline-desktop/engine/ccstatusline.js'],
  settingsPath: '/home/me/.config/ccstatusline/settings.json',
} as const

describe('report', () => {
  test('the lines read as plain text, one a row, their spaces plain', () => {
    const report = reportOf(
      {
        lines: [
          [{ text: 'Model: Opus', color: '#008787' }, { text: ' | Ctx' }],
          [{ text: 'Total: 22.7M' }],
        ],
      },
      DETAILS,
    )

    expect(report.split('\n').slice(0, 3)).toEqual([
      'Model: Opus | Ctx',
      'Total: 22.7M',
      '',
    ])
  })

  test('an engine with nothing to show is said in words', () => {
    expect(reportOf({ lines: [] }, DETAILS)).toStartWith(
      'The engine has no line to show',
    )
  })

  test('a failure reads as the band shows it', () => {
    expect(
      reportOf({ failure: 'the engine did not run (ENOENT)' }, DETAILS),
    ).toStartWith('ccstatusline desktop: the engine did not run (ENOENT)\n')
  })

  test('says where the layout is kept and how to open the configurator', () => {
    const report = reportOf({ lines: [[{ text: 'x' }]] }, DETAILS)

    expect(report).toContain('/home/me/.config/ccstatusline/settings.json')
    expect(report).toContain('node "/plugins/ccstatusline-desktop/engine/ccstatusline.js"')
  })

  test('names the command that opens the configurator before the one to paste', () => {
    expect(reportOf({ lines: [[{ text: 'x' }]] }, DETAILS).split('\n').at(-1)).toBe(
      'To change them, run `/ccstatusline-desktop edit`, or this in a terminal: `node "/plugins/ccstatusline-desktop/engine/ccstatusline.js"`',
    )
  })

  test('a Windows path keeps its backslashes where the report is drawn as markdown', () => {
    const details = {
      engine: ['node', 'C:\\Users\\me\\.claude\\plugins\\engine\\ccstatusline.js'],
      settingsPath: 'C:\\Users\\me\\.config\\ccstatusline\\settings.json',
    } as const

    const command = '`node "C:\\Users\\me\\.claude\\plugins\\engine\\ccstatusline.js"`'
    const report = reportOf({ lines: [[{ text: 'x' }]] }, details)

    expect(report).toContain(command)
    expect(report).toContain('`C:\\Users\\me\\.config\\ccstatusline\\settings.json`')
    expect(reportOf({ failure: 'the engine did not run (ENOENT)' }, details)).toContain(
      command,
    )
  })

  test('a failure adds what to set when the runtime is not found', () => {
    expect(reportOf({ failure: 'the engine did not run (ENOENT)' }, DETAILS)).toContain(
      'runtime',
    )
  })
})
