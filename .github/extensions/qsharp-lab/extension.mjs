// Extension: qsharp-lab
// Three canvases for this Q#/QDK learning repo:
//   qsharp-progress — checkable curriculum tracker driven by roadmap.html
//   qsharp-runner   — browse examples/*.qs and run them on the local simulator
//   qsharp-docs     — live-reloading preview of roadmap.html, docs/**, and *.md
//
// Each open instance gets its own loopback HTTP server; the iframe talks to it
// over plain fetch/SSE. Durable state lives in the repo, never in instance maps.

import fs from "node:fs";
import path from "node:path";
import { joinSession, createCanvas, CanvasError } from "@github/copilot-sdk/extension";

import { resolveRepoRoot, safeJoin, uiDir, walkFiles } from "./lib/repo.mjs";
import { parseRoadmap } from "./lib/roadmap.mjs";
import { buildView, loadProgress, resetProgress, setTasks } from "./lib/progress.mjs";
import { listExamples, readExample, runExample } from "./lib/runner.mjs";
import { renderMarkdown } from "./lib/markdown.mjs";
import { EventHub, readJsonBody, sendFile, sendJson, sendText, startServer } from "./lib/server.mjs";

// instanceId -> { server, url, hub, dispose? }
const instances = new Map();
let session;

function repoRoot() {
    return resolveRepoRoot(session?.workspacePath);
}

function log(message, level = "info") {
    try {
        session?.log(message, { level, ephemeral: true });
    } catch {
        /* logging must never break a canvas */
    }
}

// Boot (or reuse) the loopback server backing one canvas instance. `open` is
// re-invoked on rehydrate/reopen, so this has to be idempotent.
async function ensureInstance(instanceId, buildRouter) {
    const existing = instances.get(instanceId);
    if (existing) return existing;

    const hub = new EventHub();
    const state = { hub };
    const router = buildRouter(state);
    const { server, url } = await startServer(async (req, res) => {
        const requestUrl = new URL(req.url, "http://127.0.0.1");
        if (requestUrl.pathname === "/events") return hub.subscribe(req, res);
        if (requestUrl.pathname.startsWith("/assets/")) {
            return sendFile(res, safeJoin(uiDir, requestUrl.pathname.slice("/assets/".length)));
        }
        return router(req, res, requestUrl);
    });

    Object.assign(state, { server, url });
    instances.set(instanceId, state);
    return state;
}

async function disposeInstance(instanceId) {
    const entry = instances.get(instanceId);
    if (!entry) return;
    instances.delete(instanceId);
    entry.hub.close();
    entry.dispose?.();
    await new Promise((resolve) => entry.server.close(() => resolve()));
}

function broadcastTo(canvasIds, event, data) {
    for (const [, entry] of instances) {
        if (canvasIds.includes(entry.canvasId)) entry.hub.broadcast(event, data);
    }
}

/* ------------------------------------------------------------------ progress */

function progressView() {
    const root = repoRoot();
    return buildView(parseRoadmap(root), loadProgress(root));
}

function findTask(view, taskId) {
    for (const phase of view.phases) {
        const task = phase.tasks.find((candidate) => candidate.id === taskId);
        if (task) return task;
    }
    return null;
}

function phaseTaskIds(view, index) {
    const phase = view.phases.find((candidate) => candidate.index === index);
    if (!phase) throw new CanvasError("unknown_phase", `no phase ${index} in roadmap.html`);
    return phase.tasks.map((task) => task.id);
}

function progressRouter() {
    return async (req, res, url) => {
        if (req.method === "GET" && url.pathname === "/") return sendFile(res, path.join(uiDir, "progress.html"));
        if (req.method === "GET" && url.pathname === "/api/state") return sendJson(res, 200, progressView());

        if (req.method === "POST" && url.pathname === "/api/task") {
            const body = await readJsonBody(req);
            setTasks(repoRoot(), [body.taskId], Boolean(body.done));
            const view = progressView();
            broadcastTo(["qsharp-progress"], "changed", { source: "canvas" });
            return sendJson(res, 200, view);
        }
        if (req.method === "POST" && url.pathname === "/api/phase") {
            const body = await readJsonBody(req);
            setTasks(repoRoot(), phaseTaskIds(progressView(), Number(body.phase)), Boolean(body.done));
            const view = progressView();
            broadcastTo(["qsharp-progress"], "changed", { source: "canvas" });
            return sendJson(res, 200, view);
        }
        if (req.method === "POST" && url.pathname === "/api/reset") {
            resetProgress(repoRoot());
            broadcastTo(["qsharp-progress"], "changed", { source: "canvas" });
            return sendJson(res, 200, progressView());
        }
        return sendText(res, 404, "not found");
    };
}

const progressCanvas = createCanvas({
    id: "qsharp-progress",
    displayName: "Q# learning progress",
    description:
        "Track the 8-phase Q#/QDK curriculum from roadmap.html: check off tasks per phase and see overall completion.",
    inputSchema: {
        type: "object",
        properties: { phase: { type: "integer", minimum: 0, maximum: 8, description: "Phase to expand first" } },
        additionalProperties: false,
    },
    actions: [
        {
            name: "get_progress",
            description: "Return curriculum completion: percent complete, per-phase counts, and the current phase.",
            handler: () => {
                const view = progressView();
                return {
                    percent: view.percent,
                    complete: view.complete,
                    total: view.total,
                    currentPhase: view.currentPhase,
                    phases: view.phases.map((phase) => ({
                        index: phase.index,
                        title: phase.title,
                        done: phase.done,
                        total: phase.total,
                    })),
                };
            },
        },
        {
            name: "set_task",
            description: "Mark a single curriculum task complete or incomplete by its task id.",
            inputSchema: {
                type: "object",
                properties: { taskId: { type: "string" }, done: { type: "boolean" } },
                required: ["taskId", "done"],
                additionalProperties: false,
            },
            handler: (ctx) => {
                const before = progressView();
                const task = findTask(before, ctx.input.taskId);
                if (!task) throw new CanvasError("unknown_task", `no task ${ctx.input.taskId} in roadmap.html`);
                setTasks(repoRoot(), [task.id], ctx.input.done);
                broadcastTo(["qsharp-progress"], "changed", { source: "agent" });
                const view = progressView();
                return { taskId: task.id, label: task.label, done: ctx.input.done, percent: view.percent };
            },
        },
        {
            name: "set_phase",
            description: "Mark every task in one phase complete or incomplete.",
            inputSchema: {
                type: "object",
                properties: { phase: { type: "integer", minimum: 0, maximum: 8 }, done: { type: "boolean" } },
                required: ["phase", "done"],
                additionalProperties: false,
            },
            handler: (ctx) => {
                const ids = phaseTaskIds(progressView(), ctx.input.phase);
                setTasks(repoRoot(), ids, ctx.input.done);
                broadcastTo(["qsharp-progress"], "changed", { source: "agent" });
                return { phase: ctx.input.phase, tasks: ids.length, done: ctx.input.done, percent: progressView().percent };
            },
        },
        {
            name: "reset",
            description: "Clear all recorded curriculum progress.",
            handler: () => {
                resetProgress(repoRoot());
                broadcastTo(["qsharp-progress"], "changed", { source: "agent" });
                return { cleared: true };
            },
        },
    ],
    open: async (ctx) => {
        const entry = await ensureInstance(ctx.instanceId, () => progressRouter());
        entry.canvasId = ctx.canvasId;
        const view = progressView();
        const phase = ctx.input?.phase;
        return {
            title: "Q# learning progress",
            status: `${view.percent}% · ${view.complete}/${view.total} steps`,
            url: phase === undefined ? entry.url : `${entry.url}?phase=${phase}`,
        };
    },
    onClose: (ctx) => disposeInstance(ctx.instanceId),
});

/* -------------------------------------------------------------------- runner */

function runnerRouter(state) {
    return async (req, res, url) => {
        if (req.method === "GET" && url.pathname === "/") return sendFile(res, path.join(uiDir, "runner.html"));
        if (req.method === "GET" && url.pathname === "/api/examples") return sendJson(res, 200, listExamples(repoRoot()));
        if (req.method === "GET" && url.pathname === "/api/example") {
            const example = readExample(repoRoot(), url.searchParams.get("file"));
            return example ? sendJson(res, 200, example) : sendText(res, 404, "not found");
        }
        if (req.method === "POST" && url.pathname === "/api/run") {
            const body = await readJsonBody(req);
            const run = await runExample(repoRoot(), body.file, body.shots ?? 100);
            state.hub.broadcast("ran", run);
            return sendJson(res, 200, run);
        }
        return sendText(res, 404, "not found");
    };
}

const runnerCanvas = createCanvas({
    id: "qsharp-runner",
    displayName: "Q# example runner",
    description:
        "Browse examples/*.qs, read the source, and run Main() on the local QDK simulator with a shot histogram.",
    inputSchema: {
        type: "object",
        properties: { file: { type: "string", description: "Repo-relative .qs file to preselect, e.g. examples/03_bell_state.qs" } },
        additionalProperties: false,
    },
    actions: [
        {
            name: "list_examples",
            description: "List the Q# example programs available in examples/.",
            handler: () => listExamples(repoRoot()),
        },
        {
            name: "run_example",
            description: "Compile and run one examples/*.qs on the local simulator, returning a shot histogram.",
            inputSchema: {
                type: "object",
                properties: {
                    file: { type: "string", description: "Repo-relative path, e.g. examples/03_bell_state.qs" },
                    shots: { type: "integer", minimum: 1, maximum: 5000, default: 100 },
                },
                required: ["file"],
                additionalProperties: false,
            },
            handler: async (ctx) => {
                const run = await runExample(repoRoot(), ctx.input.file, ctx.input.shots ?? 100);
                broadcastTo(["qsharp-runner"], "ran", run);
                // The full shot list and simulator log go to the canvas; keep the
                // agent-facing payload to a readable summary.
                return {
                    file: run.file,
                    shots: run.shots,
                    histogram: run.histogram,
                    sampleResults: run.results.slice(0, 10),
                    output: run.output?.slice(0, 2000) ?? "",
                    error: run.error ?? null,
                };
            },
        },
    ],
    open: async (ctx) => {
        const entry = await ensureInstance(ctx.instanceId, (state) => runnerRouter(state));
        entry.canvasId = ctx.canvasId;
        const file = ctx.input?.file;
        return {
            title: "Q# example runner",
            status: `${listExamples(repoRoot()).length} examples`,
            url: file ? `${entry.url}?file=${encodeURIComponent(file)}` : entry.url,
        };
    },
    onClose: (ctx) => disposeInstance(ctx.instanceId),
});

/* ---------------------------------------------------------------------- docs */

const DOC_EXTENSIONS = [".html", ".md"];

function listPages() {
    const root = repoRoot();
    const pages = [];
    for (const name of fs.existsSync(root) ? fs.readdirSync(root) : []) {
        if (DOC_EXTENSIONS.includes(path.extname(name)) && fs.statSync(path.join(root, name)).isFile()) pages.push(name);
    }
    pages.push(...walkFiles(root, "docs", DOC_EXTENSIONS), ...walkFiles(root, "katas", [".md"]));
    const seen = new Set();
    return pages
        .filter((page) => !seen.has(page) && seen.add(page))
        .map((page) => ({ path: page, name: path.basename(page) }))
        .sort((a, b) => (a.path.includes("/") - b.path.includes("/")) || a.path.localeCompare(b.path));
}

// Watch the repo so edits to roadmap.html / docs refresh the canvas immediately.
function watchDocs(hub) {
    const root = repoRoot();
    let timer = null;
    let watcher;
    try {
        watcher = fs.watch(root, { recursive: true }, (_event, filename) => {
            if (!filename) return;
            const name = String(filename);
            if (name.includes("/.git/") || name.startsWith(".git/") || name.includes("node_modules")) return;
            if (!DOC_EXTENSIONS.includes(path.extname(name)) && path.extname(name) !== ".css") return;
            clearTimeout(timer);
            timer = setTimeout(() => hub.broadcast("changed", { file: name }), 150);
        });
    } catch (error) {
        log(`qsharp-lab: docs live reload unavailable (${error.message})`, "warning");
    }
    return () => {
        clearTimeout(timer);
        watcher?.close();
    };
}

function docsRouter(state) {
    return async (req, res, url) => {
        if (req.method === "GET" && url.pathname === "/") return sendFile(res, path.join(uiDir, "docs.html"));
        if (req.method === "GET" && url.pathname === "/api/pages") return sendJson(res, 200, listPages());
        if (req.method === "GET" && url.pathname === "/api/markdown") {
            const target = safeJoin(repoRoot(), url.searchParams.get("path") ?? "");
            if (!target || !fs.existsSync(target)) return sendText(res, 404, "not found");
            return sendJson(res, 200, { html: renderMarkdown(fs.readFileSync(target, "utf8")) });
        }
        if (req.method === "GET" && url.pathname.startsWith("/file/")) {
            return sendFile(res, safeJoin(repoRoot(), decodeURIComponent(url.pathname.slice("/file/".length))));
        }
        return sendText(res, 404, "not found");
    };
}

const docsCanvas = createCanvas({
    id: "qsharp-docs",
    displayName: "Curriculum docs",
    description:
        "Preview roadmap.html, docs/** deep dives, and repo Markdown side by side, auto-refreshing when files change.",
    inputSchema: {
        type: "object",
        properties: { path: { type: "string", description: "Repo-relative page to show, e.g. docs/01-foundations/foundations.html" } },
        additionalProperties: false,
    },
    actions: [
        {
            name: "list_pages",
            description: "List the HTML and Markdown pages this canvas can display.",
            handler: () => listPages(),
        },
        {
            name: "show",
            description: "Switch every open docs canvas to a specific repo-relative page.",
            inputSchema: {
                type: "object",
                properties: { path: { type: "string" } },
                required: ["path"],
                additionalProperties: false,
            },
            handler: (ctx) => {
                const target = safeJoin(repoRoot(), ctx.input.path);
                if (!target || !fs.existsSync(target)) {
                    throw new CanvasError("unknown_page", `no such page in this repo: ${ctx.input.path}`);
                }
                broadcastTo(["qsharp-docs"], "show", { path: ctx.input.path });
                return { path: ctx.input.path };
            },
        },
    ],
    open: async (ctx) => {
        const entry = await ensureInstance(ctx.instanceId, (state) => {
            state.dispose = watchDocs(state.hub);
            return docsRouter(state);
        });
        entry.canvasId = ctx.canvasId;
        const page = ctx.input?.path ?? "roadmap.html";
        return {
            title: "Curriculum docs",
            status: page,
            url: `${entry.url}?path=${encodeURIComponent(page)}`,
        };
    },
    onClose: (ctx) => disposeInstance(ctx.instanceId),
});

session = await joinSession({ canvases: [progressCanvas, runnerCanvas, docsCanvas] });
