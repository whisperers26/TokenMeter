import type { Host } from './host'
import { pathIn } from './path-in'

/** The script that looks at the terminal's ccstatusline and changes it, under the plugin's own folder. */
const SCRIPT = ['scripts', 'terminal-ccstatusline.mjs'] as const

/** The file that names the version of the engine the mod runs. */
const ENGINE_VERSION = ['engine', 'VERSION'] as const

/**
 * The first ccstatusline that keeps its settings as the mod's engine does: an
 * older one reads the file the engine saves, and shows what it was told to hide.
 */
export const OLDEST_SHARING = '2.2.29'

/** How long the look may take: it may ask the registry for the latest version. */
const DETECT_TIMEOUT_MS = 30_000

/** How long a change may take: a package manager installs or removes a package. */
const CHANGE_TIMEOUT_MS = 200_000

/** The store's key for the mismatch the person last answered about. */
const ANSWERED_KEY = 'terminalAnswered'

const UNINSTALL = 'Uninstall it'
const REMOVE_SETTING = 'Remove the setting'
const CONTINUE = 'Continue anyway'
const NOT_NOW = 'Not now'

/** What continuing past a version out of range costs, as the dialog ends its question. */
const continuingCosts = (until: string) =>
  `You can continue anyway: the band still draws, but /ccstatusline-desktop edit stays off until ${until}, and the layout is changed with your own ccstatusline.`

/**
 * A terminal's ccstatusline that does not go with the mod's engine: of a
 * version that does not share settings with it, or no longer installed while
 * the `statusLine` still runs it.
 */
export type Mismatch =
  | {
      /** The version the terminal's `statusLine` runs. */
      version: string
      /** The version of the mod's engine, which is the one to be at. */
      recommended: string
      /** Newer than the engine; older than what shares its settings otherwise. */
      isNewer: boolean
    }
  | {
      /** The command is gone: the terminal draws no status line, nor does the mod there. */
      isMissing: true
      recommended: string
    }

/** What became of a mismatch the person chose to end. */
export type Aligned = {
  /** Whether the terminal's ccstatusline was changed. */
  isChanged: boolean
  /** What the script said: what it did, or why it did not. */
  said: string
}

/** What a look at the terminal's ccstatusline, and the dialog about it, came to. */
export type Alignment = {
  /** The mismatch that still stands: found, and not ended by a change. */
  standing?: Mismatch
  /** What the change the person chose came to, where they chose one. */
  aligned?: Aligned
}

/** A version's three numbers; undefined for text that does not start with them. */
function numbersOf(version: string) {
  const [, ...numbers] = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim()) ?? []

  return numbers.length === 3 ? numbers.map(Number) : undefined
}

/** Whether `version` is of an earlier release than `other`; false where either is no version. */
function isBefore(version: string, other: string) {
  const [these, those] = [numbersOf(version), numbersOf(other)]

  if (these === undefined || those === undefined) {
    return false
  }

  const at = these.findIndex((number, index) => number !== those[index])

  return at !== -1 && (these[at] ?? 0) < (those[at] ?? 0)
}

/** The `statusLine` command of Claude Code's settings, when they run one. */
async function ownCommandOf(host: Host) {
  const { statusLine } = await host.settings()

  const command =
    typeof statusLine === 'object' && statusLine !== null
      ? (statusLine as { command?: unknown }).command
      : undefined

  return typeof command === 'string' ? command : undefined
}

/**
 * Looks for a terminal's ccstatusline whose version is out of the range the
 * mod's engine shares a settings file with: from the first release of the
 * engine's settings format to the engine's own version. One that was removed
 * while the `statusLine` still runs it is a mismatch too.
 *
 * Never rejects, and runs nothing where the settings run no ccstatusline: a
 * look that could not be made finds no mismatch.
 *
 * @param host the calls on Claude Code the look is made with
 * @param runtime the command the script is run with: `node`, `bun`, or a path to one
 * @returns the mismatch, or undefined where there is none to tell
 */
export async function mismatchOf(host: Host, runtime: string): Promise<Mismatch | undefined> {
  try {
    if (!(await ownCommandOf(host))?.includes('ccstatusline')) {
      return undefined
    }

    const [recommended = ''] = (await host.readFile(pathIn(host.root, ...ENGINE_VERSION))).trim().split(/\s+/)

    const ran = await host.run([runtime, pathIn(host.root, ...SCRIPT), 'detect'], {
      timeoutMs: DETECT_TIMEOUT_MS,
    })

    const { version, isMissing } = JSON.parse(ran.stdout) as { version?: unknown; isMissing?: unknown }

    if (ran.exitCode === 0 && isMissing === true) {
      return { isMissing, recommended }
    }

    if (ran.exitCode !== 0 || typeof version !== 'string') {
      return undefined
    }

    const isNewer = isBefore(recommended, version)

    return isNewer || isBefore(version, OLDEST_SHARING) ? { version, recommended, isNewer } : undefined
  } catch {
    return undefined
  }
}

/** What a dialog asks, what the script is told for each answer that changes something, and the answer that changes nothing. */
type Dialog = {
  question: string
  changes: Readonly<Record<string, readonly string[]>>
  leave: string
}

/** What the store keeps of a mismatch the person answered about. */
const answeredOf = (mismatch: Mismatch) =>
  `${'isMissing' in mismatch ? 'missing' : mismatch.version} beside ${mismatch.recommended}`

/**
 * The dialog a mismatch is ended with: a newer one can only be uninstalled,
 * and one that is gone is installed again or has its setting removed.
 */
function dialogOf(mismatch: Mismatch): Dialog {
  const { recommended } = mismatch

  if ('isMissing' in mismatch) {
    return {
      question: `Your terminal's status line runs ccstatusline, which is no longer installed, so the terminal shows no status line. Install ccstatusline ${recommended}, or remove the setting and let ccstatusline desktop draw in the terminal too?`,
      changes: { [`Install ${recommended}`]: ['upgrade', recommended], [REMOVE_SETTING]: ['uninstall'] },
      leave: NOT_NOW,
    }
  }

  const { version, isNewer } = mismatch
  const uninstall = { [UNINSTALL]: ['uninstall'] }

  return isNewer
    ? {
        question: `Your terminal runs ccstatusline ${version}, newer than the ${recommended} ccstatusline desktop carries. They share one settings file, and a layout saved from here can lose what the newer one added. Uninstall it and let ccstatusline desktop draw in the terminal too? ${continuingCosts('you uninstall it')}`,
        changes: uninstall,
        leave: CONTINUE,
      }
    : {
        question: `Your terminal runs ccstatusline ${version}, older than ccstatusline desktop shares a settings file with (${OLDEST_SHARING} to ${recommended}): it shows what the layout says to hide. Upgrade it to ${recommended}, or uninstall it and let ccstatusline desktop draw in the terminal too? ${continuingCosts('you do one of the two')}`,
        changes: { [`Upgrade to ${recommended}`]: ['upgrade', recommended], ...uninstall },
        leave: CONTINUE,
      }
}

/**
 * What `/ccstatusline-desktop edit` answers in the configurator's place while
 * a terminal's ccstatusline of a version out of range stands: a layout saved
 * from the mod's configurator is one the other reads differently, or loses from.
 *
 * @param mismatch the mismatch that stands
 * @returns why edit is off and how the layout is changed meanwhile; undefined
 *          for a ccstatusline that is gone, which reads no layout
 */
export function editOffOf(mismatch: Mismatch): string | undefined {
  if ('isMissing' in mismatch) {
    return undefined
  }

  const { version, recommended, isNewer } = mismatch
  const choice = isNewer ? `**${UNINSTALL}**` : `**Upgrade to ${recommended}** or **${UNINSTALL}**`

  return [
    `\`/ccstatusline-desktop edit\` is off while your terminal runs ccstatusline ${version}: ccstatusline desktop shares its settings file with versions ${OLDEST_SHARING} to ${recommended} only.`,
    'To change the layout meanwhile, run your own ccstatusline in a terminal: the band draws what it saves.',
    `To turn edit back on, run \`/ccstatusline-desktop edit\` again and choose ${choice}.`,
  ].join('\n')
}

/**
 * Asks what to do about a terminal's ccstatusline of a version out of range,
 * and does it: upgrades it to the engine's version, or uninstalls it. A newer
 * one can only be uninstalled; one that is gone is installed again, or the
 * setting that still runs it is removed.
 *
 * Never rejects: a dialog nobody answered changes nothing, and a change that
 * failed is answered in words.
 *
 * @param host the calls on Claude Code the dialog and the runs are made with
 * @param runtime the command the script is run with: `node`, `bun`, or a path to one
 * @param isRepeated whether to ask about a mismatch the person already answered
 *                   about; without it, each mismatch is asked about once
 * @returns the mismatch that still stands, if any, and what was done about it, if anything
 */
export async function alignTerminal(
  host: Host,
  runtime: string,
  isRepeated: boolean,
): Promise<Alignment> {
  const mismatch = await mismatchOf(host, runtime)

  if (mismatch === undefined) {
    return {}
  }

  const answered = answeredOf(mismatch)

  if (!isRepeated && (await host.recall(ANSWERED_KEY).catch(() => undefined)) === answered) {
    return { standing: mismatch }
  }

  const { question, changes, leave } = dialogOf(mismatch)

  // Dismissed, or asked where there is nobody to answer: asked again next time
  const answer = await host
    .ask(question, { header: 'Terminal', options: [...Object.keys(changes), leave] })
    .catch(() => undefined)

  if (answer === undefined) {
    return { standing: mismatch }
  }

  await host.remember(ANSWERED_KEY, answered).catch(() => undefined)

  const change = Object.hasOwn(changes, answer) ? changes[answer] : undefined

  if (change === undefined) {
    return { standing: mismatch }
  }

  try {
    const ran = await host.run([runtime, pathIn(host.root, ...SCRIPT), ...change], {
      timeoutMs: CHANGE_TIMEOUT_MS,
    })

    const aligned = {
      isChanged: ran.exitCode === 0,
      said: [ran.stdout.trim(), ran.stderr.trim()].filter(said => said !== '').join('\n'),
    }

    return aligned.isChanged ? { aligned } : { aligned, standing: mismatch }
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error)

    return {
      standing: mismatch,
      aligned: {
        isChanged: false,
        said: `ccstatusline desktop: the terminal's ccstatusline was left as it is (${said})`,
      },
    }
  }
}
