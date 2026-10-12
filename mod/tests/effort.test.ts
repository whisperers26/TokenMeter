import { describe, expect, test } from 'claude-code/testing'

import { effortSaidBy } from '../hooks/effort'

describe('effort', () => {
  test('reads the level /effort set the session to', () => {
    expect(
      [
        'Set effort level to low (this session only): Quick, straightforward implementation',
        'Set effort level to medium (this session only): Balanced approach',
        'Set effort level to high (this session only): Comprehensive implementation',
        'Set effort level to xhigh (this session only): Deeper reasoning than high',
        'Set effort level to max (this session only): Maximum capability',
      ].map(effortSaidBy),
    ).toEqual(['low', 'medium', 'high', 'xhigh', 'max'])
  })

  test('reads auto as the session handed back to the model', () => {
    expect(effortSaidBy('Effort level set to auto (this session only)')).toBeNull()
  })

  test('says nothing for what is not a set level', () => {
    expect(
      [
        'Usage: /effort <low|medium|high|xhigh|max|auto|ultracode [on|off]>',
        'Set effort level to ultracode (this session only)',
        'Current model: `Opus 5.5` (effort: xhigh)',
        '',
      ].map(effortSaidBy),
    ).toEqual([undefined, undefined, undefined, undefined])
  })
})
