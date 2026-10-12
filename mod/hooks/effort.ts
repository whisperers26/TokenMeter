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
