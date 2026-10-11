import { describe, expect, test } from 'claude-code/testing'

import type { Host } from '../hooks/host'
import { engineOf, engineSettingsPathIn } from '../hooks/status'

const hostAt = (root: string) => ({ root }) as Host

describe('status', () => {
  test("the engine is run from the plugin's folder, spelled the folder's way", () => {
    expect([
      engineOf(hostAt('/plugins/token-meter'), 'node'),
      engineOf(hostAt('C:\\plugins\\token-meter'), 'bun'),
    ]).toEqual([
      ['node', '/plugins/token-meter/engine/ccstatusline.js'],
      ['bun', 'C:\\plugins\\token-meter\\engine\\ccstatusline.js'],
    ])
  })

  test("the engine's settings are under the home directory, or spelled from ~", () => {
    expect([
      engineSettingsPathIn('C:\\Users\\me'),
      engineSettingsPathIn(undefined),
    ]).toEqual([
      'C:\\Users\\me\\.config\\ccstatusline\\settings.json',
      '~/.config/ccstatusline/settings.json',
    ])
  })
})
