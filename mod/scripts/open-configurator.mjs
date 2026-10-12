#!/usr/bin/env node
// Opens the ccstatusline configurator, the TUI of the engine the mod runs, in a
// terminal window of its own.
//
//   node mod/scripts/open-configurator.mjs
//
// The mod runs it for `/ccstatusline-desktop edit`, where the session has no
// terminal to hand the TUI: the desktop app has none, and a terminal session's
// own is Claude Code's. The TUI runs on the runtime this script is run with.

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { delimiter, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** The title of the window, where the platform lets a command name it. */
const TITLE = 'ccstatusline'

/**
 * The terminals tried where the platform names none of its own, each with
 * what it puts before a command to run: the distribution's choice first.
 */
const TERMINALS = [
  ['x-terminal-emulator', '-e'],
  ['gnome-terminal', '--'],
  ['konsole', '-e'],
  ['xfce4-terminal', '-x'],
  ['kitty'],
  ['alacritty', '-e'],
  ['xterm', '-e'],
]

/** An argument as a POSIX shell reads it whole. */
const shellQuoted = text => `'${text.replaceAll("'", "'\\''")}'`

/** Text as AppleScript reads it between double quotes. */
const appleScriptQuoted = text => `"${text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`

/**
 * How the configurator is started in a window of its own.
 *
 * @param platform `process.platform`
 * @param env the environment: the command interpreter on Windows, the display elsewhere
 * @param command the configurator as an argument vector: the runtime, then the engine
 * @param isOnPath whether a command of that name is on the `PATH`
 * @returns the argument vector to start, whether its arguments are passed as
 *          written (Windows), and whether it ends once the window is open
 * @throws where no terminal can be opened, saying why
 */
export function launchOf(platform, env, command, isOnPath) {
  if (platform === 'win32') {
    // `start` takes its first quoted argument for the window's title, and the
    // whole line is quoted once more for `/s /c`, which strips that pair alone
    const line = [TITLE, ...command].map(argument => `"${argument}"`).join(' ')

    return {
      argv: [env.ComSpec ?? 'cmd.exe', '/d', '/s', '/c', `"start ${line}"`],
      isVerbatim: true,
      isOver: true,
    }
  }

  if (platform === 'darwin') {
    const line = command.map(shellQuoted).join(' ')

    return {
      argv: [
        'osascript',
        '-e',
        'tell application "Terminal"',
        '-e',
        'activate',
        '-e',
        `do script ${appleScriptQuoted(line)}`,
        '-e',
        'end tell',
      ],
      isVerbatim: false,
      isOver: true,
    }
  }

  if (env.DISPLAY === undefined && env.WAYLAND_DISPLAY === undefined) {
    throw new Error('this session has no display to open a terminal window on')
  }

  const terminal = TERMINALS.find(([name]) => isOnPath(name))

  if (terminal === undefined) {
    throw new Error(
      `no terminal was found on the PATH (tried ${TERMINALS.map(([name]) => name).join(', ')})`,
    )
  }

  return { argv: [...terminal, ...command], isVerbatim: false, isOver: false }
}

/** Whether a command of that name is in one of the folders of the `PATH`. */
function isOnPath(name) {
  return (process.env.PATH ?? '')
    .split(delimiter)
    .some(folder => folder !== '' && existsSync(join(folder, name)))
}

/**
 * Starts what opens the window. Settles once the window is open: when the
 * command has ended, or, for a terminal that is the window, once it has started.
 */
function start({ argv: [command, ...args], isVerbatim, isOver }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: !isOver,
      stdio: 'ignore',
      windowsHide: true,
      windowsVerbatimArguments: isVerbatim,
    })

    child.on('error', reject)

    if (isOver) {
      child.on('exit', code =>
        code === 0 ? resolve() : reject(new Error(`${command} ended with exit code ${code}`)),
      )
    } else {
      child.on('spawn', () => {
        child.unref()
        resolve()
      })
    }
  })
}

async function main() {
  const engine = join(dirname(fileURLToPath(import.meta.url)), '..', 'engine', 'ccstatusline.js')

  await start(launchOf(process.platform, process.env, [process.execPath, engine], isOnPath))

  console.log('The configurator is open in a new terminal window.')
  console.log('A layout saved there shows in the band at its next refresh.')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(`ccstatusline desktop: the configurator was not opened (${error.message})`)
    process.exitCode = 1
  })
}
