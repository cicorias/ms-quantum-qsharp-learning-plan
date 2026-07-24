# 04 · The qubit & the Bloch sphere

**Goal:** picture a single-qubit state via the angles $\theta,\varphi$.

## Key ideas
- $|\psi\rangle=\cos\tfrac{\theta}{2}|0\rangle+e^{i\varphi}\sin\tfrac{\theta}{2}|1\rangle$.
- $|0\rangle$ = north pole, $|1\rangle$ = south pole; the equator holds equal superpositions.
- Polar angle sets $P(0)=\cos^2\tfrac{\theta}{2}$; azimuth $\varphi$ is the relative phase.

## Connect to Q#
`DumpMachine()` after `H(q)` shows the $|+\rangle$ point — `../../../examples/01_hello_qubit.qs`.

## Exercises
- Give $(\theta,\varphi)$ for $|-\rangle$ and $|{+}i\rangle$.
- If $P(0)=3/4$, find $\theta$.

## References
Kata: *The Qubit*. Deep dive: `../foundations.html` (§04).
