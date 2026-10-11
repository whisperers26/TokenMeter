# Token Meter

**Your [ccstatusline](https://github.com/sirmalloc/ccstatusline) status line, in the Claude Code desktop app too.**

Token Meter is a fork of ccstatusline. A terminal session of Claude Code shows a status line by running a `statusLine` command; the desktop app runs no such command, so the line disappears there. Token Meter adds a Claude Code mod (a plugin) that draws the same lines in the band above the prompt:

```text
Model: Opus 5.5 | Ctx: 183.4k | ⎇ main | (+12,-3) | Thinking: high
Total: 22.7M | Session: 42.5% | Reset: 1hr 59m | Weekly: 15.0% | Weekly Reset: 3d 11hr
╭──────────────────────────────────────────────────────────────────────────────────────╮
│ > your prompt                                                                        │
╰──────────────────────────────────────────────────────────────────────────────────────╯
```

- **Desktop app**: your ccstatusline layout, with its widgets, colours, links and as many lines as you configured, refreshed after every turn and on a timer.
- **Terminal**: ccstatusline exactly as before. The engine under `src/` is unmodified upstream code, so the `statusLine` command, the configuration TUI and every widget work as the [ccstatusline docs](docs/USAGE.md) describe.
- **One layout for both**: the mod reads the same `~/.config/ccstatusline/settings.json` the terminal does.

## Install

You need a recent Claude Code (tested with 2.1.296) and Node.js 14 or later on your `PATH` (the mod runs the ccstatusline engine with it; [bun works too](#options)). Mods are an early-access part of Claude Code, so an update to it can change what a mod may do before this one catches up.

From any shell:

```bash
claude plugin install token-meter --marketplace whisperers26/TokenMeter
```

or, inside a terminal session of Claude Code, `/plugin install token-meter --marketplace whisperers26/TokenMeter`. The desktop app's own prompt does not take `/plugin`; a plugin installed from a shell at the default user scope loads there too. Start a new desktop session and the band appears above the prompt.

To run it from a clone instead, so that your edits to `mod/` load without reinstalling:

```bash
git clone https://github.com/whisperers26/TokenMeter.git
claude plugin install token-meter --marketplace ./TokenMeter
```

If you have never used ccstatusline, the band shows its default layout. To build your own, open the configuration TUI in a terminal with `npx -y ccstatusline@latest`; [docs/USAGE.md](docs/USAGE.md) covers every widget and option.

## Use

There is nothing to do: the band draws itself wherever the mod is enabled.

| Where | What draws the status line |
| --- | --- |
| Desktop app | The mod, in the band above the prompt |
| Terminal with a `statusLine` in your Claude Code settings | That command, under the prompt, as always; the mod stays out of the way |
| Terminal with no `statusLine` | The mod, in the band above the prompt |

`/token-meter` prints the current lines as text, the path of the settings file behind them and the command that opens the configurator. When the band shows `Token Meter: the engine did not run (...)` instead of your lines, that command says how the engine is being run.

### Options

Set them when you install, with `--config refreshSeconds=10`, or later from any shell:

```bash
echo '{"refreshSeconds": "10"}' | claude plugin configure token-meter@token-meter --values-stdin
```

In a terminal session, `/plugin configure token-meter@token-meter` asks for them instead. A change applies to the sessions you start after it.

| Option | Default | What it does |
| --- | --- | --- |
| `refreshSeconds` | `30` | How often the lines are run again while nothing else refreshes them. A finished turn, a model switch, a compaction and a resized band always do. At least 5; `0` turns the timer off. |
| `runtime` | `node` | The command that runs the engine: `node`, `bun`, or the full path to either when the app does not find it on its `PATH`. |

## How it works

```text
Claude Code session ──▶ mod (mod/hooks) ──▶ status line input, as JSON on stdin
                                                    │
                                                    ▼
band above the prompt ◀── styled spans ◀── ccstatusline engine (mod/engine), run with node
```

1. The mod gathers what a terminal's `statusLine` command is handed: the session and its transcript, the model, the context window, cost, and the 5-hour and weekly rate limits.
2. It runs the ccstatusline engine on that input. The engine does what it always does: reads your settings, the transcript and git, and prints lines styled with ANSI escape codes.
3. The mod turns that output into coloured text and draws it in the band, one row per line.

The engine in `mod/engine` is the published `ccstatusline` release of the version this repository is at, fetched from npm by [`mod/scripts/sync-engine.mjs`](mod/scripts/sync-engine.mjs). It is the same code `npx ccstatusline` runs under a terminal, which is why both places agree.

### What differs from a terminal

- The lines sit above the prompt, not under it: that is where Claude Code lets a mod draw.
- Claude Code hands a mod a little less than it hands a `statusLine` command. Vim mode, worktree details, lines added and removed, and API duration are missing, so a widget built only on one of those shows its empty state.
- Powerline separators need a font that has their glyphs. The desktop app draws them only if its code font does.
- The band is drawn in the desktop app and in terminals. Claude Code does not offer it to the VS Code extension or the mobile app yet.

## Repository layout

| Path | What it is |
| --- | --- |
| `src/`, `docs/`, `scripts/` | ccstatusline, as upstream ships it |
| `mod/hooks/` | The mod: one hooks module and the files it imports |
| `mod/tests/` | The mod's tests |
| `mod/engine/` | The vendored ccstatusline engine the mod runs |
| `.claude-plugin/marketplace.json` | Lists `mod/` as the plugin `token-meter` |

## Development

The mod is checked with Claude Code's own tools, not the engine's:

```bash
claude plugin validate mod             # the manifest, and what the hooks module hooks and calls
claude plugin test mod                 # mod/tests, on the terminal and desktop surfaces
claude -p "/token-meter" --plugin-dir mod   # the real engine, end to end, with no model call
```

`claude --plugin-dir mod` loads the mod from this folder for one session and reloads it as you save. It also lays Claude Code's type declarations in `mod/.claude-plugin/types`, after which `npx tsc -p mod` type-checks the mod.

The engine is developed as upstream describes in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md), with [Bun](https://bun.sh): `bun install`, `bun test`, `bun run lint`. Those commands leave `mod/` alone.

### Keeping up with ccstatusline

`src/` carries no changes of its own, so a new upstream release merges cleanly:

```bash
git fetch upstream
git merge upstream/main
node mod/scripts/sync-engine.mjs       # vendor the engine of the new version
claude plugin test mod
```

`README.md` is this fork's own; `git config merge.ours.driver true` (once per clone) makes merges keep it without asking.

If you change `src/`, vendor your own build instead: `bun run build && node mod/scripts/sync-engine.mjs --local`.

## Credits

Token Meter is built on [ccstatusline](https://github.com/sirmalloc/ccstatusline) by [Matthew Breedlove](https://github.com/sirmalloc), which does all of the rendering. Both are released under the [MIT License](LICENSE).
