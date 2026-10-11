import { describe, expect, test } from 'claude-code/testing'

import { parseAnsi } from '../hooks/ansi'

const ESC = '\x1b'

describe('ansi', () => {
  test('plain text is one line of one span', () => {
    expect(parseAnsi('Model: Opus')).toEqual([[{ text: 'Model: Opus' }]])
  })

  test('a 256-colour foreground is spelled as hex', () => {
    expect(parseAnsi(`${ESC}[38;5;30mModel`)).toEqual([
      [{ text: 'Model', color: '#008787' }],
    ])
  })

  test('the default-foreground code ends a colour', () => {
    expect(parseAnsi(`${ESC}[38;5;178mA${ESC}[39m | B`)).toEqual([
      [{ text: 'A', color: '#d7af00' }, { text: ' | B' }],
    ])
  })

  test('the 256 palette covers its basic, cube and grey ranges', () => {
    const colourOf = (index: number) =>
      parseAnsi(`${ESC}[38;5;${index}mx`)[0]?.[0]?.color

    expect([1, 9, 16, 196, 231, 232, 244, 255].map(colourOf)).toEqual([
      '#cd0000',
      '#ff0000',
      '#000000',
      '#ff0000',
      '#ffffff',
      '#080808',
      '#808080',
      '#eeeeee',
    ])
  })

  test('truecolor sets foreground and background in one sequence', () => {
    expect(parseAnsi(`${ESC}[38;2;255;128;0;48;2;0;0;64mX`)).toEqual([
      [{ text: 'X', color: '#ff8000', backgroundColor: '#000040' }],
    ])
  })

  test('colon-separated colour parameters read like semicolons', () => {
    expect(parseAnsi(`${ESC}[38:5:30mA${ESC}[38:2::255:0:0mB`)).toEqual([
      [
        { text: 'A', color: '#008787' },
        { text: 'B', color: '#ff0000' },
      ],
    ])
  })

  test('the sixteen basic colours map to fixed hex values', () => {
    expect(parseAnsi(`${ESC}[31mA${ESC}[91mB${ESC}[44mC${ESC}[102mD`)).toEqual([
      [
        { text: 'A', color: '#cd0000' },
        { text: 'B', color: '#ff0000' },
        { text: 'C', color: '#ff0000', backgroundColor: '#0000ee' },
        { text: 'D', color: '#ff0000', backgroundColor: '#00ff00' },
      ],
    ])
  })

  test('the default-background code ends a background', () => {
    expect(parseAnsi(`${ESC}[41mA${ESC}[49mB`)).toEqual([
      [{ text: 'A', backgroundColor: '#cd0000' }, { text: 'B' }],
    ])
  })

  test('text styles become the Text props of the same meaning', () => {
    expect(parseAnsi(`${ESC}[1;2;3;4;7;9mx`)).toEqual([
      [
        {
          text: 'x',
          bold: true,
          dimColor: true,
          italic: true,
          underline: true,
          inverse: true,
          strikethrough: true,
        },
      ],
    ])
  })

  test('each style has a code that ends it alone', () => {
    const on = `${ESC}[1;2;3;4;7;9m`

    expect(
      parseAnsi(
        `${on}a${ESC}[22mb${ESC}[23mc${ESC}[24md${ESC}[27me${ESC}[29mf`,
      )[0]?.map(span => Object.keys(span).filter(key => key !== 'text')),
    ).toEqual([
      ['bold', 'dimColor', 'italic', 'underline', 'inverse', 'strikethrough'],
      ['italic', 'underline', 'inverse', 'strikethrough'],
      ['underline', 'inverse', 'strikethrough'],
      ['inverse', 'strikethrough'],
      ['strikethrough'],
      [],
    ])
  })

  test('a reset clears every style and colour', () => {
    expect(parseAnsi(`${ESC}[1;31;44mA${ESC}[0mB${ESC}[1mC${ESC}[mD`)).toEqual([
      [
        { text: 'A', color: '#cd0000', backgroundColor: '#0000ee', bold: true },
        { text: 'B' },
        { text: 'C', bold: true },
        { text: 'D' },
      ],
    ])
  })

  test('neighbouring text of one style is one span', () => {
    expect(parseAnsi(`${ESC}[31mA${ESC}[31mB${ESC}[39m${ESC}[31mC`)).toEqual([
      [{ text: 'ABC', color: '#cd0000' }],
    ])
  })

  test('output is split into lines, a carriage return dropped', () => {
    expect(parseAnsi('one\r\ntwo\n')).toEqual([
      [{ text: 'one' }],
      [{ text: 'two' }],
    ])
  })

  test('a line with nothing to show is left out', () => {
    expect(parseAnsi(`one\n${ESC}[0m\n\ntwo`)).toEqual([
      [{ text: 'one' }],
      [{ text: 'two' }],
    ])
  })

  test('a colour left open carries onto the next line', () => {
    expect(parseAnsi(`${ESC}[31mone\ntwo`)).toEqual([
      [{ text: 'one', color: '#cd0000' }],
      [{ text: 'two', color: '#cd0000' }],
    ])
  })

  test('non-breaking spaces are kept as the engine wrote them', () => {
    expect(parseAnsi('a | b')).toEqual([[{ text: 'a | b' }]])
  })

  test('an OSC 8 hyperlink puts its address on the text it wraps', () => {
    const open = `${ESC}]8;;https://example.com/pr/1${ESC}\\`
    const close = `${ESC}]8;;${ESC}\\`

    expect(parseAnsi(`${open}${ESC}[32mPR #1${close} ok`)).toEqual([
      [
        { text: 'PR #1', color: '#00cd00', href: 'https://example.com/pr/1' },
        { text: ' ok', color: '#00cd00' },
      ],
    ])
  })

  test('a hyperlink may end with a bell instead', () => {
    expect(parseAnsi(`${ESC}]8;;https://example.com\x07x${ESC}]8;;\x07y`)).toEqual([
      [{ text: 'x', href: 'https://example.com' }, { text: 'y' }],
    ])
  })

  test('escape sequences that style nothing are dropped', () => {
    expect(parseAnsi(`a${ESC}[2K${ESC}[1Ab${ESC}]0;title\x07c`)).toEqual([
      [{ text: 'abc' }],
    ])
  })
})
