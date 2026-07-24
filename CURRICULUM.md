# Q# Learning Bootstrap & Ramp — Curriculum

A phased path from zero to running quantum programs on real hardware with the
**Azure Quantum Development Kit (QDK)** and **Q#**. Track progress interactively
in `roadmap.html`; this file is the durable, git-friendly version.

**Two lanes.** `CORE` is the full path for a developer new to quantum. `FAST` is
a skip-ahead if you already know qubits, superposition, entanglement, and Dirac
notation — start at Phase 2.

## The concept ontology (how the ideas stack)

Each layer depends on the one below it:

```
Execution & Scale        Azure Quantum · resource estimation · QEC · real QPUs · Qiskit/Cirq
Algorithms & Protocols   Deutsch–Jozsa · Grover · QFT · phase estimation · teleportation
Tooling & Environment     QDK/VS Code · qsharp + Jupyter · simulators · Copilot · Katas
Q# Language               operation vs function · Qubit/Result · use-allocation · Adjoint/Controlled
QC Concepts               qubit · superposition · gates/circuits · entanglement · measurement
Mathematical Foundations  complex numbers · vectors/matrices · tensor products · Dirac notation
```

The eight phases below are the *taxonomy* (they sort every task into a bucket);
the layers above are the *ontology* (they show what depends on what).

---

## Phase 0 — Setup & orientation  ·  bootstrap, ~1–2 hrs

Get a working environment before any theory.

- Install **VS Code** + the **Azure Quantum Development Kit (QDK)** extension
  (publisher `quantum`). No Azure account needed for local work.
- Create a `.qs` file, run the "measure one qubit" sample on the built-in simulator.
- Skim the QDK overview: language, simulators, resource estimator, Python/Jupyter, Katas.
- Open **quantum.microsoft.com** and run a snippet in **Copilot in Azure Quantum** (zero install).

**Resources:** [Set up the QDK](https://learn.microsoft.com/en-us/azure/quantum/install-overview-qdk) ·
[What's in the QDK](https://learn.microsoft.com/en-us/azure/quantum/qdk-main-overview) ·
[Code with Azure Quantum](https://quantum.microsoft.com/en-us/tools/quantum-coding)

**Checkpoint:** a `.qs` file runs locally and prints a `Zero`/`One`.

---

## Phase 1 — Foundations: math + quantum concepts  ·  CORE, ~1–2 wks

The minimum mental model. Enough linear algebra to read a state vector; enough
intuition for what a gate and a measurement do. *(FAST: skim and jump to Phase 2.)*

> **Deep dive:** this phase is expanded into a full starter → intermediate section at
> [`docs/01-foundations/`](docs/01-foundations/) — open `docs/01-foundations/foundations.html`
> for rendered math, a Bloch-sphere diagram, worked examples, and self-checks across 8 sub-sections.

- Refresh: complex numbers, column vectors, matrix–vector multiply, unitary
  matrices, tensor (Kronecker) product.
- Qubit state `α|0⟩ + β|1⟩` with `|α|² + |β|² = 1`; why measurement is
  probabilistic and collapses the state.
- Katas: **Complex Arithmetic**, **Linear Algebra**, **The Qubit**, **Single-Qubit Gates**.
- Build intuition for the Bloch sphere and no-cloning.

**Resources:** [Katas in QDK Learning](https://learn.microsoft.com/en-us/azure/quantum/katas-qdk-learning) ·
[MS Learn: Quantum computing foundations](https://learn.microsoft.com/en-us/training/paths/quantum-computing-fundamentals/)

**Checkpoint:** hand-calculate the state after `H|0⟩` and predict its measurement probabilities.

---

## Phase 2 — First Q# programs: one qubit  ·  CORE, ~1 wk

Translate concepts into the language; the programming model, not algorithms.

- Program skeleton: `operation` vs `function`, `use q = Qubit()`, the `Result`
  type, and why every qubit must be `Reset` before release.
- Intrinsic gates `H, X, Y, Z, S, T, Rx, Ry, Rz`; measure with `M` / `MResetZ`.
- Write a quantum coin flip and a biased coin (`Ry`); confirm the distribution.
- `let` vs `mutable`, `for`/`if`, arrays, tuples.
- Inspect the simulated state with **`DumpMachine`** while debugging.

Model snippet:

```qsharp
operation FlipCoin() : Result {
    use q = Qubit();      // starts in |0>
    H(q);                 // equal superposition
    let r = MResetZ(q);   // measure AND reset
    return r;             // Zero or One, ~50/50
}
```

See `examples/01_hello_qubit.qs` and `examples/02_coin_flip.qs`.

**Resources:** [Introduction to Q#](https://learn.microsoft.com/en-us/azure/quantum/qsharp-overview) ·
[Ways to work with Q#](https://learn.microsoft.com/en-us/azure/quantum/qsharp-ways-to-work)

**Checkpoint:** write, run, and debug a single-qubit operation from scratch and explain each line.

---

## Phase 3 — Multi-qubit systems & entanglement  ·  CORE, ~1–2 wks

Where quantum stops looking like fancy coin flips.

- Registers with `use qs = Qubit[n]`; the state space grows as 2ⁿ amplitudes.
- `CNOT` and controlled gates; build a Bell pair (`H` + `CNOT`) and verify correlations.
- Katas: **Multi-Qubit Systems**, **Multi-Qubit Gates**, **Superposition**.
- Extend a Bell pair to a 3-qubit GHZ state; predict and confirm statistics.
- `Controlled` / `Adjoint` functors and the `within { } apply { }` uncompute pattern.

See `examples/03_bell_state.qs` and `examples/04_ghz_state.qs`.

**Checkpoint:** create and measure a Bell state and explain why the results are always correlated.

---

## Phase 4 — Measurement, oracles & core patterns  ·  CORE, ~1 wk

The reusable building blocks every algorithm leans on.

- Measure in X/Y/Z bases with `Measure([PauliX], ...)`; what a rotated-basis measurement tells you.
- Kata: **Measurements** (single- and multi-qubit).
- Phase kickback; **marking oracle** vs **phase oracle**.
- Implement an oracle that flips the phase of one marked basis state.

See `examples/05_measurement_bases.qs`.

**Checkpoint:** implement a phase oracle and explain phase kickback in a paragraph.

---

## Phase 5 — Quantum algorithms & protocols  ·  CORE, ~2–3 wks

Where it pays off. Each algorithm exercises the Phase 4 patterns.

- **Deutsch–Jozsa** and **Bernstein–Vazirani** — the gentlest "quantum beats classical".
- **Grover's search** end to end: oracle, diffusion operator, iteration count.
- **Quantum Fourier Transform** and **quantum phase estimation**.
- **Teleportation** and **superdense coding** — entanglement as a resource.
- Work the matching Katas to check against reference solutions.

See `examples/06_deutsch_jozsa.qs`, `examples/07_grover.qs`, `examples/08_teleportation.qs`.

**Resources:** [Algorithm Katas](https://learn.microsoft.com/en-us/azure/quantum/katas-qdk-learning) ·
[Q# samples](https://github.com/microsoft/qsharp/tree/main/samples)

**Checkpoint:** Grover finds a marked item in your own oracle; you can explain the √N iterations.

---

## Phase 6 — Python interop, Jupyter & simulation  ·  CORE, ~1 wk

Wire Q# into the ecosystem you already work in — classical Python driving quantum kernels.

- Set up Python with **mise** + **uv** (deps in `pyproject.toml`, no system-Python installs): `mise run setup`. Call a Q# operation from Python via `from qdk import qsharp` (the modern package; `qsharp` is deprecated) and post-process results.
- The Jupyter **`%%qsharp`** cell magic to author and simulate inline; plot histograms.
- Sweep parameters (e.g. rotation angles) from Python and visualize outcomes.
- Import an OpenQASM / Qiskit / Cirq circuit into the QDK to see the interop story.

See `notebooks/qsharp_jupyter_intro.ipynb`.

**Resources:** [Q# with Python & Jupyter](https://learn.microsoft.com/en-us/azure/quantum/qsharp-ways-to-work) ·
[Azure Quantum docs](https://learn.microsoft.com/en-us/azure/quantum)

**Checkpoint:** a notebook runs a Q# operation, sweeps a parameter, and plots the distribution.

---

## Phase 7 — Azure Quantum, resource estimation & hardware  ·  advanced, ~1–2 wks

From simulator to scale.

- Run the **Azure Quantum Resource Estimator** on one of your algorithms; read
  physical-qubit and runtime estimates; vary the error-budget / QEC assumptions.
- Logical vs physical qubits; why error correction dominates resource cost.
- *(Optional, needs Azure)* Create a workspace and submit a job to a hardware/emulator backend.
- Real-hardware constraints: limited coherence, gate errors, why circuits stay shallow today.

**Resources:** [Intro to resource estimation](https://learn.microsoft.com/en-us/azure/quantum/intro-to-resource-estimation) ·
[Azure Quantum docs](https://learn.microsoft.com/en-us/azure/quantum)

**Checkpoint:** produce and interpret a resource estimate for Grover or phase estimation at a chosen size.

---

## Phase 8 — Capstone projects  ·  apply, ongoing

Consolidate by building end-to-end. Pick one:

- **Grover-powered mini solver** — encode a small SAT / graph-coloring instance as an oracle.
- **Teleportation demo + writeup** — implement with diagnostics, explain as a short doc.
- **Phase-estimation explorer** — estimate eigenphases; sweep precision vs cost.
- **Resource-estimate report** — take a textbook algorithm to realistic size.

**Checkpoint:** a self-contained project in this repo that someone else could clone and run.

---

## Fast glossary

- **QDK** — Azure Quantum Development Kit: Q#, simulators, resource estimator, VS Code extension, Python/Jupyter.
- **Q#** — Microsoft's high-level, hardware-agnostic quantum language; separates quantum *operations* from classical *functions*.
- **operation** — a Q# subroutine that can act on qubits; contrast a deterministic classical **function**.
- **Qubit / Result** — core types; measuring a `Qubit` yields a `Result` of `Zero`/`One`.
- **Adjoint / Controlled** — functors that auto-generate an operation's inverse or a control-conditioned version.
- **Oracle** — a reversible subroutine encoding a classical function; algorithms like Grover query it.
- **Katas** — Microsoft's self-paced Q# tutorials (theory + graded exercises).
- **Resource Estimator** — QDK tool predicting physical qubits and runtime on a fault-tolerant machine.

---

*Primary sources: Microsoft Learn — Azure Quantum, and quantum.microsoft.com.*
