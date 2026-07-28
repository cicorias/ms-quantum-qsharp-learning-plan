// Repo-root resolution and path safety helpers shared by every canvas.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// The extension lives at <repo>/.github/extensions/qsharp-lab/lib, so four
// levels up is the repo root for a project-scoped install. Prefer the session
// workspace when it looks like this repo (worktree sessions relocate the root).
export function resolveRepoRoot(workspacePath) {
    const candidates = [workspacePath, path.resolve(here, "../../../..")];
    for (const candidate of candidates) {
        if (candidate && fs.existsSync(path.join(candidate, "roadmap.html"))) return candidate;
    }
    return candidates.find(Boolean) ?? process.cwd();
}

export const uiDir = path.resolve(here, "../ui");
export const extensionDir = path.resolve(here, "..");

// Resolve `relative` inside `root`, refusing anything that escapes it.
export function safeJoin(root, relative) {
    const target = path.resolve(root, relative ?? ".");
    const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
    if (target !== root && !target.startsWith(rootWithSep)) return null;
    return target;
}

export function listFiles(root, subdir, extensions) {
    const dir = safeJoin(root, subdir);
    if (!dir || !fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && extensions.includes(path.extname(entry.name)))
        .map((entry) => path.posix.join(subdir, entry.name))
        .sort();
}

export function walkFiles(root, subdir, extensions, depth = 4) {
    const start = safeJoin(root, subdir);
    if (!start || !fs.existsSync(start)) return [];
    const found = [];
    const visit = (dir, rel, level) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
            const child = path.join(dir, entry.name);
            const childRel = path.posix.join(rel, entry.name);
            if (entry.isDirectory() && level > 0) visit(child, childRel, level - 1);
            else if (entry.isFile() && extensions.includes(path.extname(entry.name))) found.push(childRel);
        }
    };
    visit(start, subdir, depth);
    return found.sort();
}
