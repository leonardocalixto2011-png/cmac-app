/**
 * Tiny, safe Markdown → HTML for newsletter bodies (email-client friendly,
 * inline styles). Input is escaped first; only a small subset is supported:
 * # / ## / ### headings, paragraphs, blank-line separation, "- " lists,
 * **bold**, *italic*, [text](https://link). Links must be http(s) or mailto.
 */
const S = {
  p: "margin:0 0 14px;font-size:15px;line-height:1.65;color:#3B423F;",
  h: "margin:22px 0 10px;font-family:Georgia,serif;color:#1F2422;line-height:1.2;",
  a: "color:#C97B63;text-decoration:underline;",
  li: "margin:0 0 6px;font-size:15px;line-height:1.6;color:#3B423F;",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inline(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g, (_, text, url) => `<a href="${url}" style="${S.a}">${text}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

export function markdownToHtml(md: string): string {
  const blocks = escapeHtml(md.replace(/\r\n/g, "\n")).split(/\n{2,}/);
  return blocks
    .map((raw) => {
      const block = raw.trim();
      if (!block) return "";
      const h = /^(#{1,3})\s+(.+)$/.exec(block);
      if (h && !block.includes("\n")) {
        const size = h[1].length === 1 ? 26 : h[1].length === 2 ? 21 : 18;
        return `<h${h[1].length + 1} style="${S.h}font-size:${size}px;">${inline(h[2])}</h${h[1].length + 1}>`;
      }
      const lines = block.split("\n");
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        return `<ul style="margin:0 0 14px;padding-left:20px;">${lines
          .map((l) => `<li style="${S.li}">${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`)
          .join("")}</ul>`;
      }
      return `<p style="${S.p}">${lines.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}

/** Plain-text version of the same Markdown (for the text/plain part). */
export function markdownToText(md: string): string {
  return md
    .replace(/\r\n/g, "\n")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1$2")
    .replace(/^#{1,3}\s+/gm, "")
    .trim();
}
