type Drawn = {
  type?: string
  props?: Record<string, unknown>
  children?: readonly unknown[]
}

const isDrawn = (value: unknown): value is Drawn =>
  typeof value === 'object' && value !== null

const textOf = (node: unknown): string =>
  typeof node === 'string'
    ? node
    : isDrawn(node)
      ? (node.children ?? []).map(textOf).join('')
      : ''

/** A row's spans: each leaf `Text` with its props, a `Link` adding `href`. */
const spansOf = (node: unknown, href?: unknown): Record<string, unknown>[] => {
  if (!isDrawn(node)) {
    return []
  }

  const children = node.children ?? []

  if (node.type === 'Link') {
    return children.flatMap(child => spansOf(child, node.props?.href))
  }

  return children.every(child => typeof child === 'string')
    ? [{ text: textOf(node), ...node.props, ...(href !== undefined && { href }) }]
    : children.flatMap(child => spansOf(child, href))
}

/**
 * A drawn band read back as rows of spans, non-breaking spaces as plain ones:
 * what the mod drew, in a shape a test compares at a glance.
 *
 * @param tree the band as `ui.drawn()` answers it
 * @returns one array per row, each span its text and `Text` props
 */
export const rowsOf = (tree: unknown): Record<string, unknown>[][] =>
  (isDrawn(tree) ? (tree.children ?? []) : []).map(row =>
    spansOf(row).map(span => ({
      ...span,
      text: String(span.text).replaceAll(' ', ' '),
    })),
  )
