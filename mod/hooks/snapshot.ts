import type { Line } from './ansi'
import { groupsOf } from './groups'
import type { Status } from './status'

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
