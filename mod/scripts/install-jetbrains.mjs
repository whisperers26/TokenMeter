#!/usr/bin/env node
// Installs the Token Meter plugin in the JetBrains IDEs of this machine: the
// zip of this mod's own release, unpacked into each IDE's plugins folder.
//
//   node mod/scripts/install-jetbrains.mjs              the zip of this version's release
//   node mod/scripts/install-jetbrains.mjs --zip <file> a zip already on disk
//
// The mod runs it for `/token-meter jetbrains`. It needs nothing but the
// runtime the engine runs on: no IDE path, and no clone of the repository.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { get } from 'node:https'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { inflateRawSync } from 'node:zlib'

const PLUGIN = 'token-meter'
const RELEASES = 'https://github.com/whisperers26/ccstatusline-desktop/releases'

/** The folder AI Assistant is installed in, among an IDE's plugins. */
const AI_ASSISTANT = 'ml-llm'

/** The first line of IDEs whose AI Assistant has the slot the band is drawn in. */
const SINCE = { year: 2026, minor: 2 }

/** How many redirects a download follows: a release's file is served from another host. */
const MAX_REDIRECTS = 5

/** An IDE's own folder under JetBrains': the product, then its line (`Rider2026.2`). */
const IDE_FOLDER = /^[A-Za-z]+(\d{4})\.(\d+)$/

const END_OF_DIRECTORY = 0x06054b50
const DIRECTORY_ENTRY = 0x02014b50
const STORED = 0
const DEFLATED = 8

/** Where a release keeps the plugin's zip. */
export const zipUrlOf = version =>
  `${RELEASES}/download/${PLUGIN}--v${version}/${PLUGIN}-${version}.zip`

/**
 * The folders IDEs keep the plugins a person installs in, one per IDE and
 * line, whether or not that IDE is there.
 *
 * @param platform `process.platform`
 * @param env the environment, for `APPDATA` on Windows
 * @param home the home directory
 * @returns the folder that holds them, and how a plugins folder is spelled under one of its own
 */
export function pluginsRootOf(platform, env, home) {
  if (platform === 'win32') {
    return {
      root: join(env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'JetBrains'),
      pluginsIn: ide => join(ide, 'plugins'),
    }
  }

  if (platform === 'darwin') {
    return {
      root: join(home, 'Library', 'Application Support', 'JetBrains'),
      pluginsIn: ide => join(ide, 'plugins'),
    }
  }

  return { root: join(home, '.local', 'share', 'JetBrains'), pluginsIn: ide => ide }
}

/**
 * The IDEs among the folders JetBrains keeps, of a line the plugin runs in.
 *
 * @param names the names of the folders under JetBrains' own
 * @returns those that are an IDE's, of 2026.2 or later, in the order of their names
 */
export function ideFoldersAmong(names) {
  return names
    .filter(name => {
      const [, year, minor] = IDE_FOLDER.exec(name) ?? []

      return (
        year !== undefined &&
        (Number(year) > SINCE.year ||
          (Number(year) === SINCE.year && Number(minor) >= SINCE.minor))
      )
    })
    .sort()
}

/**
 * The files a zip holds.
 *
 * Reads what a plain zip of a plugin is made of: entries stored or deflated,
 * none encrypted, none past 4 GiB. A name that would leave the folder the zip
 * is unpacked in is refused.
 *
 * @param zip the archive, whole
 * @returns each file's name, with `/` between its folders, and its content
 */
export function filesIn(zip) {
  let end = zip.length - 22

  while (end >= 0 && zip.readUInt32LE(end) !== END_OF_DIRECTORY) {
    end -= 1
  }

  if (end < 0) {
    throw new Error('not a zip file')
  }

  const files = []
  let at = zip.readUInt32LE(end + 16)

  for (let left = zip.readUInt16LE(end + 10); left > 0; left -= 1) {
    if (zip.readUInt32LE(at) !== DIRECTORY_ENTRY) {
      throw new Error('a damaged zip file')
    }

    const method = zip.readUInt16LE(at + 10)
    const packedSize = zip.readUInt32LE(at + 20)
    const nameLength = zip.readUInt16LE(at + 28)
    const header = zip.readUInt32LE(at + 42)
    const name = zip.toString('utf8', at + 46, at + 46 + nameLength)

    at += 46 + nameLength + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32)

    if (name.endsWith('/')) {
      continue
    }

    if (name.startsWith('/') || name.includes('\\') || name.split('/').includes('..') || name.includes(':')) {
      throw new Error(`a zip file with an unsafe name: ${name}`)
    }

    // The entry's own header repeats the name, and has extra bytes of its own
    const start = header + 30 + zip.readUInt16LE(header + 26) + zip.readUInt16LE(header + 28)
    const packed = zip.subarray(start, start + packedSize)

    if (method !== STORED && method !== DEFLATED) {
      throw new Error(`a zip file packed in a way this does not read: ${name}`)
    }

    files.push({ name, content: method === STORED ? packed : inflateRawSync(packed) })
  }

  return files
}

/**
 * Puts the plugin in one IDE's plugins folder, in place of the one there.
 *
 * @param files the plugin's files, each named from the plugin's own folder down
 * @param plugins the IDE's plugins folder
 */
export function installIn(files, plugins) {
  rmSync(join(plugins, PLUGIN), { recursive: true, force: true })

  for (const { name, content } of files) {
    const target = join(plugins, ...name.split('/'))

    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
}

/** The body of what a URL answers, redirects followed. */
function download(url, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { 'User-Agent': PLUGIN } }, response => {
      const { statusCode = 0, headers } = response

      if (statusCode >= 300 && statusCode < 400 && headers.location !== undefined) {
        response.resume()

        if (redirectsLeft === 0) {
          reject(new Error('too many redirects'))
        } else {
          resolve(download(new URL(headers.location, url).href, redirectsLeft - 1))
        }

        return
      }

      if (statusCode !== 200) {
        response.resume()
        reject(new Error(`HTTP ${statusCode}`))

        return
      }

      const chunks = []

      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}

/** The mod's version: the release whose zip fits it. */
function versionOfMod() {
  const manifest = join(dirname(fileURLToPath(import.meta.url)), '..', '.claude-plugin', 'plugin.json')

  return JSON.parse(readFileSync(manifest, 'utf8')).version
}

/** The plugin's files: those of the zip named, else of this version's release. */
async function pluginFiles(zipPath) {
  if (zipPath !== undefined) {
    return { files: filesIn(readFileSync(zipPath)), from: zipPath }
  }

  const url = zipUrlOf(versionOfMod())

  try {
    return { files: filesIn(await download(url)), from: url }
  } catch (error) {
    throw new Error(
      `could not get ${url} (${error.message}).\n` +
        `Download the zip from ${RELEASES} and install it by hand:` +
        ' Settings | Plugins | gear | Install Plugin from Disk.',
    )
  }
}

async function main(args) {
  const zipAt = args.indexOf('--zip')
  const zipPath = zipAt < 0 ? undefined : args[zipAt + 1]

  if (zipAt >= 0 && zipPath === undefined) {
    throw new Error('--zip needs a file')
  }

  const { root, pluginsIn } = pluginsRootOf(process.platform, process.env, homedir())
  const ides = existsSync(root) ? ideFoldersAmong(readdirSync(root)) : []

  if (ides.length === 0) {
    throw new Error(
      `no JetBrains IDE of ${SINCE.year}.${SINCE.minor} or later was found in ${root}.\n` +
        `For an IDE that keeps its plugins elsewhere, download the zip from ${RELEASES} and install it by hand:` +
        ' Settings | Plugins | gear | Install Plugin from Disk.',
    )
  }

  const { files, from } = await pluginFiles(zipPath)

  if (files.length === 0 || files.some(({ name }) => !name.startsWith(`${PLUGIN}/`))) {
    throw new Error(`${from} is not the Token Meter plugin`)
  }

  console.log(`Token Meter for JetBrains IDEs, from ${from}`)
  console.log('')

  let installed = 0

  for (const ide of ides) {
    const plugins = pluginsIn(join(root, ide))

    try {
      installIn(files, plugins)
      installed += 1

      console.log(
        existsSync(join(plugins, AI_ASSISTANT))
          ? `${ide}: installed`
          : `${ide}: installed; no AI Assistant was found among its plugins, and the band is drawn in its chat`,
      )
    } catch (error) {
      console.log(`${ide}: not installed (${error.message}); close the IDE and run this again`)
    }
  }

  console.log('')
  console.log(
    installed > 0
      ? 'Restart an IDE to load the plugin, then open an AI Assistant chat with Claude.'
      : 'Nothing was installed.',
  )

  if (installed === 0) {
    process.exitCode = 1
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(error => {
    console.error(`Token Meter: ${error.message}`)
    process.exitCode = 1
  })
}
