import type { Status } from './status'

/** What a report says of the engine beside its lines. */
export type ReportDetails = {
  /** The engine as it is run: the runtime, then its entry point. */
  engine: readonly string[]
  /** The engine's own settings file. */
  settingsPath: string
}

/** An argument vector as a line a person can paste into a shell. */
function commandOf([runtime = '', ...rest]: readonly string[]): string {
  return [
    /\s/.test(runtime) ? `"${runtime}"` : runtime,
    ...rest.map(argument => `"${argument}"`),
  ].join(' ')
}

/**
 * Text as it is to be read to the letter. The report is drawn as markdown, and
 * outside a code span a Windows path loses each backslash before a dot there.
 */
function verbatim(text: string): string {
  return `\`${text}\``
}

/**
 * What `/ccstatusline-desktop` answers: the status lines as plain text (or why there
 * are none), then where their layout is kept and how to change it.
 *
 * The lines come first so that a headless run (`claude -p "/ccstatusline-desktop"`)
 * shows at a glance what the band would.
 *
 * @param status what the run the command just made came to
 * @param details how the engine is run, and its settings file
 * @returns the report, one item a line
 */
export function reportOf(
  status: Status,
  { engine, settingsPath }: ReportDetails,
): string {
  const command = verbatim(commandOf(engine))

  if ('failure' in status) {
    return [
      `ccstatusline desktop: ${status.failure}`,
      '',
      `The engine is run as: ${command}`,
      'If that runtime is not found, set the "runtime" option of the ccstatusline-desktop plugin to the full path of node or bun.',
    ].join('\n')
  }

  const shown =
    status.lines.length === 0
      ? ['The engine has no line to show: its layout is empty, or every widget in it is hidden.']
      : status.lines.map(line =>
          line
            .map(span => span.text)
            .join('')
            .replaceAll(' ', ' '),
        )

  return [
    ...shown,
    '',
    `Layout, widgets and colours: ${verbatim(settingsPath)}`,
    `To change them, run this in a terminal: ${command}`,
  ].join('\n')
}
