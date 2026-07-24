# 01 · Complex numbers

**Goal:** manipulate $a+bi$, compute modulus and phase, and see why phase drives interference.

## Key ideas
- $z = a+bi$; conjugate $z^\* = a-bi$; modulus $|z|=\sqrt{a^2+b^2}$.
- Polar form $z = |z|\,e^{i\varphi}$ (Euler: $e^{i\varphi}=\cos\varphi+i\sin\varphi$).
- Probabilities come from $|z|^2$; the phase $\varphi$ is invisible to a single
  measurement but controls how amplitudes **interfere**.

## Worked
$z=\tfrac{1}{\sqrt2}(1+i)$ has $|z|=1$ and $\varphi=\pi/4$, so $z=e^{i\pi/4}$.

## Connect to Q#
`S`, `T`, and `Rz(θ, q)` apply phases — see `../../../examples/02_coin_flip.qs`.

## Exercises
- Compute $\lvert\tfrac35+\tfrac45 i\rvert$ and its phase.
- Write $-i$ as $e^{i\varphi}$.
- Show $\lvert e^{i\varphi} z\rvert = \lvert z\rvert$.

## References
Kata: *Complex Arithmetic*. Deep dive: `../foundations.html` (§01).
