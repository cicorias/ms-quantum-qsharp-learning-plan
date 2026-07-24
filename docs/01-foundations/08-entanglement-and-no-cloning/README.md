# 08 · Entanglement & no-cloning

**Goal:** define entanglement via Bell states and understand the no-cloning theorem.

## Key ideas
- Bell state $|\Phi^+\rangle=\tfrac1{\sqrt2}(|00\rangle+|11\rangle)$, built by `H` then `CNOT`.
- Local measurements are individually random but perfectly correlated (no signalling).
- No unitary clones an arbitrary unknown state → no qubit "backups"; error
  correction must spread information rather than copy it.

## Connect to Q#
`../../../examples/03_bell_state.qs` and `../../../examples/04_ghz_state.qs`.

## Exercises
- Write the four Bell states and the circuits that make them.
- Explain why no-cloning does not forbid copying a known classical bit.

## References
Katas: *Multi-Qubit Systems*, *Superposition*. Deep dive: `../foundations.html` (§08).
