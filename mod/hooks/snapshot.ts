import type { Line } from './ansi'
import { groupsOf } from './groups'
import type { Host } from './host'
import { pathIn } from './path-in'
import type { Status } from './status'

/**
 * The folder snapshots and their reader's sign of life are kept in, under
 * the home directory on every platform, as the engine's settings are.
 */
const FOLDER = ['.cache', 'ccstatusline-desktop'] as const

/** How long after a reader's last sign of life snapshots are kept for it. */
const READER_TTL_MS = 5 * 60_000

/** The run a snapshot is of. */
export type SnapshotRun = {
  sessionId: string
  /** The time of the run, in milliseconds since the epoch. */
  now: number
  /**
   * How long from then the lines stay fresh, in milliseconds: the wait for
   * the mod to run them again. Absent where nothing will.
   */
  freshFor?: number
}

/**
 * A session's status lines as last run, for a reader that cannot ask the mod
 * to draw them: an IDE showing the band for a session it hosts.
 *
 * Each row is one status line as its groups, the parts a reader pushes to
 * the band's edges; a failure stands in the rows' place, as it does in the
 * band. Past `freshUntil` the session has stopped running its lines, and a
 * reader shows them as old.
 */
export type Snapshot = {
  version: 1
  sessionId: string
  updatedAt: number
  freshUntil?: number
} & ({ rows: { groups: Line[] }[] } | { failure: string })

/**
 * The file a reader of snapshots keeps its sign of life in: the time it was
 * last there, in milliseconds since the epoch, as text.
 */
export const readerPathIn = (home: string): string =>
  pathIn(home, ...FOLDER, 'reader')

/** A session's snapshot: one file, named for the session. */
export const snapshotPathIn = (home: string, sessionId: string): string =>
  pathIn(home, ...FOLDER, 'sessions', `${sessionId}.json`)

/**
 * The snapshot of one run of the engine.
 *
 * @param status what the run came to
 * @param run the session the run was made for, and its time
 * @returns the snapshot, ready to be written as JSON
 */
export function snapshotOf(
  status: Status,
  { sessionId, now, freshFor }: SnapshotRun,
): Snapshot {
  return {
    version: 1,
    sessionId,
    updatedAt: now,
    ...(freshFor !== undefined && { freshUntil: now + freshFor }),
    ...('failure' in status
      ? { failure: status.failure }
      : { rows: status.lines.map(line => ({ groups: groupsOf(line) })) }),
  }
}

/**
 * Where the session's snapshot goes, while snapshots are read on this
 * machine: a reader was there within the last few minutes.
 *
 * A reader that stopped (an IDE closed, its plugin removed) leaves its sign
 * of life to go stale, and sessions stop running the engine for it.
 *
 * @param host the calls on Claude Code the answer is made with
 * @returns the file's path; undefined where no home is known, or nothing reads
 */
export async function snapshotPathOf(host: Host): Promise<string | undefined> {
  const home = await host.home()

  if (home === undefined) {
    return undefined
  }

  // No sign of life reads as NaN, which no comparison holds for
  const [seenAt, now] = await Promise.all([
    host.readFile(readerPathIn(home)).then(Number, () => Number.NaN),
    host.now(),
  ])

  return now - seenAt <= READER_TTL_MS
    ? snapshotPathIn(home, await host.sessionId())
    : undefined
}

/**
 * Keeps the snapshot of one run in the session's file.
 *
 * Never rejects: a snapshot that cannot be written is its reader's loss, and
 * the session goes on.
 *
 * @param host the calls on Claude Code the snapshot is made and written with
 * @param path the session's file, from `snapshotPathOf`
 * @param status what the run came to
 * @param freshFor how long the lines stay fresh; undefined where no run follows
 */
export async function keepSnapshot(
  host: Host,
  path: string,
  status: Status,
  freshFor: number | undefined,
): Promise<void> {
  try {
    const [sessionId, now] = await Promise.all([host.sessionId(), host.now()])

    const snapshot = snapshotOf(status, {
      sessionId,
      now,
      ...(freshFor !== undefined && { freshFor }),
    })

    await host.writeFile(path, JSON.stringify(snapshot))
  } catch {
    // The reader shows the lines it last had
  }
}
