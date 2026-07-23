/// 07 — Grover's search
/// Find a single marked computational-basis state (given by its integer
/// index) among 2^n candidates in ~ (pi/4) * sqrt(2^n) iterations.
import Std.Arrays.*;
import Std.Canon.*;
import Std.Convert.*;
import Std.Math.*;
import Std.Measurement.*;

operation GroverSearch(n : Int, marked : Int) : Int {
    use qs = Qubit[n];
    ApplyToEach(H, qs);                                   // uniform superposition
    let iterations = Round(PI() / 4.0 * Sqrt(IntAsDouble(2 ^ n)));
    for _ in 1 .. iterations {
        MarkOracle(qs, marked);                          // phase-flip the target
        Diffuser(qs);                                    // invert about the mean
    }
    return ResultArrayAsInt(MResetEachZ(qs));            // little-endian read-out
}

/// Phase-flip the basis state whose index equals `marked`.
operation MarkOracle(qs : Qubit[], marked : Int) : Unit {
    let n = Length(qs);
    within {
        // map `marked` -> all-ones by X-ing the qubits where its bit is 0
        for i in 0 .. n - 1 {
            if ((marked >>> i) &&& 1) == 0 {
                X(qs[i]);
            }
        }
    } apply {
        Controlled Z(Most(qs), Tail(qs));                // phase flip on |11..1>
    }
}

/// Grover diffusion operator (inversion about the mean).
operation Diffuser(qs : Qubit[]) : Unit {
    within {
        ApplyToEachA(H, qs);
        ApplyToEachA(X, qs);
    } apply {
        Controlled Z(Most(qs), Tail(qs));
    }
}

operation Main() : Int {
    let n = 3;
    let marked = 5;                                      // search for |101>
    let found = GroverSearch(n, marked);
    Message($"marked = {marked}, found = {found}");
    return found;
}
