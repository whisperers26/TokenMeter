#!/usr/bin/env node
// Takes the ccstatusline desktop plugin out of the JetBrains IDEs of this
// machine, Android Studio among them: its folder, out of each IDE's plugins.
//
//   node mod/scripts/uninstall-jetbrains.mjs
//
// The mod runs it for `/ccstatusline-desktop uninstall`. It looks where
// install-jetbrains.mjs installs, and for the plugin under its former name too.

import { existsSync, readdirSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { FORMER_PLUGIN, PLUGIN, ideFoldersAmong, pluginsRootsOf } from './install-jetbrains.mjs'

/**
 * Takes the plugin out of one IDE's plugins folder, under this name and its
 * former one.
 *
 * @param plugins the IDE's plugins folder
 * @returns whether the plugin was there
 * @throws where a folder could not be removed: the IDE that has it open holds it
 */
export function uninstallFrom(plugins) {
  const folders = [PLUGIN, FORMER_PLUGIN].map(name => join(plugins, name)).filter(folder => existsSync(folder))

  for (const folder of folders) {
    rmSync(folder, { recursive: true })
  }

  return folders.length > 0
}

function main() {
  const { roots, pluginsIn } = pluginsRootsOf(process.platform, process.env, homedir())

  const ides = roots
    .filter(root => existsSync(root))
    .flatMap(root => ideFoldersAmong(readdirSync(root)).map(name => ({ name, folder: join(root, name) })))

  let removed = 0
  let failed = 0

  for (const { name: ide, folder } of ides) {
    try {
      if (uninstallFrom(pluginsIn(folder))) {
        removed += 1
        console.log(`${ide}: uninstalled`)
      }
    } catch (error) {
      failed += 1
      console.log(`${ide}: not uninstalled (${error.message}); close the IDE and run this again`)
    }
  }

  if (removed === 0 && failed === 0) {
    console.log(`The JetBrains plugin was installed in no IDE found in ${roots.join(' or ')}.`)
  } else if (removed > 0) {
    console.log('')
    console.log('Restart an IDE that is open to unload the plugin.')
  }

  if (failed > 0) {
    process.exitCode = 1
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(`ccstatusline desktop: the JetBrains plugin was not uninstalled (${error.message})`)
    process.exitCode = 1
  }
}
