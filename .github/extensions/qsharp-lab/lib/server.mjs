// Minimal loopback HTTP plumbing: one server per canvas instance, JSON helpers,
// static file serving, and a tiny Server-Sent Events hub for live updates.

import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
};

export async function startServer(handler) {
    const server = createServer((req, res) => {
        Promise.resolve(handler(req, res)).catch((error) => {
            if (!res.headersSent) sendJson(res, 500, { error: String(error?.message ?? error) });
            else res.end();
        });
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { server, url: `http://127.0.0.1:${port}/` };
}

export function sendJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(payload);
}

export function sendText(res, status, body, contentType = "text/plain; charset=utf-8") {
    res.writeHead(status, { "Content-Type": contentType, "Cache-Control": "no-store" });
    res.end(body);
}

export function sendFile(res, filePath) {
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        sendText(res, 404, "not found");
        return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
}

export async function readJsonBody(req, limit = 1_000_000) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > limit) throw new Error("request body too large");
        chunks.push(chunk);
    }
    if (!chunks.length) return {};
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

// Fan-out hub for SSE subscribers of a single canvas instance.
export class EventHub {
    #clients = new Set();

    subscribe(req, res) {
        res.writeHead(200, {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
        });
        res.write("retry: 1000\n\n");
        this.#clients.add(res);
        req.on("close", () => this.#clients.delete(res));
    }

    broadcast(event, data) {
        const frame = `event: ${event}\ndata: ${JSON.stringify(data ?? {})}\n\n`;
        for (const client of this.#clients) {
            try {
                client.write(frame);
            } catch {
                this.#clients.delete(client);
            }
        }
    }

    close() {
        for (const client of this.#clients) {
            try {
                client.end();
            } catch {
                /* already gone */
            }
        }
        this.#clients.clear();
    }
}
