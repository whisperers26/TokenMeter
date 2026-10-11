import type { Line, Span } from './ansi'

/**
 * A run of spaces this long is the engine's padding (a flex separator filled
 * out to the width it was told), not text: widgets space themselves by ones.
 */
const PADDING = /[  ]{4,}/

/**
 * Parts a line where the engine padded it apart, dropping the padding: the
 * groups a surface can push to the band's edges itself.
 *
 * The engine right-aligns by counting character cells. A surface that draws
 * text in a proportional font has no cells, so the same spaces land anywhere;
 * laying the groups out with space between them puts them where they belong.
 *
 * @param line one status line, as its spans
 * @returns its groups left to right; a line with no padding is one group
 */
export function groupsOf(line: Line): Line[] {
  const groups: Line[] = [[]]

  const add = (span: Span) => {
    if (span.text !== '') {
      groups.at(-1)?.push(span)
    }
  }

  for (const span of line) {
    const [first = '', ...rest] = span.text.split(PADDING)

    add({ ...span, text: first })

    for (const text of rest) {
      groups.push([])
      add({ ...span, text })
    }
  }

  return groups
}
