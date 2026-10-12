#!/usr/bin/env node
// Looks at the ccstatusline a terminal's `statusLine` runs, and changes it:
// to another version, or out of the machine.
//
//   node mod/scripts/terminal-ccstatusline.mjs detect            what runs, and its version, as JSON
//   node mod/scripts/terminal-ccstatusline.mjs upgrade 2.2.32    make it that version
//   node mod/scripts/terminal-ccstatusline.mjs uninstall         take it out
//
// The mod runs it where a terminal's ccstatusline is of a version that does
// not share a settings file with the mod's engine. Both read and write
// ~/.config/ccstatusline/settings.json, which no command here touches.

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const PACKAGE = 'ccstatusline'

/** What the settings file as it was is kept under, beside it. */
const BACKUP_SUFFIX = '.before-ccstatusline-desktop'

/** How ccstatusline marks the hooks it adds to Claude Code's settings. */
const HOOK_TAG = 'ccstatusline-managed'

/** A hook of ccstatusline's from before it marked them. */
const HOOK_COMMAND = /ccstatusline.* --hook(?:\s|$)/

/** A release's version, and nothing a shell would read as more. */
const VERSION = /^\d+\.\d+\.\d+$/

/** How long a package manager may take over one command. */
const STEP_TIMEOUT_MS = 90_000

/** The program a command's first word runs: its file name, unquoted, less a Windows extension. */
const programOf = word =>
  (word.replace(/^["']|["']$/g, '').split(/[\\/]/).at(-1) ?? '')
    .toLowerCase()
    .replace(/\.(cmd|exe)$/, '')

/**
 * How a `statusLine` command runs ccstatusline.
 *
 * @param command the command, as Claude Code's settings spell it
 * @returns `global` for the installed command, `runner` for `npx` or `bunx`
 *          with the version it names, if any; undefined for any other command,
 *          a script that wraps ccstatusline among them
 */
export function installOf(command) {
  const [first = '', ...rest] = command.trim().split(/\s+/)
  const program = programOf(first)

  if (program === PACKAGE) {
    return { kind: 'global' }
  }

  if (program !== 'npx' && program !== 'bunx') {
    return undefined
  }

  const named = rest.map(word => /^ccstatusline(?:@(.+))?$/.exec(word)).find(match => match !== null)

  return named ? { kind: 'runner', runner: program, spec: named[1] } : undefined
}

/** A runner's command, naming `version` where it named another, or none. */
export const withSpec = (command, version) =>
  command.replace(/(^|\s)ccstatusline(?:@\S+)?(?=\s|$)/, `$1${PACKAGE}@${version}`)

/**
 * Claude Code's settings with the status line running `command`, and with it
 * the hooks ccstatusline added for its widgets: each runs the status line's
 * command with `--hook`, and would go on running the one it replaces.
 *
 * @param settings the settings file, parsed
 * @param command the status line's new command
 * @returns the settings to write in its place
 */
export function withCommand(settings, command) {
  const before = `${settings.statusLine.command} --hook`

  const moved = entry =>
    Array.isArray(entry?.hooks)
      ? { ...entry, hooks: entry.hooks.map(hook => (hook?.command === before ? { ...hook, command: `${command} --hook` } : hook)) }
      : entry

  return {
    ...settings,
    statusLine: { ...settings.statusLine, command },
    ...(settings.hooks !== undefined && {
      hooks: Object.fromEntries(
        Object.entries(settings.hooks).map(([event, entries]) => [
          event,
          Array.isArray(entries) ? entries.map(moved) : entries,
        ]),
      ),
    }),
  }
}

/** A hooks entry less what ccstatusline put in it; undefined when nothing is left. */
function withoutManagedHooks(entry) {
  if (entry?._tag === HOOK_TAG) {
    return undefined
  }

  if (!Array.isArray(entry?.hooks)) {
    return entry
  }

  const kept = entry.hooks.filter(hook => !HOOK_COMMAND.test(hook?.command ?? ''))

  if (kept.length === entry.hooks.length) {
    return entry
  }

  return kept.length === 0 ? undefined : { ...entry, hooks: kept }
}

/**
 * Claude Code's settings less ccstatusline: its `statusLine`, and the hooks it
 * added for its widgets. Every other key keeps its value and its place.
 *
 * @param settings the settings file, parsed
 * @returns the settings to write in its place
 */
export function withoutCcstatusline(settings) {
  const hooksLeft = Object.entries(settings.hooks ?? {}).flatMap(([event, entries]) => {
    if (!Array.isArray(entries)) {
      return [[event, entries]]
    }

    const kept = entries.map(withoutManagedHooks).filter(entry => entry !== undefined)

    return kept.length === 0 ? [] : [[event, kept]]
  })

  return Object.fromEntries(
    Object.entries(settings).flatMap(([key, value]) => {
      if (key === 'statusLine') {
        return []
      }

      if (key === 'hooks') {
        return hooksLeft.length === 0 ? [] : [[key, Object.fromEntries(hooksLeft)]]
      }

      return [[key, value]]
    }),
  )
}

/** JSON as the file it replaces was written: its indent, and its last newline. */
export function writtenLike(text, value) {
  const indent = /^([ \t]+)"/m.exec(text)?.[1] ?? '  '

  return `${JSON.stringify(value, null, indent)}${text.endsWith('\n') ? '\n' : ''}`
}

/**
 * The package manager a global `ccstatusline` on the `PATH` came from: bun's
 * where the first folder that holds the command is bun's own, npm's otherwise.
 *
 * @param folders the folders of the `PATH`, in order
 * @param bunBin the folder bun puts global commands in
 * @param holds whether a folder holds the command
 * @returns `npm` or `bun`; undefined where no folder holds the command
 */
export function managerOf(folders, bunBin, holds) {
  const folder = folders.find(holds)

  if (folder === undefined) {
    return undefined
  }

  return resolve(folder).toLowerCase() === resolve(bunBin).toLowerCase() ? 'bun' : 'npm'
}

/** Claude Code's own settings file: the person's, not a project's. */
const settingsPathOf = ({ env, home }) =>
  join(env.CLAUDE_CONFIG_DIR || join(home, '.claude'), 'settings.json')

const bunFolderOf = ({ env, home }) => env.BUN_INSTALL || join(home, '.bun')

/** The settings file as text and parsed; undefined where there is none to read. */
function settingsOf(world) {
  const path = settingsPathOf(world)

  if (!existsSync(path)) {
    return undefined
  }

  const text = readFileSync(path, 'utf8')

  return { path, text, value: JSON.parse(text) }
}

/** Writes the settings file, the one it replaces kept beside it. */
function keep({ path, text }, value) {
  copyFileSync(path, `${path}${BACKUP_SUFFIX}`)
  writeFileSync(path, writtenLike(text, value))
}

const commandOf = settings => {
  const command = settings?.value?.statusLine?.command

  return typeof command === 'string' ? command : undefined
}

function versionAt(nodeModules) {
  try {
    const { version } = JSON.parse(readFileSync(join(nodeModules, PACKAGE, 'package.json'), 'utf8'))

    return typeof version === 'string' ? version : undefined
  } catch {
    return undefined
  }
}

/** Every global install of ccstatusline, by the package manager that holds it. */
function globalsOf(world, npmRoot = world.sh('npm root -g')) {
  return [
    { manager: 'npm', version: npmRoot.status === 0 ? versionAt(npmRoot.stdout.trim()) : undefined },
    { manager: 'bun', version: versionAt(join(bunFolderOf(world), 'install', 'global', 'node_modules')) },
  ].filter(({ version }) => version !== undefined)
}

/** The package manager the `ccstatusline` command on the `PATH` came from; undefined with none there. */
function managerOnPathOf(world) {
  const names = world.platform === 'win32' ? ['ccstatusline.cmd', 'ccstatusline.exe'] : ['ccstatusline']

  return managerOf(
    (world.env.PATH ?? world.env.Path ?? '').split(world.platform === 'win32' ? ';' : ':').filter(Boolean),
    join(bunFolderOf(world), 'bin'),
    folder => names.some(name => existsSync(join(folder, name))),
  )
}

/** The global install the `ccstatusline` command runs, among those there are. */
function activeOf(world, globals) {
  const manager = managerOnPathOf(world)

  return globals.find(global => global.manager === manager) ?? globals[0]
}

/**
 * Whether the command a status line names is there to run: the file, where
 * it names one by its path, and a command of that name on the `PATH` otherwise.
 */
function isThere(world, command) {
  const [first = ''] = command.trim().split(/\s+/)
  const file = first.replace(/^["']|["']$/g, '')

  return /[\\/]/.test(file) ? existsSync(file) : managerOnPathOf(world) !== undefined
}

/** The version a runner fetches: the one it names, or the registry's latest. */
function runnerVersionOf(world, spec) {
  if (spec !== undefined && VERSION.test(spec)) {
    return spec
  }

  if (spec !== undefined && spec !== 'latest') {
    return undefined
  }

  const said = world.sh(`npm view ${PACKAGE} version`)
  const version = said.status === 0 ? said.stdout.trim() : ''

  return VERSION.test(version) ? version : undefined
}

/**
 * What the terminal's `statusLine` runs.
 *
 * @param world the machine: `env`, `home`, `platform`, and `sh`, which runs a shell line
 * @returns `{ kind: 'none' }` where it is not ccstatusline; else the kind of
 *          install, with its version where that could be told, and
 *          `isMissing` for a global command that is no longer on the machine
 */
export function detect(world) {
  let command

  try {
    command = commandOf(settingsOf(world))
  } catch {
    // A settings file that does not parse runs no status line
  }

  const install = command === undefined ? undefined : installOf(command)

  if (install === undefined) {
    return { kind: 'none' }
  }

  if (install.kind === 'runner') {
    return { kind: 'runner', runner: install.runner, version: runnerVersionOf(world, install.spec) }
  }

  const npmRoot = world.sh('npm root -g')
  const globals = globalsOf(world, npmRoot)
  const active = activeOf(world, globals)

  // Said only where npm answered and found none: a package manager this
  // script does not know leaves a command behind, and a narrow PATH hides one
  const isMissing = npmRoot.status === 0 && globals.length === 0 && !isThere(world, command)

  return { kind: 'global', manager: active?.manager, version: active?.version, ...(isMissing && { isMissing }) }
}

/** Runs a package manager's command; throws with its last words where it fails. */
function manage(world, line) {
  const ran = world.sh(line)

  if (ran.status !== 0) {
    const said = `${ran.stdout ?? ''}\n${ran.stderr ?? ''}`
      .split('\n')
      .map(text => text.trim())
      .filter(text => text !== '')

    throw new Error(`\`${line}\` failed: ${said.at(-1) ?? `exit code ${ran.status}`}`)
  }
}

/**
 * Makes the terminal's ccstatusline of `version`: a global install is
 * installed again at it, a runner's command is made to name it.
 *
 * @returns what was done, one item a line
 * @throws where the status line does not run ccstatusline, or the change failed
 */
export function upgrade(world, version) {
  if (!VERSION.test(version ?? '')) {
    throw new Error(`"${version}" is not a version`)
  }

  const settings = settingsOf(world)
  const command = commandOf(settings)
  const install = command === undefined ? undefined : installOf(command)

  if (install === undefined) {
    throw new Error("the terminal's status line does not run ccstatusline")
  }

  if (install.kind === 'runner') {
    const upgraded = withSpec(command, version)

    keep(settings, withCommand(settings.value, upgraded))

    return [`The terminal's status line now runs ccstatusline ${version}: \`${upgraded}\``]
  }

  const manager = activeOf(world, globalsOf(world))?.manager ?? 'npm'

  manage(world, manager === 'bun' ? `bun add -g ${PACKAGE}@${version}` : `npm install -g ${PACKAGE}@${version}`)

  return [`ccstatusline ${version} is installed globally with ${manager}: the terminal's status line runs it.`]
}

/**
 * Takes ccstatusline out of the terminal: its `statusLine` and hooks out of
 * Claude Code's settings, and every global install off the machine.
 *
 * @returns what was done, one item a line
 * @throws where there was nothing to take out, or a step failed
 */
export function uninstall(world) {
  const done = []
  const settings = settingsOf(world)
  const command = commandOf(settings)

  if (command !== undefined && installOf(command) !== undefined) {
    keep(settings, withoutCcstatusline(settings.value))
    done.push(`ccstatusline was taken out of \`${settings.path}\`; the file as it was is \`${settings.path}${BACKUP_SUFFIX}\`.`)
  }

  for (const { manager, version } of globalsOf(world)) {
    // The settings are already changed: a package that stays is said, not thrown
    try {
      manage(world, manager === 'bun' ? `bun remove -g ${PACKAGE}` : `npm uninstall -g ${PACKAGE}`)
      done.push(`The global ccstatusline ${version} was removed with ${manager}.`)
    } catch (error) {
      done.push(`The global ccstatusline ${version} was not removed: ${error.message}`)
    }
  }

  if (done.length === 0) {
    throw new Error('no ccstatusline was found to uninstall')
  }

  return [...done, 'Your layout is kept: ccstatusline desktop draws it, in the terminal too.']
}

/** This machine. */
const here = () => ({
  env: process.env,
  home: homedir(),
  platform: process.platform,
  // The package managers are scripts on Windows, which only a shell starts
  sh: line => spawnSync(line, { shell: true, encoding: 'utf8', timeout: STEP_TIMEOUT_MS, windowsHide: true }),
})

function main([action, version]) {
  if (action === 'detect') {
    console.log(JSON.stringify(detect(here())))
  } else if (action === 'upgrade') {
    console.log(upgrade(here(), version).join('\n'))
  } else if (action === 'uninstall') {
    console.log(uninstall(here()).join('\n'))
  } else {
    throw new Error('say what to do: detect, upgrade <version> or uninstall')
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(`ccstatusline desktop: the terminal's ccstatusline was left as it is (${error.message})`)
    process.exitCode = 1
  }
}
