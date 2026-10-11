import { describe, expect, test } from 'claude-code/testing'

import { snapshotOf } from '../hooks/snapshot'

const PAD = ' '.repeat(12)

/** The run a snapshot is of: whose lines they are, and when they were run. */
const RUN = { sessionId: 'session-1', now: 1_700_000_900_000 } as const

describe('snapshot', () => {
  test("keeps a session's lines as rows of groups, stamped with the session and the time", () => {
    expect(
      snapshotOf(
        {
          lines: [
            [{ text: 'Model: Opus', color: '#008787' }, { text: `${PAD}main` }],
            [{ text: 'Total: 22.7M' }],
          ],
        },
        RUN,
      ),
    ).toEqual({
      version: 1,
      sessionId: 'session-1',
      updatedAt: 1_700_000_900_000,
      rows: [
        { groups: [[{ text: 'Model: Opus', color: '#008787' }], [{ text: 'main' }]] },
        { groups: [[{ text: 'Total: 22.7M' }]] },
      ],
    })
  })

  test("keeps a failure in the lines' place", () => {
    expect(snapshotOf({ failure: 'the engine did not run (ENOENT)' }, RUN)).toEqual({
      version: 1,
      sessionId: 'session-1',
      updatedAt: 1_700_000_900_000,
      failure: 'the engine did not run (ENOENT)',
    })
  })

  test('says until when its lines are fresh, where they will be run again', () => {
    expect(
      snapshotOf({ lines: [] }, { ...RUN, freshFor: 90_000 }),
    ).toMatchObject({ freshUntil: 1_700_000_990_000 })
  })
})
