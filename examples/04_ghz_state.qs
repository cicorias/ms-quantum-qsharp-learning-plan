/// 04 — GHZ state on n qubits
/// (|00..0> + |11..1>)/sqrt(2): entanglement across a whole register.
import Std.Measurement.*;

operation GHZ(n : Int) : Result[] {
    use qs = Qubit[n];
    H(qs[0]);
    for i in 1 .. n - 1 {
        CNOT(qs[0], qs[i]);
    }
    return MResetEachZ(qs);   // measures and resets every qubit
}

operation Main() : Result[] {
    let results = GHZ(3);
    Message($"GHZ(3) -> {results}  (all Zero or all One)");
    return results;
}
