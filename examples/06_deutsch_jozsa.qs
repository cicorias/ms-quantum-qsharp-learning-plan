/// 06 — Deutsch–Jozsa
/// Decide in ONE oracle query whether f:{0,1}^n -> {0,1} is constant or
/// balanced. Demonstrates phase kickback via a |-> output qubit.
import Std.Arrays.*;
import Std.Canon.*;
import Std.Measurement.*;

operation DeutschJozsa(n : Int, oracle : (Qubit[], Qubit) => Unit) : Bool {
    use (x, y) = (Qubit[n], Qubit());
    X(y);                 // put output qubit into |->
    H(y);
    ApplyToEach(H, x);    // input register into uniform superposition
    oracle(x, y);
    ApplyToEach(H, x);
    Reset(y);
    let results = MResetEachZ(x);
    return All(r -> r == Zero, results);   // all Zero  <=>  constant
}

// Balanced oracle: f(x) = x_0  (flip output on the first input bit)
operation BalancedOracle(x : Qubit[], y : Qubit) : Unit {
    CNOT(x[0], y);
}

// Constant oracle: f(x) = 0  (do nothing)
operation ConstantOracle(x : Qubit[], y : Qubit) : Unit {}

operation Main() : Unit {
    let n = 3;
    Message($"balanced oracle -> reported constant? {DeutschJozsa(n, BalancedOracle)}");
    Message($"constant oracle -> reported constant? {DeutschJozsa(n, ConstantOracle)}");
}
