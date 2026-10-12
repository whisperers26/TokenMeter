import type { Host } from './host'
import { pathIn } from './path-in'
import { commandLineOf } from './report'
import { engineOf } from './status'

/** The script that opens the configurator, under the plugin's own folder. */
const OPENER = ['scripts', 'open-configurator.mjs'] as const

const QUESTION = 'Open the ccstatusline configurator in a new terminal window?'
const OPEN = 'Open the configurator'
const NOT_NOW = 'Not now'

/** What `/ccstatusline-desktop` is followed by to change the layout. */
export const isEditAsked = (args: string): boolean =>
  args.trim().toLowerCase() === 'edit'

/**
 * Asks whether to open the configurator, the TUI of the engine the mod runs,
 * and opens it in a terminal window of its own on a yes.
 *
 * Never rejects: a dialog nobody answered, and a window that could not be
 * opened, are answered with the command that opens the configurator by hand.
 *
 * @param host the calls on Claude Code the dialog and the run are made with
 * @param runtime the command the configurator is run with: `node`, `bun`, or a path to one
 * @returns what was done, or how to do it by hand
 */
export async function editLayout(host: Host, runtime: string): Promise<string> {
  const byHand = `run this in a terminal: ${commandLineOf(engineOf(host, runtime))}`

  // Dismissed, or asked where there is nobody to answer: a `claude -p` run
  const answer = await host
    .ask(QUESTION, { header: 'Layout', options: [OPEN, NOT_NOW] })
    .catch(() => undefined)

  if (answer !== OPEN) {
    return `The configurator was left closed. To open it yourself, ${byHand}`
  }

  try {
    const ran = await host.run([runtime, pathIn(host.root, ...OPENER)])

    if (ran.exitCode === 0) {
      return ran.stdout.trim()
    }

    return `${ran.stderr.trim()}\nTo open it yourself, ${byHand}`
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error)

    return `ccstatusline desktop: the configurator was not opened (${said})\nTo open it yourself, ${byHand}`
  }
}
