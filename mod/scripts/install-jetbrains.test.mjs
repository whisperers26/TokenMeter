// The tests of install-jetbrains.mjs, run with `node --test mod/scripts/install-jetbrains.test.mjs`.

import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { deflateRawSync } from 'node:zlib'

import { filesIn, ideFoldersAmong, installIn, pluginsRootsOf, versionAt, zipUrlOf } from './install-jetbrains.mjs'

/** A zip of `files`, each deflated unless it says it is stored. */
function zipOf(files) {
  const entries = []
  const directory = []
  let offset = 0

  for (const { name, text, isStored = false } of files) {
    const content = Buffer.from(text)
    const packed = isStored ? content : deflateRawSync(content)
    const nameBytes = Buffer.from(name)
    const local = Buffer.alloc(30)

    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(isStored ? 0 : 8, 8)
    local.writeUInt32LE(packed.length, 18)
    local.writeUInt32LE(content.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)

    const central = Buffer.alloc(46)

    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(isStored ? 0 : 8, 10)
    central.writeUInt32LE(packed.length, 20)
    central.writeUInt32LE(content.length, 24)
    central.writeUInt16LE(nameBytes.length, 28)
    central.writeUInt32LE(offset, 42)

    entries.push(local, nameBytes, packed)
    directory.push(central, nameBytes)
    offset += 30 + nameBytes.length + packed.length
  }

  const end = Buffer.alloc(22)

  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(Buffer.concat(directory).length, 12)
  end.writeUInt32LE(offset, 16)

  return Buffer.concat([...entries, ...directory, end])
}

test('a release keeps the zip under the tag of its version', () => {
  assert.equal(
    zipUrlOf('0.1.4'),
    'https://github.com/whisperers26/ccstatusline-desktop/releases/download/ccstatusline-desktop--v0.1.4/ccstatusline-desktop-0.1.4.zip',
  )
})

test('only IDEs of 2026.1 or later are taken, Android Studio among them, and nothing that is not an IDE', () => {
  assert.deepEqual(
    ideFoldersAmong([
      'Rider2026.2',
      'Rider2026.1',
      'Rider2025.3',
      'PyCharm2026.3',
      'IntelliJIdea2027.1',
      'AndroidStudio2026.1.4',
      'AndroidStudio2025.3.2',
      'Rider',
      'Chrome',
      'acp-agents',
      'consentOptions',
      'PermanentUserId',
    ]),
    ['AndroidStudio2026.1.4', 'IntelliJIdea2027.1', 'PyCharm2026.3', 'Rider2026.1', 'Rider2026.2'],
  )
})

test('IDEs are looked for under JetBrains and under Google, where Android Studio keeps its own', () => {
  const appData = 'C:\\Users\\me\\AppData\\Roaming'
  const under = (...folders) => ['JetBrains', 'Google'].map(vendor => join(...folders, vendor))

  assert.deepEqual(pluginsRootsOf('win32', { APPDATA: appData }, 'C:\\Users\\me').roots, under(appData))
  assert.deepEqual(
    pluginsRootsOf('darwin', {}, '/Users/me').roots,
    under('/Users/me', 'Library', 'Application Support'),
  )
  assert.deepEqual(pluginsRootsOf('linux', {}, '/home/me').roots, under('/home/me', '.local', 'share'))
})

test('Windows and macOS keep plugins in a folder of the IDE’s own, Linux in the IDE’s folder itself', () => {
  assert.equal(pluginsRootsOf('win32', {}, 'C:\\Users\\me').pluginsIn('x'), join('x', 'plugins'))
  assert.equal(pluginsRootsOf('darwin', {}, '/Users/me').pluginsIn('x'), join('x', 'plugins'))
  assert.equal(pluginsRootsOf('linux', {}, '/home/me').pluginsIn('x'), 'x')
})

test('a zip is read whether its files are deflated or stored, its folders passed over', () => {
  const files = filesIn(
    zipOf([
      { name: 'ccstatusline-desktop/', text: '', isStored: true },
      { name: 'ccstatusline-desktop/lib/ccstatusline-desktop.jar', text: 'jar '.repeat(500) },
      { name: 'ccstatusline-desktop/notes.txt', text: 'stored', isStored: true },
    ]),
  )

  assert.deepEqual(
    files.map(({ name, content }) => [name, content.toString()]),
    [
      ['ccstatusline-desktop/lib/ccstatusline-desktop.jar', 'jar '.repeat(500)],
      ['ccstatusline-desktop/notes.txt', 'stored'],
    ],
  )
})

test('a zip whose file would land outside the plugins folder is refused', () => {
  for (const name of ['../evil.jar', 'ccstatusline-desktop/../../evil.jar', '/evil.jar', 'C:/evil.jar', 'a\\..\\evil.jar']) {
    assert.throws(() => filesIn(zipOf([{ name, text: 'x' }])), /unsafe name/, name)
  }
})

test('what is not a zip is said to be none', () => {
  assert.throws(() => filesIn(Buffer.from('<html>Not Found</html>')), /not a zip file/)
})

test('the plugin takes the place of the one installed, under this name or its former one, and leaves other plugins alone', () => {
  const plugins = mkdtempSync(join(tmpdir(), 'ccstatusline-desktop-test-'))

  try {
    mkdirSync(join(plugins, 'ccstatusline-desktop', 'lib'), { recursive: true })
    writeFileSync(join(plugins, 'ccstatusline-desktop', 'lib', 'old.jar'), 'old')
    mkdirSync(join(plugins, 'ml-llm'))
    mkdirSync(join(plugins, 'token-meter', 'lib'), { recursive: true })
    writeFileSync(join(plugins, 'token-meter', 'lib', 'token-meter.jar'), 'former')

    installIn([{ name: 'ccstatusline-desktop/lib/ccstatusline-desktop.jar', content: Buffer.from('new') }], plugins)

    assert.deepEqual(readdirSync(plugins).sort(), ['ccstatusline-desktop', 'ml-llm'])
    assert.deepEqual(readdirSync(join(plugins, 'ccstatusline-desktop', 'lib')), ['ccstatusline-desktop.jar'])
    assert.equal(readFileSync(join(plugins, 'ccstatusline-desktop', 'lib', 'ccstatusline-desktop.jar'), 'utf8'), 'new')
  } finally {
    rmSync(plugins, { recursive: true, force: true })
  }
})

test('the latest release is the one its page is named for', () => {
  assert.deepEqual(
    [
      'https://github.com/whisperers26/ccstatusline-desktop/releases/tag/ccstatusline-desktop--v1.0.0',
      'https://github.com/whisperers26/ccstatusline-desktop/releases/tag/ccstatusline-desktop--v',
      'https://github.com/whisperers26/ccstatusline-desktop/releases/tag/v2.2.32',
      'https://github.com/whisperers26/ccstatusline-desktop/releases',
      '',
    ].map(versionAt),
    ['1.0.0', undefined, undefined, undefined, undefined],
  )
})
