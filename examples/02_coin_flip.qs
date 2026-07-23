/// 02 — Biased coin flip
/// Uses an Ry rotation so P(One) = bias, then samples it `shots` times.
/// Shows classical control flow (mutable/set, for) around a qubit.
import Std.Math.*;
import Std.Measurement.*;

operation BiasedCoin(bias : Double, shots : Int) : Int {
    // P(One) = sin^2(theta/2) = bias  =>  theta = 2*arccos(sqrt(1-bias))
    let theta = 2.0 * ArcCos(Sqrt(1.0 - bias));
    mutable ones = 0;
    for _ in 1..shots {
        use q = Qubit();
        Ry(theta, q);
        if MResetZ(q) == One {
            set ones += 1;
        }
    }
    return ones;
}

operation Main() : Int {
    let shots = 1000;
    let ones = BiasedCoin(0.3, shots);
    Message($"{ones} / {shots} came up One (expected ~300)");
    return ones;
}
