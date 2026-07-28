// Parse roadmap.html into phases and tasks. roadmap.html stays the single
// source of truth for the curriculum; this canvas only stores completion state.

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const ENTITIES = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
    "&middot;": "·",
    "&mdash;": "—",
    "&ndash;": "–",
    "&rarr;": "→",
    "&hellip;": "…",
    "&star;": "★",
};

function decodeEntities(value) {
    return value
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/&[a-z]+;|&#\d+;/gi, (entity) => ENTITIES[entity] ?? entity);
}

function toText(html) {
    return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function taskId(phase, label) {
    return `p${phase}-${createHash("sha1").update(label).digest("hex").slice(0, 10)}`;
}

export function roadmapPath(repoRoot) {
    return path.join(repoRoot, "roadmap.html");
}

export function parseRoadmap(repoRoot) {
    const file = roadmapPath(repoRoot);
    if (!fs.existsSync(file)) return [];
    const html = fs.readFileSync(file, "utf8");

    const headings = new Map();
    const headingRe = /<h2>\s*<span class="phase-num">(\d+)<\/span>([\s\S]*?)<\/h2>/g;
    for (let match; (match = headingRe.exec(html)); ) {
        const inner = match[2];
        const pill = /<span class="pill">([\s\S]*?)<\/span>/.exec(inner);
        headings.set(Number(match[1]), {
            title: toText(inner.replace(/<span class="pill">[\s\S]*?<\/span>/g, "")),
            pill: pill ? toText(pill[1]) : "",
        });
    }

    const phases = [];
    const listRe = /<ul class="tasks"[^>]*data-phase="(\d+)"[^>]*>([\s\S]*?)<\/ul>/g;
    for (let match; (match = listRe.exec(html)); ) {
        const index = Number(match[1]);
        const labelRe = /<label>([\s\S]*?)<\/label>/g;
        const tasks = [];
        for (let label; (label = labelRe.exec(match[2])); ) {
            const text = toText(label[1]);
            if (!text) continue;
            tasks.push({ id: taskId(index, text), label: text, html: label[1].trim() });
        }
        const heading = headings.get(index) ?? { title: `Phase ${index}`, pill: "" };
        phases.push({ index, title: heading.title, pill: heading.pill, tasks });
    }

    return phases.sort((a, b) => a.index - b.index);
}
