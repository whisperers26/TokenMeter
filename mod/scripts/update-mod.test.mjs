// The tests of update-mod.mjs, run with `node --test mod/scripts/update-mod.test.mjs`.

import assert from 'node:assert/strict'
import { join } from 'node:path'
import { test } from 'node:test'

import { claudeCandidates } from './update-mod.mjs'

test('on Windows the command is looked for as a program, then as the script npm installs', () => {
  assert.deepEqual(
    claudeCandidates('win32', { PATH: 'C:\\tools;;C:\\npm' }, 'C:\\Users\\me'),
    [
      join('C:\\tools', 'claude.exe'),
      join('C:\\tools', 'claude.cmd'),
      join('C:\\npm', 'claude.exe'),
      join('C:\\npm', 'claude.cmd'),
      join('C:\\Users\\me', '.local', 'bin', 'claude.exe'),
      join('C:\\Users\\me', '.local', 'bin', 'claude.cmd'),
    ],
  )
})

test('Windows may spell the PATH as Path', () => {
  assert.equal(claudeCandidates('win32', { Path: 'C:\\tools' }, 'C:\\Users\\me')[0], join('C:\\tools', 'claude.exe'))
})

test('elsewhere it is looked for on the PATH, then where its installer puts it', () => {
  assert.deepEqual(claudeCandidates('linux', { PATH: '/usr/bin:/opt/bin' }, '/home/me'), [
    join('/usr/bin', 'claude'),
    join('/opt/bin', 'claude'),
    join('/home/me', '.local', 'bin', 'claude'),
  ])
})

test('with no PATH at all the installer\'s own folder is still tried', () => {
  assert.deepEqual(claudeCandidates('darwin', {}, '/Users/me'), [join('/Users/me', '.local', 'bin', 'claude')])
})
