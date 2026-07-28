// Compile & run examples/*.qs on the local QDK simulator through the repo's
// uv-managed environment (never the system Python — see AGENTS.md).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { extensionDir, listFiles, safeJoin } from "./repo.mjs";

const DRIVER = path.join(extensionDir, "run_example.py");

// The extension process may not inherit the user's shell PATH, so fall back to
// the usual install locations before giving up on `uv`.
function resolveUv() {
    const home = os.homedir();
    const candidates = [
        path.join(home, ".local/bin/uv"),
        path.join(home, ".cargo/bin/uv"),
        "/opt/homebrew/bin/uv",
        "/usr/local/bin/uv",
    ];
    const miseRoot = path.join(home, ".local/share/mise/installs/uv");
    if (fs.existsSync(miseRoot)) {
        for (const version of fs.readdirSync(miseRoot)) {
            const dir = path.join(miseRoot, version);
            if (!fs.statSync(dir).isDirectory()) continue;
            candidates.push(path.join(dir, "uv"));
            for (const nested of fs.readdirSync(dir)) candidates.push(path.join(dir, nested, "uv"));
        }
    }
    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
        } catch {
            /* unreadable candidate */
        }
    }
    return "uv";
}

export function listExamples(repoRoot) {
    return listFiles(repoRoot, "examples", [".qs"]).map((file) => {
        const full = path.join(repoRoot, file);
        const firstLine = fs.readFileSync(full, "utf8").split("\n", 1)[0] ?? "";
        return { file, name: path.basename(file), summary: firstLine.replace(/^\/\/\/?\s*/, "").trim() };
    });
}

export function readExample(repoRoot, file) {
    const full = safeJoin(repoRoot, file);
    if (!full || path.extname(full) !== ".qs" || !fs.existsSync(full)) return null;
    return { file, name: path.basename(full), source: fs.readFileSync(full, "utf8") };
}

function execFileAsync(command, args, options) {
    return new Promise((resolve) => {
        execFile(command, args, options, (error, stdout, stderr) => {
            resolve({ error, stdout: stdout ?? "", stderr: stderr ?? "" });
        });
    });
}

export async function runExample(repoRoot, file, shots = 100) {
    const target = readExample(repoRoot, file);
    if (!target) throw new Error(`not a Q# example in this repo: ${file}`);

    const clampedShots = Math.min(Math.max(Number(shots) || 1, 1), 5000);
    const { error, stdout, stderr } = await execFileAsync(
        resolveUv(),
        ["run", "--project", repoRoot, "python", DRIVER, path.join(repoRoot, file), String(clampedShots)],
        { cwd: repoRoot, timeout: 180_000, maxBuffer: 16 * 1024 * 1024 },
    );

    const parsed = parsePayload(stdout);
    if (!parsed) {
        const hint =
            error && error.code === "ENOENT"
                ? "`uv` was not found on PATH. Run `mise install` (or install uv) first."
                : "Run `mise run setup` to create .venv and install the qdk package.";
        return {
            file,
            shots: clampedShots,
            results: [],
            histogram: {},
            output: stdout,
            error: `${stderr.trim() || error?.message || "no output from the simulator"}\n\n${hint}`,
        };
    }
    return { file, shots: clampedShots, stderr: stderr.trim(), ...parsed };
}

// The driver prints a single JSON object on the last non-empty stdout line.
function parsePayload(stdout) {
    const lines = stdout.trimEnd().split("\n");
    for (let i = lines.length - 1; i >= 0; i -= 1) {
        const line = lines[i].trim();
        if (!line.startsWith("{")) continue;
        try {
            return JSON.parse(line);
        } catch {
            /* keep scanning upwards */
        }
    }
    return null;
}
