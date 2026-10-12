import { describe, expect, test } from 'claude-code/testing'

import type { Host } from '../hooks/host'
import { engineOf, engineSettingsPathIn } from '../hooks/status'

const hostAt = (root: string) => ({ root }) as Host

describe('status', () => {
  test("the engine is run from the plugin's folder, spelled the folder's way", () => {
    expect([
      engineOf(hostAt('/plugins/ccstatusline-desktop'), 'node'),
      engineOf(hostAt('C:\\plugins\\ccstatusline-desktop'), 'bun'),
    ]).toEqual([
      ['node', '/plugins/ccstatusline-desktop/engine/ccstatusline.js'],
      ['bun', 'C:\\plugins\\ccstatusline-desktop\\engine\\ccstatusline.js'],
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
