#!/usr/bin/env node
// Vendors the ccstatusline engine the mod runs into mod/engine.
//
//   node mod/scripts/sync-engine.mjs           the npm release of the version
//                                              package.json names
//   node mod/scripts/sync-engine.mjs --local   this checkout's own build
//                                              (dist/, after `bun run build`)
//
// A plugin is installed as a copy of mod/ alone, so the engine has to live in
// it, built. The npm release is the default because src/ here is unmodified
// ccstatusline: the release is that source as upstream built and published it,
// byte for byte what `npx ccstatusline` runs under a terminal, and anyone can
// check mod/engine against it. Use --local once src/ carries changes of its own.
import { execFileSync, execSync } from 'node:child_process';
import {
    cpSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import {
    dirname,
    join
} from 'node:path';
import { fileURLToPath } from 'node:url';

const mod = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(mod, '..');
const engine = join(mod, 'engine');
const isLocal = process.argv.includes('--local');

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/.test(version)) {
    throw new Error(`package.json names no release version: ${version}`);
}

// The published package's dist/, fetched into a scratch folder. npm verifies
// the tarball against the registry's checksum; no install script is run.
function releasedDist(scratch) {
    execSync(
        `npm install --prefix "${scratch}" --no-save --ignore-scripts --no-audit --no-fund ccstatusline@${version}`,
        { stdio: 'inherit' }
    );

    return join(scratch, 'node_modules', 'ccstatusline', 'dist');
}

function localDist() {
    const dist = join(root, 'dist');

    if (!existsSync(join(dist, 'ccstatusline.js'))) {
        throw new Error('dist/ccstatusline.js is missing: run `bun run build` first');
    }

    return dist;
}

const scratch = mkdtempSync(join(tmpdir(), 'token-meter-engine-'));

try {
    const dist = isLocal ? localDist() : releasedDist(scratch);
    const scripts = readdirSync(dist).filter(file => file.endsWith('.js'));

    if (!scripts.includes('ccstatusline.js')) {
        throw new Error(`no ccstatusline.js in ${dist}`);
    }

    rmSync(engine, { recursive: true, force: true });
    mkdirSync(engine, { recursive: true });

    for (const file of scripts) {
        cpSync(join(dist, file), join(engine, file));
    }

    // The build is ES modules; without this Node reads a lone .js as CommonJS
    writeFileSync(join(engine, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);

    // The engine is ccstatusline's code: its licence travels with every copy
    for (const file of ['LICENSE', 'NOTICE']) {
        cpSync(join(root, file), join(engine, file));
    }

    const reported = execFileSync(process.execPath, [join(engine, 'ccstatusline.js'), '--version'], { encoding: 'utf8' }).trim();

    if (reported !== version) {
        throw new Error(`the vendored engine says it is ${reported}, not ${version}`);
    }

    writeFileSync(join(engine, 'VERSION'), `${version}${isLocal ? ' (built from this checkout)' : ''}\n`);

    console.log(`✓ mod/engine is ccstatusline ${version} (${isLocal ? 'local build' : 'npm release'}, ${scripts.length} files)`);
} finally {
    rmSync(scratch, { recursive: true, force: true });
}
