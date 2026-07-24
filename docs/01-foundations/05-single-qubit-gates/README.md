# 05 · Single-qubit gates

**Goal:** know X, Y, Z, H, S, T and the rotations, and predict their action.

## Key ideas
- $X$ bit-flip, $Z$ phase-flip, $Y$ both, $H$ basis↔superposition, $S,T$ add relative phase.
- $R_x,R_y,R_z$ rotate about the Bloch axes; $R_y(\theta)$ tunes $P(1)=\sin^2(\theta/2)$.
- Handy identity: $HZH=X$.

## Connect to Q#
Intrinsics `X(q)`, `H(q)`, `Rz(theta, q)` — `../../../examples/02_coin_flip.qs`.

## Exercises
- Show $X=HZH$ by matrix multiplication.
- Find $R_y(\theta)$ giving $P(1)=0.3$.
- Verify $S^2=Z$ and $T^2=S$.

## References
Kata: *Single-Qubit Gates*. Deep dive: `../foundations.html` (§05).
