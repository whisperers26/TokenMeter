import { parseAnsi } from './ansi'
import type { Line } from './ansi'
import type { Host } from './host'
import { pathIn } from './path-in'
import { payloadOf } from './payload'
import type { SessionFacts } from './payload'
import { transcriptPathIn } from './transcript'
import { flexReserveOf } from './width'

/** The engine's entry point, under the plugin's own folder. */
const ENGINE_ENTRY = 'engine/ccstatusline.js'

/** The engine's settings file, under the home directory on every platform. */
const ENGINE_SETTINGS = ['.config', 'ccstatusline', 'settings.json'] as const

/** What a classic hook event carried that the status line shows. */
export type Told = { transcriptPath?: string; effort?: string }

/** What one run of the engine is asked to draw for. */
export type StatusRequest = {
  told: Told
  /** The narrowest band drawn, in character cells; absent when none is. */
  columns: number | undefined
}

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
  const [sessionId, cwd, root, model, { version }, usage, now, settings] =
    await Promise.all([
      host.sessionId(),
      host.cwd(),
      host.projectRoot(),
      host.model(),
      host.version(),
      host.usage(),
      host.now(),
      host.settings(),
    ])

  const transcriptPath = await transcriptOf(host, told, home, root, sessionId)
  const { outputStyle } = settings

  return {
    sessionId,
    cwd,
    root,
    model,
    version,
    now,
    usage,
    ...(transcriptPath !== undefined && { transcriptPath }),
    ...(told.effort !== undefined && { effort: told.effort }),
    ...(typeof outputStyle === 'string' && { outputStyle }),
  }
}

/**
 * The width to tell the engine so that its lines fill a band of `columns`:
 * those columns, plus what the engine will hold back of them.
 */
async function widthOf(
  host: Host,
  home: string | undefined,
  columns: number,
  contextPercent: number | undefined,
) {
  const settingsText =
    home === undefined
      ? undefined
      : await host
          .readFile(pathIn(home, ...ENGINE_SETTINGS))
          .catch(() => undefined)

  return columns + flexReserveOf(settingsText, contextPercent)
}

/**
 * Runs the engine once on the session as it stands and reads what it printed:
 * the status lines a terminal's `statusLine` command would have shown.
 *
 * @param host the calls on Claude Code the run is made with
 * @param request what the session's events told, and the band's width
 * @returns the lines, each as its styled spans
 */
export async function statusLinesOf(
  host: Host,
  { told, columns }: StatusRequest,
): Promise<Line[]> {
  const home = await host.home()
  const facts = await factsOf(host, told, home)

  const width =
    columns === undefined
      ? undefined
      : await widthOf(host, home, columns, facts.usage.context.percent)

  const ran = await host.run(['node', pathIn(host.root, ENGINE_ENTRY)], {
    stdin: JSON.stringify(payloadOf(facts)),
    ...(width !== undefined && { env: { CCSTATUSLINE_WIDTH: String(width) } }),
  })

  return parseAnsi(ran.stdout)
}
