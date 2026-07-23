/// 05 — Measurement bases
/// The SAME state gives different certainty in different Pauli bases.
/// |+> is definite in the X basis, but 50/50 in the Z basis.
import Std.Measurement.*;

operation Main() : Unit {
    use q = Qubit();

    H(q);                              // prepare |+>
    let x = Measure([PauliX], [q]);    // deterministic: always Zero
    Message($"|+> measured in X basis: {x}  (deterministic)");
    Reset(q);

    H(q);                              // prepare |+> again
    let z = MResetZ(q);                // random: Zero or One
    Message($"|+> measured in Z basis: {z}  (50/50)");
}
