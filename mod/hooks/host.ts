import type {
  ProcessRunInit,
  ProcessRunResult,
  SessionUsage,
  SessionVersion,
  Settings,
  Timer,
} from 'claude-code'

/**
 * What the mod asks of Claude Code, bound once at `session.start` so that
 * work outliving a hook's dispatch (a timer, a refresh) can ask too.
 *
 * Each member is one call on `$`, spelled at the hook that binds it.
 */
export type Host = {
  /** The plugin's own folder, absolute. */
  root: string
  now: () => Promise<number>
  after: (ms: number, fn: () => void) => Timer
  run: (
    argv: readonly string[],
    init?: ProcessRunInit,
  ) => Promise<ProcessRunResult>
  invalidate: () => void
  sessionId: () => Promise<string>
  cwd: () => Promise<string>
  projectRoot: () => Promise<string>
  model: () => Promise<string>
  version: () => Promise<SessionVersion>
  usage: () => Promise<SessionUsage>
  settings: () => Promise<Settings>
  exists: (path: string) => Promise<boolean>
  readFile: (path: string) => Promise<string>
  /** `CLAUDE_CONFIG_DIR`, when the person moved Claude Code's config. */
  configDir: () => Promise<string | undefined>
  /** The person's home directory, when the environment names one. */
  home: () => Promise<string | undefined>
}
