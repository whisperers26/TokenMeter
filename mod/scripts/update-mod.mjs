#!/usr/bin/env node
// Updates the ccstatusline desktop mod to its latest release, through the
// Claude Code command line: the marketplace's entry first, then the plugin.
//
//   node mod/scripts/update-mod.mjs
//
// The mod runs it for `/ccstatusline-desktop update`. A session has no call
// that updates a plugin, and the desktop app may not have `claude` on the PATH
// it hands a mod, so the command is looked for here, where it is installed too.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const MARKETPLACE = 'ccstatusline-desktop'
const PLUGIN = `ccstatusline-desktop@${MARKETPLACE}`

/** How long each of the two steps may take: the first clones the marketplace. */
const STEP_TIMEOUT_MS = 90_000

/**
 * Where the Claude Code command line may be: each folder of the `PATH`, then
 * the folder its own installer puts it in, under each name it goes by there.
 *
 * @param platform `process.platform`
 * @param env the environment, for the `PATH`
 * @param home the home directory
 * @returns the files to try, the likeliest first
 */
export function claudeCandidates(platform, env, home) {
  // npm installs a script beside a `.cmd` that runs it; only the latter starts
  const names = platform === 'win32' ? ['claude.exe', 'claude.cmd'] : ['claude']

  const folders = [
    ...(env.PATH ?? env.Path ?? '').split(platform === 'win32' ? ';' : ':'),
    join(home, '.local', 'bin'),
  ].filter(folder => folder !== '')

  return folders.flatMap(folder => names.map(name => join(folder, name)))
}

/** Runs one `claude` command, and answers with what it printed. */
function claude(command, args) {
  // A `.cmd` is run by the command interpreter, which wants the line whole
  const isScript = command.toLowerCase().endsWith('.cmd')

  const ran = isScript
    ? spawnSync(`"${command}" ${args.join(' ')}`, { shell: true, encoding: 'utf8', timeout: STEP_TIMEOUT_MS })
    : spawnSync(command, args, { encoding: 'utf8', timeout: STEP_TIMEOUT_MS })

  if (ran.error !== undefined) {
    throw ran.error
  }

  const said = `${ran.stdout}\n${ran.stderr}`
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')

  if (ran.status !== 0) {
    throw new Error(said.at(-1) ?? `claude ${args.join(' ')} ended with exit code ${ran.status}`)
  }

  return said
}

function main() {
  const command = claudeCandidates(process.platform, process.env, homedir()).find(file => existsSync(file))

  if (command === undefined) {
    throw new Error('the claude command was not found on the PATH or in ~/.local/bin')
  }

  claude(command, ['plugin', 'marketplace', 'update', MARKETPLACE])

  // The last line says what the update came to: the versions, or that there is none newer
  console.log(claude(command, ['plugin', 'update', PLUGIN]).at(-1) ?? 'The mod is updated.')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(`ccstatusline desktop: the mod was not updated (${error.message})`)
    process.exitCode = 1
  }
}
