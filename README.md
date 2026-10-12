# ccstatusline desktop

**Your [ccstatusline](https://github.com/sirmalloc/ccstatusline) status line, in the Claude Code desktop app and in the AI Assistant chat of JetBrains IDEs too.**

ccstatusline desktop is a fork of ccstatusline. A terminal session of Claude Code shows a status line by running a `statusLine` command; the desktop app runs no such command, and neither does a JetBrains IDE that runs Claude in its AI chat, so the line disappears in both. This fork adds Token Meter: a Claude Code mod (a plugin) that draws the same lines in the band above the desktop app's prompt, and a [JetBrains plugin](#jetbrains-ides), installed with one command, that draws them above the chat's input.

In the desktop app:

```text
Model: Opus 5.5 | Ctx: 183.4k | ⎇ main | (+12,-3) | Thinking: high
Total: 22.7M | Session: 42.5% | Reset: 1hr 59m | Weekly: 15.0% | Weekly Reset: 3d 11hr
╭──────────────────────────────────────────────────────────────────────────────────────╮
│ > your prompt                                                                        │
╰──────────────────────────────────────────────────────────────────────────────────────╯
```

- **Desktop app**: your ccstatusline layout, with its widgets, colours, links and as many lines as you configured, refreshed after every turn and on a timer.
- **Terminal**: ccstatusline exactly as before. The engine under `src/` is unmodified upstream code, so the `statusLine` command, the configuration TUI and every widget work as the [ccstatusline docs](docs/USAGE.md) describe.
- **JetBrains IDEs**: the same lines above the input of an AI Assistant chat with Claude, drawn by a small plugin that [one command installs](#jetbrains-ides).
- **One layout for all**: the mod reads the same `~/.config/ccstatusline/settings.json` the terminal does.

## Install

You need a recent Claude Code (tested with 2.1.296) and Node.js 14 or later on your `PATH` (the mod runs the ccstatusline engine with it; [bun works too](#options)). Mods are an early-access part of Claude Code, so an update to it can change what a mod may do before this one catches up.

From any shell:

```bash
claude plugin install token-meter --marketplace whisperers26/ccstatusline-desktop
```

or, inside a terminal session of Claude Code, `/plugin install token-meter --marketplace whisperers26/ccstatusline-desktop`. The desktop app's own prompt does not take `/plugin`; a plugin installed from a shell at the default user scope loads there too. Start a new desktop session and the band appears above the prompt.

That installs the latest release, not the tip of `main`.

If you have never used ccstatusline, the band shows its default layout. To build your own, open the configuration TUI in a terminal with `npx -y ccstatusline@latest`; [docs/USAGE.md](docs/USAGE.md) covers every widget and option.

## Use

There is nothing to do: the band draws itself wherever the mod is enabled.

| Where | What draws the status line |
| --- | --- |
| Desktop app | The mod, in the band above the prompt |
| Terminal with a `statusLine` in your Claude Code settings | That command, under the prompt, as always; the mod stays out of the way |
| Terminal with no `statusLine` | The mod, in the band above the prompt |
| JetBrains AI Assistant chat with Claude | The [JetBrains plugin](#jetbrains-ides), above the chat's input, from the lines the mod runs |

`/token-meter jetbrains` installs the [JetBrains plugin](#jetbrains-ides). `/token-meter` alone prints the current lines as text, the path of the settings file behind them and the command that opens the configurator. When the band shows `Token Meter: the engine did not run (...)` instead of your lines, that command says how the engine is being run.

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

## JetBrains IDEs

JetBrains AI Assistant runs Claude Code through [ACP](https://www.jetbrains.com/help/ai-assistant/acp.html), where Claude Code has nothing to draw on, so the mod's band never appears in the AI chat. The folder `jetbrains/` holds a plugin for the IDE that puts it there, above the chat's input:

```text
Model: Sonnet 5.5 | Thinking: high | Ctx: 39.5k | Total: 117.9k | Cost: $0.00          ⎇ main
Session: 7.0% | Reset: 3hr 29m | Weekly: 10.0% | Weekly Reset: 2d 13hr 39m           (+1,-1)
╭──────────────────────────────────────────────────────────────────────────────────────╮
│ Type your task, use @ to add files or / for commands                                 │
╰──────────────────────────────────────────────────────────────────────────────────────╯
```

Each chat shows the lines of its own Claude session, refreshed as the mod refreshes them. A chat narrower than a line wraps it, a link opens on a click, and a chat with another agent shows no band. Claude counts whether you added it as an ACP agent yourself or use the Claude agent AI Assistant comes with (that one from 0.1.5 of the mod, as it runs an older Claude Code of its own); Junie and other agents are not Claude Code, and the mod does not run in them.

You need the mod installed in Claude Code as [above](#install), at 0.1.4 or later, and an IDE of the 2026.2 line or later with JetBrains AI Assistant and Claude as an ACP agent. Then, from any shell:

```bash
claude -p "/token-meter jetbrains"
```

or `/token-meter jetbrains` inside a session of Claude Code. That downloads the plugin of the mod's own version from this repository's [releases](https://github.com/whisperers26/ccstatusline-desktop/releases) and puts it in the plugins folder of every JetBrains IDE of 2026.2 or later it finds on the machine, saying which. Restart the IDE and open a chat with Claude. Run it again after the mod updates, so that the two stay of one version; an IDE that is open may hold the old plugin, and the command then says to close it first.

### Installing the zip by hand

The plugin is not on JetBrains Marketplace. Where the command does not find your IDE, or you would rather not have it write there, install the same zip yourself; the steps are the same in every JetBrains IDE:

1. Download `token-meter-<version>.zip` from the [latest release](https://github.com/whisperers26/ccstatusline-desktop/releases/latest). Do not unpack it.
2. In the IDE, open **Settings** (**Ctrl+Alt+S**, or **⌘ ,** on macOS) and choose **Plugins**.
3. Click the gear (⚙) at the top of the page, then **Install Plugin from Disk...**, and pick the zip.
4. Click **OK** and restart the IDE when it asks.

To update, do the same with the newer zip. To remove the plugin, find Token Meter under **Plugins | Installed** and uninstall it.

The zip is Java and holds nothing of the machine it was built on, so the one zip serves Windows, macOS and Linux. It is built against one IDE's AI Assistant and has been run on Windows only; to build it against your own IDE instead, see [Development](#development).

Three things to know:

- The plugin draws in a slot of AI Assistant's chat that JetBrains does not document, and reads the chat's session id from AI Assistant's own classes. An AI Assistant update can change either. Should the chat misbehave after one, disable the plugin until a release catches up. [Building the plugin](#development) against your own IDE tells you whether it still fits: the build checks that the slot is still declared and that the classes still fit, and fails where they do not.
- From the first AI chat an IDE with the plugin shows, and until that IDE closes, every Claude Code session on the machine that is on no surface of Claude Code's own (an IDE's, an SDK host's, a `claude -p` run) keeps a small snapshot of its lines under `~/.cache/token-meter`, which costs it a run of the engine at its start, after each turn and on the timer. With no such IDE running, sessions keep none.
- It has been run on a local project in Rider, and builds against the AI Assistant of PyCharm and RustRover too. A project opened through remote development has not been tried.

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

### In a JetBrains IDE

A session an IDE hosts has no surface that asks the mod to draw, so step 3 has nowhere to go. There the two halves meet in a folder under the home directory instead:

```text
JetBrains plugin ──▶ ~/.cache/token-meter/reader                 "a reader is here", once a minute
mod, in the chat's Claude session ──▶ ~/.cache/token-meter/sessions/<session id>.json
JetBrains plugin ◀── that file, read once a second ──▶ band above the chat's input
```

1. The plugin signs life in `reader` from the first AI chat the IDE shows until the IDE closes. A session on no surface keeps a snapshot only while that sign is under five minutes old.
2. Such a session runs the engine at its start, after each turn, and on its timer, at a width no line reaches, and writes the result as JSON: rows of groups of styled spans, or the failure in their place, with the time until which the lines are fresh.
3. AI Assistant keeps the id of the Claude session behind each chat, and that id names the snapshot. The plugin reads the file for the chat on screen and draws it; past its freshness (the session has ended) the lines are drawn faded. With the mod's timer off (`refreshSeconds` of `0`) a snapshot names no such time, and its lines are never faded.

The plugin also drops snapshots no session has written for a week.

### What differs from a terminal

- The lines sit above the prompt, not under it: that is where Claude Code lets a mod draw.
- Claude Code hands a mod a little less than it hands a `statusLine` command. Vim mode, worktree details, lines added and removed, and API duration are missing, so a widget built only on one of those shows its empty state.
- Powerline separators need a font that has their glyphs. The desktop app draws them only if its code font does.
- The band is drawn in the desktop app and in terminals. Claude Code does not offer it to the VS Code extension or the mobile app yet.
- In a JetBrains IDE the lines are as old as the mod's last run, not redrawn on demand, and the engine's colours are a terminal's: one that would be lost on the IDE's theme is moved toward the theme's own text colour until it reads.

## Repository layout

| Path | What it is |
| --- | --- |
| `src/`, `docs/`, `scripts/` | ccstatusline, as upstream ships it |
| `mod/hooks/` | The mod: one hooks module and the files it imports |
| `mod/tests/` | The mod's tests |
| `mod/engine/` | The vendored ccstatusline engine the mod runs |
| `mod/scripts/` | What vendors the engine, and what installs the JetBrains plugin from a release |
| `jetbrains/` | The JetBrains plugin: its sources, its tests, and the one file that builds it |
| `.claude-plugin/marketplace.json` | Lists `mod/` as the plugin `token-meter` |

## Development

The mod is checked with Claude Code's own tools, not the engine's:

```bash
claude plugin validate mod             # the manifest, and what the hooks module hooks and calls
claude plugin test mod                 # mod/tests, on the terminal and desktop surfaces
claude -p "/token-meter" --plugin-dir mod   # the real engine, end to end, with no model call
node --test mod/scripts/install-jetbrains.test.mjs   # the installer `/token-meter jetbrains` runs
```

`claude --plugin-dir mod` loads the mod from this folder for one session and reloads it as you save. It also lays Claude Code's type declarations in `mod/.claude-plugin/types`, after which `npx tsc -p mod` type-checks the mod.

The engine is developed as upstream describes in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md), with [Bun](https://bun.sh): `bun install`, `bun test`, `bun run lint`. Those commands leave `mod/` alone.

The JetBrains plugin is plain Java, built by [`jetbrains/Build.java`](jetbrains/Build.java) with the Java a JetBrains IDE bundles, against that IDE and its AI Assistant, so the build needs nothing else installed. `<IDE home>` is the folder the IDE is installed in, the one that holds `lib` and `jbr`; on Windows its Java is `<IDE home>/jbr/bin/java.exe`, and on macOS, where the IDE home is inside the application, `/Applications/<IDE>.app/Contents/jbr/Contents/Home/bin/java`.

```bash
"<IDE home>/jbr/bin/java" jetbrains/Build.java test      # compile, and run jetbrains/tests
"<IDE home>/jbr/bin/java" jetbrains/Build.java           # and write jetbrains/out/token-meter-<version>.zip
"<IDE home>/jbr/bin/java" jetbrains/Build.java install   # and put it in that IDE's plugins folder
```

Everything that can be is kept clear of the IDE and tested without one: reading a snapshot, laying a row out, judging a colour, drawing the band. What touches AI Assistant's own classes is in `ChatSessions`, and what touches the IDE in `Band`, `BandProvider`, `IdeLook` and `ReaderLife`; those are checked by compiling and by running the IDE.

To try a change to the mod in the IDE before it is released, start the IDE with `CLAUDE_CODE_PLUGIN_DIRS` set to this clone's `mod` folder: Claude Code then loads the mod from there in the sessions that IDE hosts.

### Releasing

An install does not take whatever is on `main`. The marketplace entry in `.claude-plugin/marketplace.json` names a release tag, and Claude Code installs the mod as it stood at that tag. To release:

1. Set the new version in `mod/.claude-plugin/plugin.json`, and the same version and its tag (`token-meter--v<version>`) in `.claude-plugin/marketplace.json`. Commit and merge to `main`.
2. `claude plugin tag mod --push` creates and pushes that tag, after checking the two files agree.
3. Build the JetBrains plugin at that commit and publish the release with its zip, which is where `/token-meter jetbrains` and a manual install get it:

   ```bash
   "<IDE home>/jbr/bin/java" jetbrains/Build.java
   gh release create token-meter--v<version> jetbrains/out/token-meter-<version>.zip --title "Token Meter <version>" --generate-notes
   ```

   A release without the zip leaves `/token-meter jetbrains` of that version with nothing to download.

Machines that already have the mod get the release from `claude plugin update token-meter@token-meter`, or by themselves where the marketplace is set to update automatically.

The JetBrains plugin takes the mod's version when it is built. A machine gets a release's plugin by running `/token-meter jetbrains` again after the mod has updated.

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

ccstatusline desktop is built on [ccstatusline](https://github.com/sirmalloc/ccstatusline) by [Matthew Breedlove](https://github.com/sirmalloc), which does all of the rendering. Both are released under the [MIT License](LICENSE).
