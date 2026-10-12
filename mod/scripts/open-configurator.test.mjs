// The tests of open-configurator.mjs, run with `node --test mod/scripts/open-configurator.test.mjs`.

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { launchOf } from './open-configurator.mjs'

const none = () => false

test('Windows starts the configurator in a console of its own, each path quoted', () => {
  const command = ['C:\\Program Files\\nodejs\\node.exe', 'C:\\Users\\me\\.claude\\engine\\ccstatusline.js']

  assert.deepEqual(launchOf('win32', { ComSpec: 'C:\\Windows\\system32\\cmd.exe' }, command, none), {
    argv: [
      'C:\\Windows\\system32\\cmd.exe',
      '/d',
      '/s',
      '/c',
      '"start "ccstatusline" "C:\\Program Files\\nodejs\\node.exe" "C:\\Users\\me\\.claude\\engine\\ccstatusline.js""',
    ],
    isVerbatim: true,
    isOver: true,
  })
})

test('Windows falls back on cmd.exe where the environment names no interpreter', () => {
  assert.equal(launchOf('win32', {}, ['node', 'engine.js'], none).argv[0], 'cmd.exe')
})

test('macOS has Terminal run the configurator, quoted for the shell and then for AppleScript', () => {
  const command = ['/usr/local/bin/node', '/Users/me/my "mods"/it\'s/ccstatusline.js']

  assert.deepEqual(launchOf('darwin', {}, command, none), {
    argv: [
      'osascript',
      '-e',
      'tell application "Terminal"',
      '-e',
      'activate',
      '-e',
      'do script "\'/usr/local/bin/node\' \'/Users/me/my \\"mods\\"/it\'\\\\\'\'s/ccstatusline.js\'"',
      '-e',
      'end tell',
    ],
    isVerbatim: false,
    isOver: true,
  })
})

test('elsewhere the first terminal on the PATH runs it, and stays as the window', () => {
  const command = ['/usr/bin/node', '/home/me/engine/ccstatusline.js']
  const has = name => name === 'konsole' || name === 'xterm'

  assert.deepEqual(launchOf('linux', { DISPLAY: ':0' }, command, has), {
    argv: ['konsole', '-e', '/usr/bin/node', '/home/me/engine/ccstatusline.js'],
    isVerbatim: false,
    isOver: false,
  })
})

test('a terminal that takes the command bare is given it bare', () => {
  assert.deepEqual(
    launchOf('linux', { WAYLAND_DISPLAY: 'wayland-0' }, ['node', 'engine.js'], name => name === 'kitty').argv,
    ['kitty', 'node', 'engine.js'],
  )
})

test('with no terminal on the PATH it says which were tried', () => {
  assert.throws(
    () => launchOf('linux', { DISPLAY: ':0' }, ['node', 'engine.js'], none),
    /no terminal was found on the PATH \(tried x-terminal-emulator, .*xterm\)/,
  )
})

test('with no display there is no window to open', () => {
  assert.throws(
    () => launchOf('linux', {}, ['node', 'engine.js'], () => true),
    /no display/,
  )
})
