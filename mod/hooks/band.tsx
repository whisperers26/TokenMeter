import type { Elements, RenderElement, RenderSurface } from 'claude-code'

import type { Line } from './ansi'
import { groupsOf } from './groups'
import type { Status } from './status'

/** The elements the band is drawn with, which every surface's table has. */
type BandElements = Pick<Elements[RenderSurface], 'Box' | 'Text' | 'Link'>

/**
 * The band's tree for a status: one row per status line, its spans coloured
 * as the engine coloured them and a hyperlink's text a link, or one dim row
 * saying why there are no lines.
 *
 * A row is one paragraph cut at the band's edge, never wrapped: the engine
 * has already fitted each line to the width it was told.
 *
 * @param elements the surface's own constructors, from `$.ui.resolve(e)`
 * @param status what the last run of the engine came to
 * @returns the tree to draw above the prompt
 */
export function bandOf(
  { Box, Text, Link }: BandElements,
  status: Status,
): RenderElement {
  if ('failure' in status) {
    return (
      <Box flexDirection="column">
        <Text dimColor wrap="truncate-end">
          {`ccstatusline desktop: ${status.failure}`}
        </Text>
      </Box>
    )
  }

  const row = (line: Line) => (
    <Text wrap="truncate-end">
      {line.map(({ text, href, ...style }) =>
        href === undefined ? (
          <Text {...style}>{text}</Text>
        ) : (
          <Link href={href}>
            <Text {...style}>{text}</Text>
          </Link>
        ),
      )}
    </Text>
  )

  return (
    <Box flexDirection="column">
      {status.lines.map(line => {
        const groups = groupsOf(line)

        // Where the engine padded a line apart, the surface does the spacing
        return groups.length === 1 ? (
          row(line)
        ) : (
          <Box justifyContent="space-between">{groups.map(row)}</Box>
        )
      })}
    </Box>
  )
}
