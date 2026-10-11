import { describe, expect, test } from 'claude-code/testing'

import { flexReserveOf } from '../hooks/width'

const settings = (value: unknown) => JSON.stringify(value)

describe('width', () => {
  test('the full flex mode reserves six columns', () => {
    expect(flexReserveOf(settings({ flexMode: 'full' }), undefined)).toBe(6)
  })

  test('the full-minus-40 flex mode reserves forty', () => {
    expect(flexReserveOf(settings({ flexMode: 'full-minus-40' }), 99)).toBe(40)
  })

  test('full-until-compact reserves forty from its threshold on', () => {
    const untilCompact = settings({
      flexMode: 'full-until-compact',
      compactThreshold: 70,
    })

    expect([69, 70, undefined].map(percent => flexReserveOf(untilCompact, percent))).toEqual([
      6, 40, 6,
    ])
  })

  test('a threshold left out is the engine default of sixty', () => {
    const untilCompact = settings({ flexMode: 'full-until-compact' })

    expect([59, 60].map(percent => flexReserveOf(untilCompact, percent))).toEqual([
      6, 40,
    ])
  })

  test('settings that say nothing read as the engine defaults', () => {
    expect(
      [undefined, '', 'not json', 'null', settings({}), settings({ flexMode: 7 })].map(
        text => flexReserveOf(text, 99),
      ),
    ).toEqual([6, 6, 6, 6, 6, 6])
  })
})
