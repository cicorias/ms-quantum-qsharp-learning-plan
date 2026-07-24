# 07 · Tensor products & multi-qubit states

**Goal:** combine qubits with the tensor product; understand $2^n$ growth.

## Key ideas
- $|a\rangle\otimes|b\rangle=|ab\rangle$; e.g. $|00\rangle=(1,0,0,0)^\top$.
- $n$ qubits need $2^n$ complex amplitudes — an exponential state space.
- Product states vs non-factorable (entangled) states.

## Connect to Q#
`use qs = Qubit[n]` allocates a register — `../../../examples/04_ghz_state.qs`.

## Exercises
- Write $|01\rangle$ as a 4-vector and as $|0\rangle\otimes|1\rangle$.
- How many amplitudes describe 10 qubits?

## References
Kata: *Multi-Qubit Systems*. Deep dive: `../foundations.html` (§07).
