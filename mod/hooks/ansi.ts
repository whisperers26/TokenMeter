/**
 * One run of text of a single style, as the band draws it: `text` and the
 * `Text` props that style it, with `href` when a hyperlink wraps it.
 */
export type Span = {
  text: string
  color?: string
  backgroundColor?: string
  bold?: true
  dimColor?: true
  italic?: true
  underline?: true
  inverse?: true
  strikethrough?: true
  href?: string
}

export type Line = Span[]

type Style = Omit<Span, 'text' | 'href'>

/**
 * A CSI sequence (its parameters and final byte), an OSC sequence (its
 * payload, ended by a bell or ST), any other two-character escape, or a
 * carriage return: everything in the engine's output that is not text.
 */
const SEQUENCE =
  /\x1b\[([0-9:;<=>?]*)[ -/]*([@-~])|\x1b\]([^\x07\x1b]*)(?:\x07|\x1b\\)|\x1b[@-Z\\^_]|\r/g

/** xterm's defaults for the sixteen basic colours, normal then bright. */
const BASIC = [
  '#000000',
  '#cd0000',
  '#00cd00',
  '#cdcd00',
  '#0000ee',
  '#cd00cd',
  '#00cdcd',
  '#e5e5e5',
  '#7f7f7f',
  '#ff0000',
  '#00ff00',
  '#ffff00',
  '#5c5cff',
  '#ff00ff',
  '#00ffff',
  '#ffffff',
] as const

const CUBE_LEVELS = [0, 95, 135, 175, 215, 255] as const

/** The SGR codes that switch one style on. */
const STYLE_ON: Readonly<Record<number, keyof Style>> = {
  1: 'bold',
  2: 'dimColor',
  3: 'italic',
  4: 'underline',
  7: 'inverse',
  9: 'strikethrough',
}

/** The SGR codes that end styles or a colour, and what each ends. */
const STYLE_OFF: Readonly<Record<number, readonly (keyof Style)[]>> = {
  22: ['bold', 'dimColor'],
  23: ['italic'],
  24: ['underline'],
  27: ['inverse'],
  29: ['strikethrough'],
  39: ['color'],
  49: ['backgroundColor'],
}

const hexOf = (red: number, green: number, blue: number) =>
  `#${[red, green, blue]
    .map(value =>
      Math.min(255, Math.max(0, Math.trunc(value)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`

/** The xterm 256-colour palette: sixteen basics, a 6x6x6 cube, 24 greys. */
function indexedColorOf(index: number | undefined): string | undefined {
  if (index === undefined || !Number.isInteger(index) || index < 0 || index > 255) {
    return undefined
  }

  if (index < 16) {
    return BASIC[index]
  }

  if (index < 232) {
    const cell = index - 16

    return hexOf(
      CUBE_LEVELS[Math.floor(cell / 36)] ?? 0,
      CUBE_LEVELS[Math.floor(cell / 6) % 6] ?? 0,
      CUBE_LEVELS[cell % 6] ?? 0,
    )
  }

  const grey = 8 + 10 * (index - 232)

  return hexOf(grey, grey, grey)
}

/**
 * The colour an extended-colour selector names: `5, index`, or `2` and a
 * red, green, blue triple (the colon form may put a colour-space field
 * between them, so the triple is read from the end).
 */
function extendedColorOf(selector: readonly number[]): string | undefined {
  if (selector[0] === 5) {
    return indexedColorOf(selector[1])
  }

  if (selector[0] === 2 && selector.length >= 4) {
    const [red = 0, green = 0, blue = 0] = selector.slice(-3)

    return hexOf(red, green, blue)
  }

  return undefined
}

function without(style: Style, keys: readonly (keyof Style)[]): Style {
  return Object.fromEntries(
    Object.entries(style).filter(([key]) => !keys.includes(key as keyof Style)),
  )
}

/** `style` after one SGR sequence's parameters, read left to right. */
function styledBy(style: Style, parameters: string): Style {
  const groups = parameters
    .split(';')
    .map(group => group.split(':').map(part => (part === '' ? 0 : Number(part))))

  let next = style

  for (let at = 0; at < groups.length; at += 1) {
    const group = groups[at] ?? [0]
    const code = group[0] ?? 0
    const on = STYLE_ON[code]
    const off = STYLE_OFF[code]

    if (code === 38 || code === 48) {
      // The colon form holds the whole selector in this group; the semicolon
      // form spreads it over the parameters that follow
      const isColonForm = group.length > 1
      const kind = isColonForm ? group[1] : groups[at + 1]?.[0]
      const taken = kind === 5 ? 2 : kind === 2 ? 4 : 0

      const color = extendedColorOf(
        isColonForm
          ? group.slice(1)
          : groups.slice(at + 1, at + 1 + taken).map(one => one[0] ?? 0),
      )

      if (color !== undefined) {
        next = { ...next, [code === 38 ? 'color' : 'backgroundColor']: color }
      }

      at += isColonForm ? 0 : taken
    } else if (code === 0) {
      next = {}
    } else if (on !== undefined) {
      next = { ...next, [on]: true }
    } else if (off !== undefined) {
      next = without(next, off)
    } else if (code >= 30 && code <= 37) {
      next = { ...next, color: BASIC[code - 30] }
    } else if (code >= 40 && code <= 47) {
      next = { ...next, backgroundColor: BASIC[code - 40] }
    } else if (code >= 90 && code <= 97) {
      next = { ...next, color: BASIC[code - 90 + 8] }
    } else if (code >= 100 && code <= 107) {
      next = { ...next, backgroundColor: BASIC[code - 100 + 8] }
    }
  }

  return next
}

/** A span of `style`, its props in one fixed order whatever set them. */
function spanOf(text: string, style: Style, href: string | undefined): Span {
  return {
    text,
    ...(style.color !== undefined && { color: style.color }),
    ...(style.backgroundColor !== undefined && {
      backgroundColor: style.backgroundColor,
    }),
    ...(style.bold && { bold: true }),
    ...(style.dimColor && { dimColor: true }),
    ...(style.italic && { italic: true }),
    ...(style.underline && { underline: true }),
    ...(style.inverse && { inverse: true }),
    ...(style.strikethrough && { strikethrough: true }),
    ...(href !== undefined && { href }),
  }
}

const styleKeyOf = ({ text: _text, ...style }: Span) => JSON.stringify(style)

/** The address an OSC payload opens as a hyperlink (`8;params;URI`). */
function hrefOf(payload: string): string | undefined {
  const address = payload.split(';').slice(2).join(';')

  return address === '' ? undefined : address
}

/**
 * Reads the engine's output, text styled by SGR sequences and wrapped in
 * OSC 8 hyperlinks, into lines of spans a surface can draw.
 *
 * Colours are spelled as hex, the one spelling every surface takes. A style
 * left open carries across a line break, as a terminal carries it; any other
 * escape sequence is dropped, and so is a line that shows no text.
 *
 * @param output what the engine wrote to standard output
 * @returns the lines that show text, each as its spans in order
 */
export function parseAnsi(output: string): Line[] {
  const lines: Line[] = []

  let line: Line = []
  let style: Style = {}
  let href: string | undefined

  const write = (text: string) => {
    if (text === '') {
      return
    }

    const span = spanOf(text, style, href)
    const last = line.at(-1)

    if (last !== undefined && styleKeyOf(last) === styleKeyOf(span)) {
      line[line.length - 1] = { ...last, text: last.text + text }
    } else {
      line.push(span)
    }
  }

  const endLine = () => {
    if (line.length > 0) {
      lines.push(line)
    }

    line = []
  }

  const writeText = (text: string) => {
    text.split('\n').forEach((piece, at) => {
      if (at > 0) {
        endLine()
      }

      write(piece)
    })
  }

  let from = 0

  for (const match of output.matchAll(SEQUENCE)) {
    writeText(output.slice(from, match.index))
    from = match.index + match[0].length

    const [, parameters, final, payload] = match

    if (final === 'm') {
      style = styledBy(style, parameters ?? '')
    } else if (payload?.startsWith('8;')) {
      href = hrefOf(payload)
    }
  }

  writeText(output.slice(from))
  endLine()

  return lines
}
