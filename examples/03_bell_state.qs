/// 03 — Bell state (entanglement)
/// Prepare (|00> + |11>)/sqrt(2) and measure both qubits.
/// The two results are ALWAYS equal — that is entanglement.
import Std.Diagnostics.*;
import Std.Measurement.*;

operation Main() : (Result, Result) {
    use (a, b) = (Qubit(), Qubit());
    H(a);            // superpose the first qubit
    CNOT(a, b);      // entangle: b flips iff a is |1>
    DumpMachine();   // you'll see amplitude only on |00> and |11>
    let ra = MResetZ(a);
    let rb = MResetZ(b);
    Message($"a={ra}, b={rb}  (always equal)");
    return (ra, rb);
}
