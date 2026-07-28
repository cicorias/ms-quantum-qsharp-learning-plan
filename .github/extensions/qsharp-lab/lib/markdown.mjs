// Deliberately tiny Markdown renderer — enough for this repo's READMEs and
// CURRICULUM.md without pulling in a dependency (extensions get no node_modules).

function escapeHtml(value) {
    return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function inline(text) {
    return escapeHtml(text)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" />')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

export function renderMarkdown(source) {
    const lines = source.split("\n");
    const out = [];
    let inCode = false;
    let listType = null;
    let paragraph = [];

    const flushParagraph = () => {
        if (paragraph.length) {
            out.push(`<p>${inline(paragraph.join(" "))}</p>`);
            paragraph = [];
        }
    };
    const closeList = () => {
        if (listType) {
            out.push(`</${listType}>`);
            listType = null;
        }
    };

    for (const raw of lines) {
        const line = raw.replace(/\s+$/, "");

        if (/^```/.test(line)) {
            flushParagraph();
            closeList();
            out.push(inCode ? "</code></pre>" : "<pre><code>");
            inCode = !inCode;
            continue;
        }
        if (inCode) {
            out.push(escapeHtml(raw));
            continue;
        }
        if (!line.trim()) {
            flushParagraph();
            closeList();
            continue;
        }

        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
            flushParagraph();
            closeList();
            out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
            continue;
        }
        if (/^(---|\*\*\*|___)\s*$/.test(line)) {
            flushParagraph();
            closeList();
            out.push("<hr />");
            continue;
        }
        const quote = /^>\s?(.*)$/.exec(line);
        if (quote) {
            flushParagraph();
            closeList();
            out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
            continue;
        }

        const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
        const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
        if (bullet || ordered) {
            flushParagraph();
            const wanted = bullet ? "ul" : "ol";
            if (listType !== wanted) {
                closeList();
                out.push(`<${wanted}>`);
                listType = wanted;
            }
            out.push(`<li>${inline((bullet ?? ordered)[1])}</li>`);
            continue;
        }

        paragraph.push(line.trim());
    }

    flushParagraph();
    closeList();
    if (inCode) out.push("</code></pre>");
    return out.join("\n");
}
