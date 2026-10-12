import type { Host } from './host'
import { pathIn } from './path-in'

/** The script that looks at the terminal's ccstatusline, installs it and changes it, under the plugin's own folder. */
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

const CONTINUE = 'Continue anyway'

/** What continuing past a version out of range costs, as the dialog ends its question. */
const continuingCosts = (until: string) =>
  `You can continue anyway: the band still draws, but /ccstatusline-desktop edit stays off until ${until}, and the layout is changed with your own ccstatusline.`

/**
 * A terminal's ccstatusline that does not go with the mod's engine: of a
 * version that does not share settings with it, or not there at all.
 */
export type Mismatch = Version | Missing

type Version = {
  /** The version the terminal's `statusLine` runs. */
  version: string
  /** The version of the mod's engine, which is the one to be at. */
  recommended: string
  /** Newer than the engine; older than what shares its settings otherwise. */
  isNewer: boolean
}

type Missing = {
  /**
   * The terminal draws no status line: its settings run none, or run a
   * ccstatusline that is no longer installed. The mod draws none there.
   */
  isMissing: true
  recommended: string
}

/**
 * When a mismatch is asked about: `once` for each, `again` for one already
 * answered about too, and `updating` as `again`, with an older ccstatusline
 * upgraded without a question.
 */
export type Asking = 'once' | 'again' | 'updating'

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
 * engine's settings format to the engine's own version. A terminal with no
 * status line is a mismatch too, and so is one whose `statusLine` still runs
 * a ccstatusline that was removed.
 *
 * Never rejects, and runs nothing where the settings run no status line, or
 * another tool's: a look that could not be made finds no mismatch.
 *
 * @param host the calls on Claude Code the look is made with
 * @param runtime the command the script is run with: `node`, `bun`, or a path to one
 * @returns the mismatch, or undefined where there is none to tell
 */
export async function mismatchOf(host: Host, runtime: string): Promise<Mismatch | undefined> {
  try {
    const command = (await ownCommandOf(host))?.trim() ?? ''
    const [recommended = ''] = (await host.readFile(pathIn(host.root, ...ENGINE_VERSION))).trim().split(/\s+/)

    if (command === '') {
      return { isMissing: true, recommended }
    }

    if (!command.includes('ccstatusline')) {
      return undefined
    }

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

/** What a dialog asks, what the script is told for the answer that changes something, and the answer that changes nothing. */
type Dialog = {
  question: string
  changes: Readonly<Record<string, readonly string[]>>
  leave: string
}

/** What the store keeps of a mismatch the person answered about, or that could not be ended. */
const answeredOf = (mismatch: Mismatch) =>
  `${'isMissing' in mismatch ? 'missing' : mismatch.version} beside ${mismatch.recommended}`

/** What a version out of range is brought to the engine's with: a newer one is installed again, an older one upgraded. */
const choiceOf = ({ recommended, isNewer }: Version) =>
  isNewer ? `Reinstall ${recommended}` : `Upgrade to ${recommended}`

/**
 * The dialog a version out of range is ended with: the version of the engine
 * in its place, or nothing.
 */
function dialogOf(mismatch: Version): Dialog {
  const { version, recommended, isNewer } = mismatch
  const costs = continuingCosts(isNewer ? 'you reinstall it' : 'you upgrade it')

  return {
    question: isNewer
      ? `Your terminal runs ccstatusline ${version}, newer than the ${recommended} ccstatusline desktop carries. They share one settings file, and a layout saved from here can lose what the newer one added. Reinstall ccstatusline ${recommended} in its place? ${costs}`
      : `Your terminal runs ccstatusline ${version}, older than ccstatusline desktop shares a settings file with (${OLDEST_SHARING} to ${recommended}): it shows what the layout says to hide. Upgrade it to ${recommended}? ${costs}`,
    changes: { [choiceOf(mismatch)]: ['upgrade', recommended] },
    leave: CONTINUE,
  }
}

/**
 * What is done about a mismatch without asking: a terminal with no
 * ccstatusline gets the engine's version, and so does an older one while the
 * person is updating.
 */
function unaskedOf(mismatch: Mismatch, asking: Asking): readonly string[] | undefined {
  if ('isMissing' in mismatch) {
    return ['install', mismatch.recommended]
  }

  return asking === 'updating' && !mismatch.isNewer ? ['upgrade', mismatch.recommended] : undefined
}

/**
 * What `/ccstatusline-desktop edit` answers in the configurator's place while
 * a terminal's ccstatusline of a version out of range stands: a layout saved
 * from the mod's configurator is one the other reads differently, or loses from.
 *
 * @param mismatch the mismatch that stands
 * @returns why edit is off and how the layout is changed meanwhile; undefined
 *          where the terminal has no ccstatusline, which reads no layout
 */
export function editOffOf(mismatch: Mismatch): string | undefined {
  if ('isMissing' in mismatch) {
    return undefined
  }

  const { version, recommended } = mismatch

  return [
    `\`/ccstatusline-desktop edit\` is off while your terminal runs ccstatusline ${version}: ccstatusline desktop shares its settings file with versions ${OLDEST_SHARING} to ${recommended} only.`,
    'To change the layout meanwhile, run your own ccstatusline in a terminal: the band draws what it saves.',
    `To turn edit back on, run \`/ccstatusline-desktop edit\` again and choose **${choiceOf(mismatch)}**.`,
  ].join('\n')
}

/**
 * Brings a terminal's ccstatusline to the version of the mod's engine. A
 * terminal with none gets it installed without a question: the mod draws no
 * band there, and the status line is ccstatusline's own. One of a version out
 * of range is asked about first: a newer one is installed again at the
 * engine's version, an older one upgraded to it.
 *
 * Never rejects: a dialog nobody answered changes nothing, and a change that
 * failed is answered in words. An install that failed is not tried again
 * until asked for with `again` or `updating`.
 *
 * @param host the calls on Claude Code the dialog and the runs are made with
 * @param runtime the command the script is run with: `node`, `bun`, or a path to one
 * @param asking whether a mismatch already answered about is asked about
 *               again, and whether an older ccstatusline is upgraded unasked
 * @returns the mismatch that still stands, if any, and what was done about it, if anything
 */
export async function alignTerminal(host: Host, runtime: string, asking: Asking): Promise<Alignment> {
  const mismatch = await mismatchOf(host, runtime)

  if (mismatch === undefined) {
    return {}
  }

  const answered = answeredOf(mismatch)

  if (asking === 'once' && (await host.recall(ANSWERED_KEY).catch(() => undefined)) === answered) {
    return { standing: mismatch }
  }

  const unasked = unaskedOf(mismatch, asking)
  let change = unasked

  if (change === undefined && !('isMissing' in mismatch)) {
    const { question, changes, leave } = dialogOf(mismatch)

    // Dismissed, or asked where there is nobody to answer: asked again next time
    const answer = await host
      .ask(question, { header: 'Terminal', options: [...Object.keys(changes), leave] })
      .catch(() => undefined)

    if (answer === undefined) {
      return { standing: mismatch }
    }

    await host.remember(ANSWERED_KEY, answered).catch(() => undefined)

    change = Object.hasOwn(changes, answer) ? changes[answer] : undefined
  }

  if (change === undefined) {
    return { standing: mismatch }
  }

  const aligned = await changed(host, runtime, change)

  if (aligned.isChanged) {
    return { aligned }
  }

  // A change nobody chose is not made again at every session's first draw
  if (unasked !== undefined) {
    await host.remember(ANSWERED_KEY, answered).catch(() => undefined)
  }

  return { aligned, standing: mismatch }
}

/**
 * Has the terminal's ccstatusline handed the terminal's width where it is not
 * yet: on Windows, where ccstatusline finds none by itself, and a flex
 * separator then pushes nothing to the right. The script tells whether there
 * is anything to do.
 *
 * Never rejects: a run that failed changes nothing and says nothing.
 *
 * @param host the calls on Claude Code the run is made with
 * @param runtime the command the script is run with: `node`, `bun`, or a path to one
 * @returns what was changed, in the script's words; undefined where nothing was
 */
export async function widenTerminal(host: Host, runtime: string): Promise<string | undefined> {
  try {
    const ran = await host.run([runtime, pathIn(host.root, ...SCRIPT), 'widen'], {
      timeoutMs: DETECT_TIMEOUT_MS,
    })

    const said = ran.stdout.trim()

    return ran.exitCode === 0 && said !== '' ? said : undefined
  } catch {
    return undefined
  }
}

/** Has the script make a change, and says what it said. Never rejects. */
async function changed(host: Host, runtime: string, change: readonly string[]): Promise<Aligned> {
  try {
    const ran = await host.run([runtime, pathIn(host.root, ...SCRIPT), ...change], {
      timeoutMs: CHANGE_TIMEOUT_MS,
    })

    return {
      isChanged: ran.exitCode === 0,
      said: [ran.stdout.trim(), ran.stderr.trim()].filter(said => said !== '').join('\n'),
    }
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error)

    return {
      isChanged: false,
      said: `ccstatusline desktop: the terminal's ccstatusline was left as it is (${said})`,
    }
  }
}
