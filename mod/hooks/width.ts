/** What the engine keeps free at the right of a terminal it fills. */
const NARROW_RESERVE = 6

/** What it keeps free for Claude Code's own notices beside a status line. */
const WIDE_RESERVE = 40

/** The engine's default `compactThreshold`, a context percentage. */
const DEFAULT_COMPACT_THRESHOLD = 60

function parsed(settingsText: string | undefined): Record<string, unknown> {
  try {
    const settings: unknown = JSON.parse(settingsText ?? '')

    return typeof settings === 'object' && settings !== null
      ? (settings as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

/**
 * The columns the engine holds back from the width it is told, by the flex
 * mode of its settings: what to add to the band's width so that the engine's
 * lines fill the band and its flex separators reach the band's edge.
 *
 * Under a terminal the reserve leaves room for what Claude Code draws beside
 * the status line; the band has no such neighbour. This mirrors
 * `resolveEffectiveTerminalWidth` in the engine's `src/utils/renderer.ts`.
 *
 * @param settingsText the engine's settings file as text, when it was read
 * @param contextPercent how full the context window is, 0 to 100
 * @returns the reserve in columns
 */
export function flexReserveOf(
  settingsText: string | undefined,
  contextPercent: number | undefined,
): number {
  const { flexMode, compactThreshold } = parsed(settingsText)

  if (flexMode === 'full-minus-40') {
    return WIDE_RESERVE
  }

  if (flexMode === 'full-until-compact') {
    const threshold =
      typeof compactThreshold === 'number'
        ? compactThreshold
        : DEFAULT_COMPACT_THRESHOLD

    return (contextPercent ?? 0) >= threshold ? WIDE_RESERVE : NARROW_RESERVE
  }

  return NARROW_RESERVE
}
