#!/usr/bin/env python
"""Run one examples/*.qs file on the local simulator and emit JSON.

Invoked by the qsharp-lab canvas extension as:
    uv run --project <repo> python run_example.py <file.qs> <shots>

Simulator chatter (Message / DumpMachine) is captured separately so the last
stdout line is always a single JSON object the extension can parse.
"""
import contextlib
import io
import json
import sys
import traceback

path = sys.argv[1]
shots = int(sys.argv[2]) if len(sys.argv) > 2 else 100

captured = io.StringIO()
results: list[str] = []
error = None

with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
    try:
        import qdk
        from qdk import qsharp

        qdk.init()
        with open(path, encoding="utf-8") as handle:
            qsharp.eval(handle.read())
        results = [repr(shot) for shot in qsharp.run("Main()", shots=shots)]
    except Exception:  # noqa: BLE001 - surfaced to the canvas verbatim
        error = traceback.format_exc(limit=3).strip()

histogram: dict[str, int] = {}
for value in results:
    histogram[value] = histogram.get(value, 0) + 1

json.dump(
    {
        "results": results,
        "histogram": dict(sorted(histogram.items(), key=lambda kv: (-kv[1], kv[0]))),
        "output": captured.getvalue(),
        "error": error,
    },
    sys.stdout,
)
sys.stdout.write("\n")
