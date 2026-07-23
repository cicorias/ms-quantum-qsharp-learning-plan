/// 08 — Quantum teleportation
/// Move the state of `msg` onto `target` using a shared Bell pair and two
/// classical correction bits. Entanglement + 2 classical bits = 1 qubit moved.
import Std.Measurement.*;

operation Teleport(msg : Qubit, target : Qubit) : Unit {
    use aux = Qubit();
    // Bell pair between aux and target
    H(aux);
    CNOT(aux, target);
    // Bell-basis measurement on msg + aux
    CNOT(msg, aux);
    H(msg);
    let m1 = MResetZ(msg);
    let m2 = MResetZ(aux);
    // classical corrections on the receiver
    if m2 == One { X(target); }
    if m1 == One { Z(target); }
}

operation Main() : Result {
    use (msg, target) = (Qubit(), Qubit());
    X(msg);                       // state to teleport: |1>
    Teleport(msg, target);
    let r = MResetZ(target);      // should read One
    Message($"Teleported state measured as: {r} (expected One)");
    return r;
}
