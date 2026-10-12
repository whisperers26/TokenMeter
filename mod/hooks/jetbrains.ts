import type { Host } from './host'
import { pathIn } from './path-in'

/** The script that installs the JetBrains plugin, under the plugin's own folder. */
const INSTALLER = ['scripts', 'install-jetbrains.mjs'] as const

/** How long the installer may take: it downloads the plugin first. */
const INSTALL_TIMEOUT_MS = 120_000

/** What `/ccstatusline-desktop` is followed by to install the JetBrains plugin. */
export const isJetBrainsAsked = (args: string): boolean =>
  args.trim().toLowerCase() === 'jetbrains'

/**
 * Installs the JetBrains plugin of this mod's release in the IDEs of the
 * machine, by running the installer on the runtime the engine runs on.
 *
 * Never rejects: an installer that could not be run, or that failed, is
 * answered in words.
 *
 * @param host the calls on Claude Code the run is made with
 * @param runtime the command the installer is run with: `node`, `bun`, or a path to one
 * @returns what the installer said: where it installed the plugin, or why it did not
 */
export async function installJetBrains(
  host: Host,
  runtime: string,
): Promise<string> {
  try {
    const ran = await host.run([runtime, pathIn(host.root, ...INSTALLER)], {
      timeoutMs: INSTALL_TIMEOUT_MS,
    })

    return [ran.stdout.trim(), ran.stderr.trim()]
      .filter(said => said !== '')
      .join('\n\n')
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error)

    return `ccstatusline desktop: the installer did not run (${said})`
  }
}
