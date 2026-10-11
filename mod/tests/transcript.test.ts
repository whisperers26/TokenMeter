import { describe, expect, test } from 'claude-code/testing'

import { transcriptPathIn } from '../hooks/transcript'

describe('transcript', () => {
  test('the transcript is named for the session, in a folder named for the project', () => {
    expect(transcriptPathIn('/home/me/.claude', '/work/my app', 'abc')).toBe(
      '/home/me/.claude/projects/-work-my-app/abc.jsonl',
    )
  })

  test('a Windows config directory keeps its own separator', () => {
    expect(
      transcriptPathIn('C:\\Users\\me\\.claude', 'D:\\Work\\My_App.v2', 'abc'),
    ).toBe('C:\\Users\\me\\.claude\\projects\\D--Work-My-App-v2\\abc.jsonl')
  })
})
