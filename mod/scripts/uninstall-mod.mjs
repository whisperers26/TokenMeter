#!/usr/bin/env node
// Uninstalls the ccstatusline desktop mod, through the Claude Code command
// line: the plugin first, then the marketplace it was installed from.
//
//   node mod/scripts/uninstall-mod.mjs
//
// The mod runs it for `/ccstatusline-desktop uninstall`. A session has no call
// that uninstalls a plugin, and the `claude` command is looked for as
// update-mod.mjs looks for it. The layout in ~/.config/ccstatusline is ccstatusline's
// own, and stays.

import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { pathToFileURL } from 'node:url'

import { MARKETPLACE, PLUGIN, claude, claudeCandidates } from './update-mod.mjs'

function main() {
  const command = claudeCandidates(process.platform, process.env, homedir()).find(file => existsSync(file))

  if (command === undefined) {
    throw new Error('the claude command was not found on the PATH or in ~/.local/bin')
  }

  // The last line says what the uninstall came to
  console.log(claude(command, ['plugin', 'uninstall', PLUGIN]).at(-1) ?? 'The mod is uninstalled.')

  // The plugin is what draws: a marketplace entry left behind is said, not failed on
  try {
    claude(command, ['plugin', 'marketplace', 'remove', MARKETPLACE])
  } catch (error) {
    console.log(`Its marketplace entry stays (${error.message}); \`claude plugin marketplace remove ${MARKETPLACE}\` removes it.`)
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(`ccstatusline desktop: the mod was not uninstalled (${error.message})`)
    process.exitCode = 1
  }
}
