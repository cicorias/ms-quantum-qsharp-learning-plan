/// 01 — Hello, qubit
/// A single qubit in superposition, inspected, then measured.
///
/// RUN IT
///   VS Code : open this file, click "Run" on the CodeLens above Main().
///   Python  : uv run python - <<'PY'
///             import qdk
///             from qdk import qsharp
///             qdk.init()
///             qsharp.eval(open("examples/01_hello_qubit.qs").read())
///             print(qsharp.run("Main()", shots=10))
///             PY
///   All      : mise run examples
///   Notebook : paste the body of Main() into a %%qsharp cell (see notebooks/).
import Std.Diagnostics.*;
import Std.Measurement.*;

operation Main() : Result {
    use q = Qubit();      // allocated in |0>
    H(q);                 // equal superposition of |0> and |1>
    DumpMachine();        // print the simulated state vector
    let r = MResetZ(q);   // measure in Z basis AND reset to |0>
    Message($"Measured: {r}");
    return r;
}
