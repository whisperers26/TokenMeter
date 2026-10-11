import { describe, expect, test } from 'claude-code/testing'

import { groupsOf } from '../hooks/groups'

const PAD = ' '.repeat(12)

describe('groups', () => {
  test('a line with no padding is one group', () => {
    expect(groupsOf([{ text: 'a | b' }, { text: 'c', bold: true }])).toEqual([
      [{ text: 'a | b' }, { text: 'c', bold: true }],
    ])
  })

  test('a long run of spaces parts the line, and is dropped', () => {
    expect(
      groupsOf([{ text: 'left', color: '#ff0000' }, { text: `${PAD}right` }]),
    ).toEqual([[{ text: 'left', color: '#ff0000' }], [{ text: 'right' }]])
  })

  test('a run inside a span parts that span, both halves keeping its style', () => {
    expect(groupsOf([{ text: `a${PAD}b${' '.repeat(9)}c`, bold: true }])).toEqual([
      [{ text: 'a', bold: true }],
      [{ text: 'b', bold: true }],
      [{ text: 'c', bold: true }],
    ])
  })

  test('a few spaces are text, not padding', () => {
    expect(groupsOf([{ text: 'a   b' }])).toEqual([[{ text: 'a   b' }]])
  })

  test('padding at an end of the line leaves an empty group to hold the side', () => {
    expect(groupsOf([{ text: `${PAD}right` }])).toEqual([[], [{ text: 'right' }]])
  })
})
