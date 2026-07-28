// Durable completion state. Keyed by the repo (not by canvas instanceId) so two
// panels of the tracker always show the same progress and it survives reloads.

import fs from "node:fs";
import path from "node:path";

const FILE_NAME = ".qsharp-progress.json";

export function progressPath(repoRoot) {
    return path.join(repoRoot, FILE_NAME);
}

export function loadProgress(repoRoot) {
    const file = progressPath(repoRoot);
    try {
        const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
        const done = parsed && typeof parsed === "object" ? parsed.done : null;
        return { done: done && typeof done === "object" ? done : {}, notes: parsed?.notes ?? {} };
    } catch {
        return { done: {}, notes: {} };
    }
}

export function saveProgress(repoRoot, state) {
    const file = progressPath(repoRoot);
    const payload = { version: 1, updatedAt: new Date().toISOString(), done: state.done, notes: state.notes ?? {} };
    fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    return payload;
}

export function setTasks(repoRoot, ids, done) {
    const state = loadProgress(repoRoot);
    for (const id of ids) {
        if (done) state.done[id] = new Date().toISOString();
        else delete state.done[id];
    }
    saveProgress(repoRoot, state);
    return state;
}

export function resetProgress(repoRoot) {
    const state = { done: {}, notes: {} };
    saveProgress(repoRoot, state);
    return state;
}

// Merge parsed roadmap phases with stored completion into a render-ready view.
export function buildView(phases, state) {
    let total = 0;
    let complete = 0;
    const merged = phases.map((phase) => {
        const tasks = phase.tasks.map((task) => {
            const isDone = Boolean(state.done[task.id]);
            total += 1;
            if (isDone) complete += 1;
            return { ...task, done: isDone, completedAt: state.done[task.id] ?? null };
        });
        return { ...phase, tasks, done: tasks.filter((t) => t.done).length, total: tasks.length };
    });
    const currentPhase = merged.find((phase) => phase.done < phase.total)?.index ?? null;
    return {
        phases: merged,
        total,
        complete,
        percent: total ? Math.round((complete / total) * 100) : 0,
        currentPhase,
    };
}
