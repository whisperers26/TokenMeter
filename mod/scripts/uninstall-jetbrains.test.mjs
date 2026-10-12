// The tests of uninstall-jetbrains.mjs, run with `node --test mod/scripts/uninstall-jetbrains.test.mjs`.

import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { uninstallFrom } from './uninstall-jetbrains.mjs'

/** An IDE's plugins folder in a scratch folder, holding the plugins named. */
function pluginsOf(names) {
  const plugins = mkdtempSync(join(tmpdir(), 'ccstatusline-desktop-uninstall-'))

  for (const name of names) {
    mkdirSync(join(plugins, name, 'lib'), { recursive: true })
    writeFileSync(join(plugins, name, 'lib', `${name}.jar`), '')
  }

  return plugins
}

test('takes the plugin out, under this name and its former one, and leaves every other plugin', () => {
  const plugins = pluginsOf(['ccstatusline-desktop', 'token-meter', 'ml-llm'])

  try {
    assert.deepEqual([uninstallFrom(plugins), readdirSync(plugins)], [true, ['ml-llm']])
  } finally {
    rmSync(plugins, { recursive: true, force: true })
  }
})

test('says so where the plugin was not there, and removes nothing', () => {
  const plugins = pluginsOf(['ml-llm'])

  try {
    assert.deepEqual([uninstallFrom(plugins), existsSync(join(plugins, 'ml-llm'))], [false, true])
  } finally {
    rmSync(plugins, { recursive: true, force: true })
  }
})

test('an IDE with no plugins folder yet has nothing to take out', () => {
  assert.equal(uninstallFrom(join(tmpdir(), 'ccstatusline-desktop-no-such-ide', 'plugins')), false)
})
