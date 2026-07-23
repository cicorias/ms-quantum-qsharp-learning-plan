# ms-quantum — Q# Learning Bootstrap & Ramp

A structured path from zero to running quantum programs with the **Azure Quantum
Development Kit (QDK)** and **Q#**, with runnable examples and a Jupyter notebook.

## Quick start

1. Install the **Azure Quantum Development Kit** extension in **VS Code**
   (publisher `quantum`). No Azure account needed for local Q#.
2. Open `examples/01_hello_qubit.qs` and click **Run** on the CodeLens above
   `operation Main`.
3. Python side — managed with **mise** + **uv** (never system Python):
   ```bash
   mise install        # pinned Python + uv (from mise.toml)
   mise run setup      # uv sync -> .venv from pyproject.toml
   mise run examples   # compile & run every examples/*.qs
   mise run lab        # Jupyter Lab -> notebooks/qsharp_jupyter_intro.ipynb
   ```
4. Open `roadmap.html` in a browser to track your progress through the phases.

## What's here

| Path | What |
|------|------|
| `roadmap.html` | Interactive phase tracker (checkboxes saved locally) |
| `CURRICULUM.md` | The ramp in Markdown, phases 0–8 |
| `examples/` | Runnable Q#, one concept per file |
| `notebooks/` | Q# + Jupyter via the `qdk` package (`%%qsharp` magic) |
| `scripts/run_examples.py` | Compile & run all examples on the simulator |
| `katas/` | Pointers to Microsoft's Quantum Katas, mapped to phases |
| `pyproject.toml` / `mise.toml` | Python deps (uv) and toolchain (mise) |
| `AGENTS.md` / `CLAUDE.md` | Repo guidance for humans and AI agents (symlinked) |

## Toolchain

- **Q#** via the **QDK** VS Code extension (local simulator, debugger, resource estimator).
- **Python** via **mise** (runtime/tool pins) + **uv** (venv & deps in `pyproject.toml`).
  Package is **`qdk`** (the old `qsharp` package is deprecated). No `requirements.txt`.

## The ramp at a glance

0. Setup & orientation
1. Foundations: math + quantum concepts
2. First Q# programs: one qubit
3. Multi-qubit systems & entanglement
4. Measurement, oracles & core patterns
5. Quantum algorithms & protocols
6. Python interop, Jupyter & simulation
7. Azure Quantum, resource estimation & hardware
8. Capstone projects

See `CURRICULUM.md` for full detail and `roadmap.html` to track progress.

## Key references

- Azure Quantum docs — https://learn.microsoft.com/en-us/azure/quantum
- Introduction to Q# — https://learn.microsoft.com/en-us/azure/quantum/qsharp-overview
- Katas in QDK Learning — https://learn.microsoft.com/en-us/azure/quantum/katas-qdk-learning
- QDK source & samples — https://github.com/microsoft/qdk
- Code with Azure Quantum (browser) — https://quantum.microsoft.com/en-us/tools/quantum-coding
