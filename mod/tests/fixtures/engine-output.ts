const ESC = '\x1b'

const paint = (colour: number, text: string) =>
  `${ESC}[38;5;${colour}m${text}${ESC}[39m`

/**
 * Two status lines as the engine prints them: each led by a reset, widgets in
 * 256-colour codes, every space a non-breaking one, a newline after each.
 */
export const ENGINE_OUTPUT = `${[
  `${ESC}[0m${paint(30, 'Model: Opus 5.5')} | ${paint(59, 'Ctx: 183.4k')}`,
  `${ESC}[0m${paint(30, 'Total: 22.7M')} | ${paint(111, 'Session: 42.5%')}`,
]
  .join('\n')
  .replaceAll(' ', ' ')}\n`
