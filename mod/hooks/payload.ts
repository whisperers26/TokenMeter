import type { SessionUsage } from 'claude-code'

/**
 * What the mod knows of the session when it asks the engine for a status
 * line: read off `$.session` and `$.clock`, or told by a session event.
 */
export type SessionFacts = {
  sessionId: string
  cwd: string
  root: string
  model: string
  /** Claude Code's version; absent on one too old to say it. */
  version?: string
  now: number
  usage: SessionUsage
  transcriptPath?: string
  effort?: string
  outputStyle?: string
}

/**
 * The status line input Claude Code pipes to a `statusLine` command, as far
 * as a mod can fill it in: what the engine reads on standard input.
 */
export type StatusPayload = {
  hook_event_name: 'Status'
  session_id: string
  transcript_path?: string
  cwd: string
  model: { id: string; display_name: string }
  workspace: { current_dir: string; project_dir: string }
  version?: string
  output_style?: { name: string }
  effort?: { level: string }
  cost: { total_cost_usd?: number; total_duration_ms: number }
  context_window: {
    context_window_size: number
    total_input_tokens?: number
    current_usage?: number
    used_percentage?: number
    remaining_percentage?: number
  }
  rate_limits?: Record<string, { used_percentage: number; resets_at?: number }>
}

/** `claude-opus-5-5`, with or without a trailing release date. */
const FAMILY_FIRST = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?$/

/** `claude-3-5-sonnet-20241022`, the older spelling. */
const VERSION_FIRST = /^claude-(\d+)(?:-(\d{1,2}))?-([a-z]+)(?:-\d{8})?$/

const LONG_CONTEXT = /\[1m\]$/i

/**
 * The name Claude Code shows for a model id (`Opus 5.5` for
 * `claude-opus-5-5`), which the status line gets beside the id.
 *
 * `$.session.model()` answers the id alone, so the name is read off it; a
 * string that is not spelled as a Claude model id is returned as given.
 *
 * @param model the model as `$.session.model()` answers it
 * @returns its display name
 */
export function displayNameOf(model: string): string {
  const id = model.replace(LONG_CONTEXT, '')
  const familyFirst = FAMILY_FIRST.exec(id)
  const versionFirst = VERSION_FIRST.exec(id)

  const [family, major, minor] = familyFirst
    ? [familyFirst[1], familyFirst[2], familyFirst[3]]
    : versionFirst
      ? [versionFirst[3], versionFirst[1], versionFirst[2]]
      : []

  if (family === undefined || major === undefined) {
    return model
  }

  const name = `${family.charAt(0).toUpperCase()}${family.slice(1)}`
  const version = minor === undefined ? major : `${major}.${minor}`
  const context = LONG_CONTEXT.test(model) ? ' (1M context)' : ''

  return `${name} ${version}${context}`
}

function contextWindowOf({
  window,
  tokens,
  percent,
}: SessionUsage['context']): StatusPayload['context_window'] {
  return {
    context_window_size: window,
    ...(tokens !== undefined && {
      total_input_tokens: tokens,
      current_usage: tokens,
    }),
    ...(percent !== undefined && {
      used_percentage: percent,
      remaining_percentage: Math.max(0, 100 - percent),
    }),
  }
}

function rateLimitsOf(
  rateLimits: SessionUsage['rateLimits'],
): NonNullable<StatusPayload['rate_limits']> {
  return Object.fromEntries(
    rateLimits.map(({ kind, percentUsed, resetsAt }) => {
      const resetsAtMs =
        resetsAt === undefined ? Number.NaN : Date.parse(resetsAt)

      return [
        kind,
        {
          used_percentage: percentUsed,
          ...(Number.isFinite(resetsAtMs) && {
            resets_at: Math.floor(resetsAtMs / 1000),
          }),
        },
      ]
    }),
  )
}

/**
 * Builds the status line input for the engine from the session's facts.
 *
 * A figure the session does not have yet is left out, never zeroed: the
 * engine then falls back to its own source for it (the transcript, the
 * usage API) exactly as it does under a terminal.
 *
 * @param facts the session as the mod last read it
 * @returns the payload, ready to be written to the engine as JSON
 */
export function payloadOf(facts: SessionFacts): StatusPayload {
  const { context, rateLimits, cost, startedAt } = facts.usage

  return {
    hook_event_name: 'Status',
    session_id: facts.sessionId,
    ...(facts.transcriptPath !== undefined && {
      transcript_path: facts.transcriptPath,
    }),
    cwd: facts.cwd,
    model: { id: facts.model, display_name: displayNameOf(facts.model) },
    workspace: { current_dir: facts.cwd, project_dir: facts.root },
    ...(facts.version !== undefined && { version: facts.version }),
    ...(facts.outputStyle !== undefined && {
      output_style: { name: facts.outputStyle },
    }),
    ...(facts.effort !== undefined && { effort: { level: facts.effort } }),
    cost: {
      ...(cost !== undefined && { total_cost_usd: cost.usd }),
      total_duration_ms: Math.max(0, facts.now - startedAt),
    },
    context_window: contextWindowOf(context),
    ...(rateLimits.length > 0 && { rate_limits: rateLimitsOf(rateLimits) }),
  }
}
