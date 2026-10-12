// The tests of terminal-ccstatusline.mjs, run with `node --test mod/scripts/terminal-ccstatusline.test.mjs`.

import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  detect,
  install,
  installOf,
  managerOf,
  uninstall,
  upgrade,
  withoutCcstatusline,
  withSpec,
  writtenLike,
} from './terminal-ccstatusline.mjs'

/**
 * A machine in a scratch folder: a home with Claude Code's settings in it, and
 * package managers that answer from `globals` and record what they are asked.
 */
function machineOf({ settings, globals = {}, latest = '2.2.32', failing = [] } = {}) {
  const home = mkdtempSync(join(tmpdir(), 'ccstatusline-desktop-terminal-'))
  const path = join(home, '.claude', 'settings.json')
  const npmRoot = join(home, 'npm', 'node_modules')
  const asked = []

  mkdirSync(join(home, '.claude'), { recursive: true })

  if (settings !== undefined) {
    writeFileSync(path, typeof settings === 'string' ? settings : `${JSON.stringify(settings, null, 2)}\n`)
  }

  for (const [manager, version] of Object.entries(globals)) {
    const folder = join(
      manager === 'npm' ? npmRoot : join(home, '.bun', 'install', 'global', 'node_modules'),
      'ccstatusline',
    )

    mkdirSync(folder, { recursive: true })
    writeFileSync(join(folder, 'package.json'), JSON.stringify({ version }))
  }

  const world = {
    env: { PATH: '' },
    home,
    platform: 'linux',
    sh: line => {
      asked.push(line)

      if (failing.includes(line)) {
        return { status: 1, stdout: '', stderr: 'npm error code EACCES\n' }
      }

      if (line === 'npm root -g') {
        return { status: 0, stdout: `${npmRoot}\n`, stderr: '' }
      }

      return { status: 0, stdout: line === 'npm view ccstatusline version' ? `${latest}\n` : '', stderr: '' }
    },
  }

  return {
    world,
    path,
    asked,
    written: () => JSON.parse(readFileSync(path, 'utf8')),
    backup: () => readFileSync(`${path}.before-ccstatusline-desktop`, 'utf8'),
    drop: () => rmSync(home, { recursive: true, force: true }),
  }
}

const statusLineOf = command => ({ statusLine: { type: 'command', command, padding: 0 } })

test('a status line is ccstatusline as a global command or through a runner, and nothing else', () => {
  assert.deepEqual(
    [
      'ccstatusline',
      'ccstatusline --config /tmp/x.json',
      '"C:\\Users\\me\\AppData\\Roaming\\npm\\ccstatusline.cmd"',
      'npx -y ccstatusline@latest',
      'bunx -y ccstatusline@2.2.20 --config x',
      'npx ccstatusline',
      '~/bin/statusline.sh',
      'bash -c "npx ccstatusline@latest | tee log"',
      'npx -y other-statusline',
      '',
    ].map(installOf),
    [
      { kind: 'global' },
      { kind: 'global' },
      { kind: 'global' },
      { kind: 'runner', runner: 'npx', spec: 'latest' },
      { kind: 'runner', runner: 'bunx', spec: '2.2.20' },
      { kind: 'runner', runner: 'npx', spec: undefined },
      undefined,
      undefined,
      undefined,
      undefined,
    ],
  )
})

test("a runner's command is made to name a version, its other words kept", () => {
  assert.deepEqual(
    ['npx -y ccstatusline@latest', 'bunx ccstatusline --config "a b.json"'].map(command => withSpec(command, '2.2.32')),
    ['npx -y ccstatusline@2.2.32', 'bunx ccstatusline@2.2.32 --config "a b.json"'],
  )
})

test('settings lose the status line and the hooks ccstatusline added, and nothing else', () => {
  assert.deepEqual(
    withoutCcstatusline({
      model: 'opus',
      ...statusLineOf('ccstatusline'),
      hooks: {
        PreToolUse: [
          { _tag: 'ccstatusline-managed', matcher: 'Skill', hooks: [{ type: 'command', command: 'ccstatusline --hook' }] },
          { matcher: 'Bash', hooks: [{ type: 'command', command: 'audit.sh' }] },
        ],
        UserPromptSubmit: [
          { hooks: [{ type: 'command', command: 'npx ccstatusline@latest --hook' }, { type: 'command', command: 'log.sh' }] },
        ],
        Stop: [{ _tag: 'ccstatusline-managed', hooks: [{ type: 'command', command: 'ccstatusline --hook' }] }],
      },
      env: { A: '1' },
    }),
    {
      model: 'opus',
      hooks: {
        PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'audit.sh' }] }],
        UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'log.sh' }] }],
      },
      env: { A: '1' },
    },
  )
})

test('settings whose only hooks were ccstatusline keep no hooks key', () => {
  assert.deepEqual(
    withoutCcstatusline({
      ...statusLineOf('ccstatusline'),
      hooks: { Stop: [{ _tag: 'ccstatusline-managed', hooks: [] }] },
    }),
    {},
  )
})

test('a file is written with the indent and the last newline of the one it replaces', () => {
  assert.deepEqual(
    [writtenLike('{\n    "a": 1\n}\n', { b: 2 }), writtenLike('{"a":1}', { b: 2 })],
    ['{\n    "b": 2\n}\n', '{\n  "b": 2\n}'],
  )
})

test("a global command is bun's where the first folder of the PATH that holds it is bun's", () => {
  const holds = folder => folder !== '/usr/bin'

  assert.deepEqual(
    [
      managerOf(['/usr/bin', '/home/me/.bun/bin', '/npm/bin'], '/home/me/.bun/bin', holds),
      managerOf(['/usr/bin', '/npm/bin', '/home/me/.bun/bin'], '/home/me/.bun/bin', holds),
      managerOf(['/usr/bin'], '/home/me/.bun/bin', holds),
    ],
    ['bun', 'npm', undefined],
  )
})

test('detects a global install and its version', () => {
  const machine = machineOf({ settings: statusLineOf('ccstatusline'), globals: { npm: '2.2.20' } })

  try {
    assert.deepEqual(detect(machine.world), { kind: 'global', manager: 'npm', version: '2.2.20' })
  } finally {
    machine.drop()
  }
})

test('detects the version a runner names, and asks the registry for latest', () => {
  const pinned = machineOf({ settings: statusLineOf('bunx -y ccstatusline@2.1.0') })
  const latest = machineOf({ settings: statusLineOf('npx -y ccstatusline@latest'), latest: '2.3.0' })

  try {
    assert.deepEqual(
      [detect(pinned.world), pinned.asked, detect(latest.world)],
      [
        { kind: 'runner', runner: 'bunx', version: '2.1.0' },
        [],
        { kind: 'runner', runner: 'npx', version: '2.3.0' },
      ],
    )
  } finally {
    pinned.drop()
    latest.drop()
  }
})

test('detects a global command that is no longer on the machine', () => {
  const machine = machineOf({ settings: statusLineOf('ccstatusline') })

  try {
    assert.deepEqual(detect(machine.world), {
      kind: 'global',
      manager: undefined,
      version: undefined,
      isMissing: true,
    })
  } finally {
    machine.drop()
  }
})

test('calls no global command missing that is still on the PATH, or that npm could not be asked about', () => {
  const held = machineOf({ settings: statusLineOf('ccstatusline') })
  const unasked = machineOf({ settings: statusLineOf('ccstatusline'), failing: ['npm root -g'] })
  const bin = join(held.world.home, 'pnpm')

  // The PATH is read as this platform spells it: a Windows folder has a colon in it
  mkdirSync(bin)
  writeFileSync(join(bin, process.platform === 'win32' ? 'ccstatusline.cmd' : 'ccstatusline'), '')
  held.world.env.PATH = bin
  held.world.platform = process.platform

  try {
    assert.deepEqual(
      [held, unasked].map(({ world }) => 'isMissing' in detect(world)),
      [false, false],
    )
  } finally {
    held.drop()
    unasked.drop()
  }
})

test('a command named by its path is missing once that file is gone', () => {
  const machine = machineOf({ settings: statusLineOf('/opt/tools/bin/ccstatusline --config x.json') })

  try {
    assert.equal(detect(machine.world).isMissing, true)
  } finally {
    machine.drop()
  }
})

test('detects nothing without a status line, with another tool there, or with settings that do not parse', () => {
  const machines = [
    machineOf(),
    machineOf({ settings: { model: 'opus' } }),
    machineOf({ settings: statusLineOf('~/bin/statusline.sh') }),
    machineOf({ settings: '{ not json' }),
  ]

  try {
    assert.deepEqual(
      machines.map(({ world }) => detect(world)),
      machines.map(() => ({ kind: 'none' })),
    )
  } finally {
    machines.forEach(machine => machine.drop())
  }
})

test('upgrades a global install with the package manager that holds it', () => {
  const machine = machineOf({ settings: statusLineOf('ccstatusline'), globals: { bun: '2.2.20' } })

  try {
    const said = upgrade(machine.world, '2.2.32')

    assert.deepEqual(
      [machine.asked.at(-1), said, machine.written()],
      [
        'bun add -g ccstatusline@2.2.32',
        ["ccstatusline 2.2.32 is installed globally with bun: the terminal's status line runs it."],
        statusLineOf('ccstatusline'),
      ],
    )
  } finally {
    machine.drop()
  }
})

test("upgrades a runner by the version its command names, the file as it was kept beside it", () => {
  const before = { model: 'opus', ...statusLineOf('npx -y ccstatusline@2.1.0') }
  const machine = machineOf({ settings: before })

  try {
    upgrade(machine.world, '2.2.32')

    assert.deepEqual(
      [machine.written(), JSON.parse(machine.backup()), machine.asked],
      [{ model: 'opus', ...statusLineOf('npx -y ccstatusline@2.2.32') }, before, []],
    )
  } finally {
    machine.drop()
  }
})

test("an upgraded runner's hooks run the upgraded command, and no other hook changes", () => {
  const hooksOf = command => ({
    UserPromptSubmit: [
      { _tag: 'ccstatusline-managed', hooks: [{ type: 'command', command: `${command} --hook` }] },
      { hooks: [{ type: 'command', command: 'log.sh' }] },
    ],
  })

  const machine = machineOf({
    settings: { ...statusLineOf('npx -y ccstatusline@2.1.0'), hooks: hooksOf('npx -y ccstatusline@2.1.0') },
  })

  try {
    upgrade(machine.world, '2.2.32')

    assert.deepEqual(machine.written().hooks, hooksOf('npx -y ccstatusline@2.2.32'))
  } finally {
    machine.drop()
  }
})

test('upgrades to nothing that is not a version, and nothing that is not ccstatusline', () => {
  const machine = machineOf({ settings: statusLineOf('~/bin/statusline.sh') })

  try {
    assert.throws(() => upgrade(machine.world, '2.2.32; rm -rf ~'), /is not a version/)
    assert.throws(() => upgrade(machine.world, '2.2.32'), /does not run ccstatusline/)
    assert.deepEqual(machine.asked, [])
  } finally {
    machine.drop()
  }
})

const INSTALLED = { statusLine: { type: 'command', command: 'ccstatusline', padding: 0, refreshInterval: 10 } }

test('installs globally with npm where no status line runs, and has the settings run it, the file as it was kept', () => {
  const before = { model: 'opus', hooks: { Stop: [{ hooks: [{ type: 'command', command: 'log.sh' }] }] } }
  const machine = machineOf({ settings: before })

  try {
    const said = install(machine.world, '2.2.32')

    assert.deepEqual(
      [machine.asked.at(-1), machine.written(), JSON.parse(machine.backup()), said[0]],
      [
        'npm install -g ccstatusline@2.2.32',
        { ...before, ...INSTALLED },
        before,
        'ccstatusline 2.2.32 is installed globally with npm.',
      ],
    )
  } finally {
    machine.drop()
  }
})

test('installs where Claude Code has no settings file yet, and with bun where there is no npm', () => {
  const machine = machineOf({ failing: ['npm root -g', 'npm --version'] })

  try {
    install(machine.world, '2.2.32')

    assert.deepEqual([machine.asked.at(-1), machine.written()], ['bun add -g ccstatusline@2.2.32', INSTALLED])
  } finally {
    machine.drop()
  }
})

test('an install keeps a global ccstatusline that is already there, and has the settings run it', () => {
  const machine = machineOf({ settings: {}, globals: { bun: '2.2.30' } })

  try {
    const said = install(machine.world, '2.2.32')

    assert.deepEqual(
      [machine.asked.some(line => / -g ccstatusline@/.test(line)), machine.written(), said[0]],
      [false, INSTALLED, 'The global ccstatusline 2.2.30 that bun holds was kept.'],
    )
  } finally {
    machine.drop()
  }
})

test('an install whose package manager fails leaves the settings as they were', () => {
  const before = { model: 'opus' }
  const machine = machineOf({ settings: before, failing: ['npm install -g ccstatusline@2.2.32'] })

  try {
    assert.throws(() => install(machine.world, '2.2.32'), /`npm install -g ccstatusline@2\.2\.32` failed: npm error code EACCES/)
    assert.deepEqual(machine.written(), before)
  } finally {
    machine.drop()
  }
})

test('an install over a status line whose ccstatusline was removed installs the package again', () => {
  const before = statusLineOf('ccstatusline')
  const machine = machineOf({ settings: before })

  try {
    install(machine.world, '2.2.32')

    assert.deepEqual([machine.asked.at(-1), machine.written()], ['npm install -g ccstatusline@2.2.32', before])
  } finally {
    machine.drop()
  }
})

test('installs nothing that is not a version, over another status line, or beside settings that do not parse', () => {
  const other = machineOf({ settings: statusLineOf('~/bin/statusline.sh') })
  const broken = machineOf({ settings: '{ not json' })

  try {
    assert.throws(() => install(other.world, '2.2.32; rm -rf ~'), /is not a version/)
    assert.throws(() => install(other.world, '2.2.32'), /runs a command of its own/)
    assert.throws(() => install(broken.world, '2.2.32'))
    assert.deepEqual([other.asked, broken.asked], [[], []])
  } finally {
    other.drop()
    broken.drop()
  }
})

test('uninstalls the status line and every global install, and keeps the file as it was', () => {
  const before = { model: 'opus', ...statusLineOf('ccstatusline') }
  const machine = machineOf({ settings: before, globals: { npm: '2.2.20', bun: '2.2.9' } })

  try {
    const said = uninstall(machine.world)

    assert.deepEqual(
      [machine.written(), JSON.parse(machine.backup()), machine.asked.slice(1), said.length],
      [{ model: 'opus' }, before, ['npm uninstall -g ccstatusline', 'bun remove -g ccstatusline'], 4],
    )
  } finally {
    machine.drop()
  }
})

test('an uninstall whose package manager fails still takes the status line out, and says what stayed', () => {
  const machine = machineOf({
    settings: statusLineOf('ccstatusline'),
    globals: { npm: '2.2.20' },
    failing: ['npm uninstall -g ccstatusline'],
  })

  try {
    const said = uninstall(machine.world)

    assert.deepEqual(
      [machine.written(), said[1]],
      [{}, 'The global ccstatusline 2.2.20 was not removed: `npm uninstall -g ccstatusline` failed: npm error code EACCES'],
    )
  } finally {
    machine.drop()
  }
})

test('uninstalls nothing where there is no ccstatusline, and leaves another status line alone', () => {
  const before = statusLineOf('~/bin/statusline.sh')
  const machine = machineOf({ settings: before })

  try {
    assert.throws(() => uninstall(machine.world), /no ccstatusline was found/)
    assert.deepEqual(machine.written(), before)
  } finally {
    machine.drop()
  }
})
