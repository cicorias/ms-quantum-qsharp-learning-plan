# 02 · Vectors, matrices & unitaries

**Goal:** represent states as column vectors and gates as unitary matrices.

## Key ideas
- State $|\psi\rangle=\bigl(\begin{smallmatrix}\alpha\\\beta\end{smallmatrix}\bigr)$, unit norm $|\alpha|^2+|\beta|^2=1$.
- Inner product $\langle\phi|\psi\rangle$; norm $\sqrt{\langle\psi|\psi\rangle}$.
- A gate is a **unitary** $U$: $U^\dagger U = I$, so $U^{-1}=U^\dagger$ — the reason
  Q# can auto-generate an operation's `Adjoint`.

## Worked
$H\bigl(\begin{smallmatrix}1\\0\end{smallmatrix}\bigr)=\tfrac1{\sqrt2}\bigl(\begin{smallmatrix}1\\1\end{smallmatrix}\bigr)$; and $H^\dagger=H$, $H^2=I$.

## Connect to Q#
`operation ... : Unit is Adj + Ctl` depends on unitarity.

## Exercises
- Verify $\langle0|1\rangle=0$ and $\langle0|0\rangle=1$.
- Show $X$ is unitary and self-inverse.
- Compute $H|1\rangle$.

## References
Kata: *Linear Algebra*. Deep dive: `../foundations.html` (§02).
