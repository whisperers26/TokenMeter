import type { Settings } from 'claude-code'

/** The levels the status line's `effort.level` names. */
const LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const

/** `/effort` printing that it set the session to a level the status line names. */
const SET = /^Set effort level to (low|medium|high|xhigh|max)\b/

/** `/effort auto`: the session's effort handed back to the model's own. */
const AUTO = /^Effort level set to auto\b/

/**
 * What a run of `/effort` says of the session's effort, read off what it
 * printed.
 *
 * Claude Code hands a mod no call for the session's effort, and an `/effort`
 * typed between two turns fires no event but its own: its output is the one
 * place the new level is spelled.
 *
 * @param text what the command printed
 * @returns the level the session was set to; null where it was handed back to
 *   the model (auto); undefined where it said nothing of the level (usage, a
 *   refusal, a mode that is no level)
 */
export function effortSaidBy(text: string): string | null | undefined {
  if (AUTO.test(text)) {
    return null
  }

  return SET.exec(text)?.[1]
}

/**
 * The effort Claude Code's settings name: `effortLevel`, which a host that
 * sets the session's effort (an IDE's or the desktop app's picker) writes
 * where `$.settings.read` sees it at once, with no event to say so.
 *
 * @param settings Claude Code's settings, merged over every source
 * @returns the level; undefined where none is named, or one the status line
 *   has no name for
 */
export function effortLevelOf(settings: Settings): string | undefined {
  const { effortLevel } = settings

  return LEVELS.find(level => level === effortLevel)
}

/** A model's name with its context and release suffixes off, in lower case. */
const canonicalOf = (model: string): string =>
  model
    .trim()
    .toLowerCase()
    .replace(/\[[^\]]*\]$/, '')
    .replace(/-\d{8}$/, '')

/** The level saved for `model` in `modelSettings`, by the name it is saved under. */
function savedEffortOf(settings: Settings, model: string): string | undefined {
  const { modelSettings } = settings

  if (typeof modelSettings !== 'object' || modelSettings === null) {
    return undefined
  }

  const wanted = canonicalOf(model)

  const entry = Object.entries(modelSettings).find(
    ([name]) => canonicalOf(name) === wanted,
  )?.[1]

  return typeof entry === 'object' && entry !== null
    ? effortLevelOf(entry as Settings)
    : undefined
}

/**
 * The effort a session has, as far as Claude Code's settings say it: the level
 * a host put in the flag layer, else the one saved for the session's model
 * (where `/effort` and the effort picker of a terminal write it), else the
 * top-level one.
 *
 * @param settings Claude Code's settings, merged over every source
 * @param flag the flag layer of them, where a host's pick is
 * @param model the session's model, as `$.session.model()` names it
 * @returns the level; undefined where the settings name none
 */
export function effortOf(
  settings: Settings,
  flag: Settings,
  model: string,
): string | undefined {
  return (
    effortLevelOf(flag) ??
    savedEffortOf(settings, model) ??
    effortLevelOf(settings)
  )
}
