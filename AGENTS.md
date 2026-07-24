# AGENTS.md

Guidance for humans and AI coding agents working in this repository.

> `CLAUDE.md` is a symlink to this file. Keep all agent/dev instructions here so
> every tool reads the same guidance.

## What this repo is

A self-paced learning path and runnable example set for **Q#** and the
**Azure Quantum Development Kit (QDK)**. It pairs a phased curriculum with
minimal, runnable Q# programs and a Jupyter notebook that uses the QDK's Q# +
Python integration.

## Layout

- `roadmap.html` — interactive, phase-by-phase tracker (open in a browser).
- `CURRICULUM.md` — the same ramp in Markdown (phases 0–8).
- `examples/*.qs` — one concept per file, each with a `Main` entry point.
- `notebooks/` — Jupyter notebook using the `qdk` package and `%%qsharp`.
- `katas/README.md` — pointers to Microsoft's Quantum Katas, mapped to phases.
- `scripts/run_examples.py` — compile & run every example on the simulator.

## Python toolchain — REQUIRED

**Do not install into system Python, and never run `pip install` globally.**
This repo pins its toolchain with **mise** and manages the Python environment
with **uv**. Dependencies live in `pyproject.toml`; there is **no
`requirements.txt`**.

- `mise install` — provision the pinned Python and `uv` (see `mise.toml`).
- `mise run setup` — create the project venv (`.venv`) and install deps (`uv sync`).
- `mise run lab` — launch Jupyter Lab (`uv run jupyter lab`).
- `mise run examples` — compile & run all `examples/*.qs` (`uv run python scripts/run_examples.py`).
- Run anything Python inside the env with `uv run <cmd>`. Add a dependency with
  `uv add <pkg>` (updates `pyproject.toml` + `uv.lock`). Do not hand-edit a venv
  or use the system interpreter.

The Python package is **`qdk`** (the older `qsharp` package is deprecated and
only kept as a compatibility shim). Any `qdk` import registers the `%%qsharp`
Jupyter magic.

## Environment / toolchain (Q# side)

- Language: **Q#** (modern QDK; standard-library namespaces are `Std.*`,
  imported with `import Std.Xyz.*;`).
- Editor: **VS Code** + the **Azure Quantum Development Kit** extension
  (publisher `quantum`). Provides the local simulator, debugger, resource
  estimator, and a "Run / Estimate / Debug" CodeLens above `Main`.

## How to run a Q# example

- VS Code: open an `examples/*.qs` file and click **Run** on the CodeLens above
  `operation Main`.
- From Python (inside the uv env):
  ```bash
  uv run python - <<'PY'
  import qdk
  from qdk import qsharp
  qdk.init()
  qsharp.eval(open("examples/03_bell_state.qs").read())
  print(qsharp.run("Main()", shots=100))
  PY
  ```
- All at once: `mise run examples`.
- Notebook: `mise run lab`, then open `notebooks/qsharp_jupyter_intro.ipynb`.

## Conventions for adding examples

- One concept per file; keep a single `operation Main()` entry point.
- Put explicit `import Std.*;` lines at the top; don't rely on implicit opens
  beyond `Std.Core` / `Std.Intrinsic`.
- Always `Reset` (or `MResetZ`) every allocated qubit before it goes out of
  scope — releasing a non-|0⟩ qubit is an error.
- Prefer `within { ... } apply { ... }` for uncompute.
- Add a header comment explaining the concept and a "RUN IT" note.

## Notes for agents

- Q# is hardware-agnostic; target the local simulator in examples unless a task
  says otherwise, and keep everything runnable with no Azure account.
- Library symbol names occasionally shift between QDK releases; if the compiler
  flags an unknown name, check the current `Std.*` namespace rather than
  reverting to the old `Microsoft.Quantum.*` names.
- For anything Python, go through `mise` / `uv` — see "Python toolchain" above.

## Docs structure & numbering convention

Longer-form learning material lives under `docs/`, split into sections that
mirror the roadmap phases:

- Each **section** folder is `docs/NN-<name>/`, where `NN` is the zero-padded
  roadmap phase number (e.g. Phase 1 -> `docs/01-foundations/`).
- Inside a section, each **sub-section** is its own zero-padded folder
  (`01-...`, `02-...`) holding a `README.md` you can expand with notes.
- A section may include an interactive deep-dive page (e.g. `foundations.html`)
  at its root, plus a section `README.md` index.
- Numbering stays aligned with `roadmap.html` / `CURRICULUM.md` so the docs and
  the phase tracker always reference each other by the same numbers.

When adding a new section, create `docs/NN-<name>/`, add a `README.md` index,
and number sub-section folders from `01-`.
