import { describe, expect, test } from 'claude-code/testing'

import { effortLevelOf, effortOf, effortSaidBy } from '../hooks/effort'

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

  test('reads the effort a settings object names, when it names a level', () => {
    expect(
      [
        { effortLevel: 'low' },
        { effortLevel: 'xhigh' },
        { effortLevel: 'ultracode' },
        { effortLevel: 3 },
        {},
      ].map(effortLevelOf),
    ).toEqual(['low', 'xhigh', undefined, undefined, undefined])
  })

  describe('the effort a session has', () => {
    const SAVED = {
      effortLevel: 'high',
      modelSettings: {
        'claude-opus-5-5': { effortLevel: 'medium' },
        'claude-sonnet-5-5': { effortLevel: 'low' },
      },
    }

    test('is the level saved for the model, before the top-level one', () => {
      expect(effortOf(SAVED, {}, 'claude-opus-5-5')).toBe('medium')
      expect(effortOf(SAVED, {}, 'claude-sonnet-5-5')).toBe('low')
    })

    test('falls back to the top-level level for a model with none saved', () => {
      expect(effortOf(SAVED, {}, 'claude-haiku-5-5')).toBe('high')
    })

    test('finds a model by the name it is saved under, whatever its spelling', () => {
      expect(
        [
          'claude-opus-5-5[1m]',
          'claude-opus-5-5-20260101',
          'CLAUDE-OPUS-5-5',
        ].map(model => effortOf(SAVED, {}, model)),
      ).toEqual(['medium', 'medium', 'medium'])
    })

    test('is the level a host put in the flag layer, before any saved one', () => {
      expect(effortOf(SAVED, { effortLevel: 'xhigh' }, 'claude-opus-5-5')).toBe('xhigh')
    })

    test('ignores a saved level the status line has no name for', () => {
      expect(
        effortOf(
          { modelSettings: { 'claude-opus-5-5': { effortLevel: 'turbo' } } },
          {},
          'claude-opus-5-5',
        ),
      ).toBeUndefined()
    })
  })
})
