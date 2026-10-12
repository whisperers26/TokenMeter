import { parseAnsi } from './ansi'
import type { Line } from './ansi'
import { effortOf } from './effort'
import type { Host } from './host'
import { pathIn } from './path-in'
import { payloadOf } from './payload'
import type { SessionFacts } from './payload'
import { transcriptPathIn } from './transcript'

/** The engine's entry point, under the plugin's own folder. */
const ENGINE_ENTRY = ['engine', 'ccstatusline.js'] as const

/** The engine's settings file, under the home directory on every platform. */
const ENGINE_SETTINGS = ['.config', 'ccstatusline', 'settings.json'] as const

/** The most of a failure's own words the band is asked to show. */
const FAILURE_MAX_CHARS = 200

/** What a classic hook event carried that the status line shows. */
export type Told = { transcriptPath?: string; effort?: string }

/** What a run of the engine came to: its lines, or why it drew none. */
export type Status = { lines: Line[] } | { failure: string }

/** What one run of the engine is asked to draw for. */
export type StatusRequest = {
  /** The command the engine is run with: `node`, `bun`, or a path to one. */
  runtime: string
  told: Told
  /** The width the engine is told, in character cells; absent to tell none. */
  columns: number | undefined
}

/** The engine as an argument vector: the runtime, then its entry point. */
export const engineOf = (host: Host, runtime: string): string[] => [
  runtime,
  pathIn(host.root, ...ENGINE_ENTRY),
]

/** The engine's settings file; spelled from `~` where no home is known. */
export const engineSettingsPathIn = (home: string | undefined): string =>
  pathIn(home ?? '~', ...ENGINE_SETTINGS)

/**
 * The session's transcript: the one an event named, else the file Claude
 * Code would have written for this session, when it is there.
 */
async function transcriptOf(
  host: Host,
  told: Told,
  home: string | undefined,
  root: string,
  sessionId: string,
) {
  if (told.transcriptPath !== undefined) {
    return told.transcriptPath
  }

  const configDir =
    (await host.configDir()) ??
    (home === undefined ? undefined : pathIn(home, '.claude'))

  if (configDir === undefined) {
    return undefined
  }

  const guess = transcriptPathIn(configDir, root, sessionId)

  return (await host.exists(guess)) ? guess : undefined
}

async function factsOf(
  host: Host,
  told: Told,
  home: string | undefined,
): Promise<SessionFacts> {
  const [sessionId, cwd, root, model, version, usage, now, settings, flag] =
    await Promise.all([
      host.sessionId(),
      host.cwd(),
      host.projectRoot(),
      host.model(),
      // The lines are worth more than the one widget that shows the version
      host.version().then(
        said => said.version,
        () => undefined,
      ),
      host.usage(),
      host.now(),
      host.settings(),
      host.settings('flag').catch(() => ({})),
    ])

  const transcriptPath = await transcriptOf(host, told, home, root, sessionId)
  const { outputStyle } = settings

  // A turn's own word is the session's effort as it ran; before one, or after
  // /effort auto, the settings' is the nearest there is
  const effort = told.effort ?? effortOf(settings, flag, model)

  return {
    sessionId,
    cwd,
    root,
    model,
    now,
    usage,
    ...(version !== undefined && { version }),
    ...(transcriptPath !== undefined && { transcriptPath }),
    ...(effort !== undefined && { effort }),
    ...(typeof outputStyle === 'string' && { outputStyle }),
  }
}

/** The first line of `text` that says anything, cut to fit a band's row. */
const firstLineOf = (text: string) =>
  (text.split('\n').find(line => line.trim() !== '') ?? '')
    .trim()
    .slice(0, FAILURE_MAX_CHARS)

/**
 * Runs the engine once on the session as it stands and reads what it printed:
 * the status lines a terminal's `statusLine` command would have shown.
 *
 * Never rejects: a run that could not be made, or that the engine failed, is
 * answered as a `failure` the band can show in the lines' place.
 *
 * @param host the calls on Claude Code the run is made with
 * @param request what the session's events told, and the width to tell
 * @returns the lines, each as its styled spans, or why there are none
 */
export async function statusOf(
  host: Host,
  { runtime, told, columns }: StatusRequest,
): Promise<Status> {
  try {
    const home = await host.home()
    const facts = await factsOf(host, told, home)

    const ran = await host.run(engineOf(host, runtime), {
      stdin: JSON.stringify(payloadOf(facts)),
      ...(columns !== undefined && {
        env: { CCSTATUSLINE_WIDTH: String(columns) },
      }),
    })

    if (ran.exitCode !== 0) {
      const said = firstLineOf(ran.stderr) || `exit code ${ran.exitCode}`

      return { failure: `the engine failed (${said})` }
    }

    return { lines: parseAnsi(ran.stdout) }
  } catch (error) {
    const said = firstLineOf(error instanceof Error ? error.message : String(error))

    return { failure: `the engine did not run (${said})` }
  }
}
