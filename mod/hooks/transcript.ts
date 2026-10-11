import { pathIn } from './path-in'

/**
 * Where Claude Code keeps a session's transcript: under its config
 * directory's `projects`, in a folder named for the project root (every
 * character that is no letter or digit a dash), in a file named for the
 * session.
 *
 * A session event names the transcript outright; this is the mod's guess
 * for a session it joined after those events, checked before it is used.
 *
 * @param configDir Claude Code's config directory (`~/.claude`)
 * @param root the session's project root, absolute
 * @param sessionId the session's id
 * @returns the transcript's path, spelled with the config directory's separator
 */
export function transcriptPathIn(
  configDir: string,
  root: string,
  sessionId: string,
): string {
  const project = root.replace(/[^a-zA-Z0-9]/g, '-')

  return pathIn(configDir, 'projects', project, `${sessionId}.jsonl`)
}
