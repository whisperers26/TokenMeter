import type { Host } from './host'
import { pathIn } from './path-in'

/** The script that uninstalls the mod, under the plugin's own folder. */
const MOD_UNINSTALLER = ['scripts', 'uninstall-mod.mjs'] as const

/** The script that takes the JetBrains plugin out of the IDEs, beside it. */
const JETBRAINS_UNINSTALLER = ['scripts', 'uninstall-jetbrains.mjs'] as const

/** How long either may take: the first runs the Claude Code command line twice. */
const UNINSTALL_TIMEOUT_MS = 200_000

const QUESTION = 'What should be uninstalled?'
const MOD = 'The mod'
const JETBRAINS = 'The JetBrains plugin'
const BOTH = 'Both'
const NOT_NOW = 'Not now'

/** The mod's uninstall as a person makes it. */
const BY_HAND =
  'run this in a terminal: `claude plugin uninstall ccstatusline-desktop@ccstatusline-desktop`'

/** What `/ccstatusline-desktop` is followed by to uninstall the mod and the JetBrains plugin. */
export const isUninstallAsked = (args: string): boolean =>
  args.trim().toLowerCase() === 'uninstall'

/** Runs one of the two scripts and says what it said. Never rejects. */
async function ran(host: Host, runtime: string, script: readonly string[], what: string) {
  try {
    const { stdout, stderr } = await host.run([runtime, pathIn(host.root, ...script)], {
      timeoutMs: UNINSTALL_TIMEOUT_MS,
    })

    return [stdout.trim(), stderr.trim()].filter(said => said !== '').join('\n')
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error)

    return `ccstatusline desktop: ${what} was not uninstalled (${said})`
  }
}

/**
 * Asks what to uninstall, the mod, the JetBrains plugin or both, and does it.
 *
 * With both, the JetBrains plugin goes first: the script that takes it out is
 * the mod's own, and is gone once the mod is.
 *
 * Never rejects: a dialog nobody answered uninstalls nothing, and an uninstall
 * that failed is answered in words.
 *
 * @param host the calls on Claude Code the dialog and the runs are made with
 * @param runtime the command the scripts are run with: `node`, `bun`, or a path to one
 * @returns what was uninstalled, or how to do it by hand
 */
export async function uninstall(host: Host, runtime: string): Promise<string> {
  // Dismissed, or asked where there is nobody to answer: a `claude -p` run
  const answer = await host
    .ask(QUESTION, { header: 'Uninstall', options: [MOD, JETBRAINS, BOTH, NOT_NOW] })
    .catch(() => undefined)

  if (answer !== MOD && answer !== JETBRAINS && answer !== BOTH) {
    return `Nothing was uninstalled. To uninstall the mod yourself, ${BY_HAND}.`
  }

  const said: string[] = []

  if (answer !== MOD) {
    said.push(await ran(host, runtime, JETBRAINS_UNINSTALLER, 'the JetBrains plugin'))
  }

  if (answer !== JETBRAINS) {
    said.push(
      await ran(host, runtime, MOD_UNINSTALLER, 'the mod'),
      'This session keeps the band until it ends. Your layout in `~/.config/ccstatusline/settings.json` stays.',
    )
  }

  return said.join('\n\n')
}
