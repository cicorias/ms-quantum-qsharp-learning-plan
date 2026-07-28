# qsharp-lab canvas extension

A Copilot CLI **canvas extension** for this repo. It contributes three side-panel
canvases that the agent (or you, via the command palette) can open. Nothing here
is required to use the curriculum — it's an optional companion UI.

## Canvases

| Canvas | What it does | Agent actions |
| --- | --- | --- |
| `qsharp-progress` — *Q# learning progress* | Parses `roadmap.html` into the 8 phases + tasks and lets you check them off. Shows percent complete and the current phase. | `get_progress`, `set_task`, `set_phase`, `reset` |
| `qsharp-runner` — *Q# example runner* | Lists `examples/*.qs`, shows the source, and runs `Main()` on the local QDK simulator with a shot histogram and `Message`/`DumpMachine` output. | `list_examples`, `run_example` |
| `qsharp-docs` — *Curriculum docs* | Previews `roadmap.html`, `docs/**` deep-dive pages, and repo Markdown, auto-refreshing when a file changes on disk. | `list_pages`, `show` |

Open one with, e.g., "open the Q# progress canvas" or
`open_canvas({ canvasId: "qsharp-runner", instanceId: "runner-1" })`.

## How it works

- `extension.mjs` — wiring only: declares the three canvases and their HTTP routes.
- `lib/` — `repo` (root resolution + path safety), `roadmap` (HTML → phases/tasks),
  `progress` (durable state), `runner` (uv/simulator bridge), `markdown`, `server`
  (loopback HTTP + SSE helpers).
- `ui/` — the iframe documents (`progress.html`, `runner.html`, `docs.html`) plus
  `common.css`, which styles everything with the host's canvas theme tokens.
- `run_example.py` — the Python driver executed as
  `uv run --project <repo> python run_example.py <file.qs> <shots>`; it emits one
  JSON line so simulator chatter can't corrupt the payload.

Each open canvas instance gets its own `127.0.0.1` server on an ephemeral port.

## State

Completion state lives in **`<repo>/.qsharp-progress.json`** (gitignored — it's
your personal progress, not repo content). It is keyed by task, not by canvas
instance, so every panel shows the same thing and progress survives reloads.
`roadmap.html` stays the single source of truth for the curriculum itself.

## Requirements

The runner needs the repo's uv environment: run `mise install && mise run setup`
once. `uv` is located on `PATH` or in the usual mise/homebrew install locations.
Nothing here touches system Python.
