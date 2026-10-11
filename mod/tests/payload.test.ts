import { describe, expect, test } from 'claude-code/testing'

import { displayNameOf, payloadOf } from '../hooks/payload'
import type { SessionFacts } from '../hooks/payload'

const FACTS: SessionFacts = {
  sessionId: 'session-1',
  cwd: '/work/app/src',
  root: '/work/app',
  model: 'claude-opus-5-5',
  version: '2.1.296',
  now: 61_000,
  usage: {
    startedAt: 1_000,
    context: { window: 1_000_000 },
    rateLimits: [],
  },
}

describe('payload', () => {
  test('names the session, its directories and the engine version', () => {
    expect(payloadOf(FACTS)).toMatchObject({
      hook_event_name: 'Status',
      session_id: 'session-1',
      cwd: '/work/app/src',
      workspace: { current_dir: '/work/app/src', project_dir: '/work/app' },
      version: '2.1.296',
    })
  })

  test('the model goes by its id and its display name', () => {
    expect(payloadOf(FACTS).model).toEqual({
      id: 'claude-opus-5-5',
      display_name: 'Opus 5.5',
    })
  })

  test('before the first response the window alone is known', () => {
    expect(payloadOf(FACTS).context_window).toEqual({
      context_window_size: 1_000_000,
    })
  })

  test('the context window carries the live figures', () => {
    const payload = payloadOf({
      ...FACTS,
      usage: {
        ...FACTS.usage,
        context: { window: 1_000_000, tokens: 183_412, percent: 18 },
      },
    })

    expect(payload.context_window).toEqual({
      context_window_size: 1_000_000,
      total_input_tokens: 183_412,
      current_usage: 183_412,
      used_percentage: 18,
      remaining_percentage: 82,
    })
  })

  test('rate limits are keyed by window, their resets in epoch seconds', () => {
    const payload = payloadOf({
      ...FACTS,
      usage: {
        ...FACTS.usage,
        rateLimits: [
          {
            kind: 'five_hour',
            percentUsed: 42.5,
            resetsAt: '2001-09-09T01:46:40.000Z',
          },
          { kind: 'seven_day', percentUsed: 15 },
        ],
      },
    })

    expect(payload.rate_limits).toEqual({
      five_hour: { used_percentage: 42.5, resets_at: 1_000_000_000 },
      seven_day: { used_percentage: 15 },
    })
  })

  test('with no reading the rate limits are left for the engine to fetch', () => {
    expect('rate_limits' in payloadOf(FACTS)).toBe(false)
  })

  test('the cost carries what was spent and how long the session has run', () => {
    const payload = payloadOf({
      ...FACTS,
      usage: { ...FACTS.usage, cost: { usd: 1.23 } },
    })

    expect(payload.cost).toEqual({
      total_cost_usd: 1.23,
      total_duration_ms: 60_000,
    })
  })

  test('where the host keeps no ledger the duration stands alone', () => {
    expect(payloadOf(FACTS).cost).toEqual({ total_duration_ms: 60_000 })
  })

  test('what the session events told rides along', () => {
    const payload = payloadOf({
      ...FACTS,
      transcriptPath: '/home/me/.claude/projects/app/session-1.jsonl',
      effort: 'high',
      outputStyle: 'Explanatory',
    })

    expect(payload).toMatchObject({
      transcript_path: '/home/me/.claude/projects/app/session-1.jsonl',
      effort: { level: 'high' },
      output_style: { name: 'Explanatory' },
    })
  })

  test('what no event told is left out, not sent empty', () => {
    const payload = payloadOf(FACTS)

    expect(
      ['transcript_path', 'effort', 'output_style'].filter(key => key in payload),
    ).toEqual([])
  })
})

describe('displayNameOf', () => {
  test('a model id reads as its family and version', () => {
    expect(
      [
        'claude-opus-5-5',
        'claude-fable-5-1',
        'claude-haiku-5-5',
        'claude-sonnet-5',
        'claude-sonnet-4-5-20250929',
        'claude-opus-4-1-20250805',
      ].map(displayNameOf),
    ).toEqual([
      'Opus 5.5',
      'Fable 5.1',
      'Haiku 5.5',
      'Sonnet 5',
      'Sonnet 4.5',
      'Opus 4.1',
    ])
  })

  test('an id that leads with its version reads the same way', () => {
    expect(
      ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'].map(displayNameOf),
    ).toEqual(['Sonnet 3.5', 'Opus 3'])
  })

  test('the long-context suffix is said in words', () => {
    expect(displayNameOf('claude-opus-4-6[1m]')).toBe('Opus 4.6 (1M context)')
  })

  test('a name that is no Claude model id is kept as given', () => {
    expect(['opus', 'my-gateway/model-x', ''].map(displayNameOf)).toEqual([
      'opus',
      'my-gateway/model-x',
      '',
    ])
  })
})
