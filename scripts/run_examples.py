#!/usr/bin/env python
"""Compile and run every examples/*.qs against the local simulator.

Run with:  mise run examples   (or)   uv run python scripts/run_examples.py
Uses the modern `qdk` package (the deprecated `qsharp` package still works but
emits a deprecation warning).
"""
import glob
import os

import qdk
from qdk import qsharp

here = os.path.dirname(__file__)
examples = sorted(glob.glob(os.path.join(here, "..", "examples", "*.qs")))

for path in examples:
    name = os.path.basename(path)
    qdk.init()
    qsharp.eval(open(path).read())
    result = qsharp.run("Main()", shots=3)
    print(f"OK  {name}: {result}")
