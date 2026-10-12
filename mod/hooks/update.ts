import type { Host } from './host'
import { installJetBrains } from './jetbrains'
import { pathIn } from './path-in'

/** The script that updates the mod, under the plugin's own folder. */
const UPDATER = ['scripts', 'update-mod.mjs'] as const

/** How long the updater may take: it clones the marketplace, then the plugin. */
const UPDATE_TIMEOUT_MS = 200_000

const QUESTION = 'What should be updated to the latest release?'
const MOD = 'The mod'
const JETBRAINS = 'The JetBrains plugin'
const BOTH = 'Both'
const NOT_NOW = 'Not now'

/** The mod's update as a person makes it, the marketplace's entry first. */
const BY_HAND =
  'run these in a terminal: `claude plugin marketplace update ccstatusline-desktop`, then `claude plugin update ccstatusline-desktop@ccstatusline-desktop`'

/** What `/ccstatusline-desktop` is followed by to update the mod and the JetBrains plugin. */
export const isUpdateAsked = (args: string): boolean =>
  args.trim().toLowerCase() === 'update'

/**
 * Updates the mod to its latest release. Never rejects.
 *
 * @returns whether the updater ran to its end, and what to say of it
 */
async function updateMod(host: Host, runtime: string) {
  try {
    const ran = await host.run([runtime, pathIn(host.root, ...UPDATER)], {
      timeoutMs: UPDATE_TIMEOUT_MS,
    })

    return ran.exitCode === 0
      ? {
          isDone: true,
          said: `${ran.stdout.trim()}\nA new version loads in the sessions started after this one.`,
        }
      : {
          isDone: false,
          said: `${ran.stderr.trim()}\nTo update it yourself, ${BY_HAND}`,
        }
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error)

    return {
      isDone: false,
      said: `ccstatusline desktop: the mod was not updated (${said})\nTo update it yourself, ${BY_HAND}`,
    }
  }
}

/**
 * Asks what to update, the mod, the JetBrains plugin or both, and does it.
 *
 * The JetBrains plugin is installed at the mod's own version, so that the two
 * stay of one. After an update of the mod that version is the latest
 * release's, which this running copy of the mod is not: the installer is told
 * to take the latest instead.
 *
 * Never rejects: a dialog nobody answered, and an update that failed, are
 * answered with how to update by hand.
 *
 * @param host the calls on Claude Code the dialog and the runs are made with
 * @param runtime the command the scripts are run with: `node`, `bun`, or a path to one
 * @returns what was updated, or how to do it by hand
 */
export async function update(host: Host, runtime: string): Promise<string> {
  // Dismissed, or asked where there is nobody to answer: a `claude -p` run
  const answer = await host
    .ask(QUESTION, { header: 'Update', options: [MOD, JETBRAINS, BOTH, NOT_NOW] })
    .catch(() => undefined)

  if (answer === JETBRAINS) {
    return installJetBrains(host, runtime)
  }

  if (answer !== MOD && answer !== BOTH) {
    return `Nothing was updated. To update the mod yourself, ${BY_HAND}. For the JetBrains plugin, run \`/ccstatusline-desktop jetbrains\`.`
  }

  const mod = await updateMod(host, runtime)

  if (answer === MOD) {
    return mod.said
  }

  const plugin = await installJetBrains(host, runtime, mod.isDone ? ['--latest'] : [])

  return `${mod.said}\n\n${plugin}`
}
