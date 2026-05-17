import { type NoteAST } from './ast';
import { renderMd } from './render';
import { autoLinkGlossary } from '@/platform/glossary';

/**
 * One AST → three formats. Adding a format = one switch arm + one extension
 * mapping. PDF (jsPDF) lands at M3.7 with its own arm; markdown-it transforms
 * the .html arm at M3.2.
 */
export type ExportFormat = 'txt' | 'md' | 'html';

const MIME: Record<ExportFormat, string> = {
  txt: 'text/plain;charset=utf-8',
  md: 'text/markdown;charset=utf-8',
  html: 'text/html;charset=utf-8',
};

const EXT: Record<ExportFormat, string> = {
  txt: 'txt',
  md: 'md',
  html: 'html',
};

export interface ExportResult {
  blob: Blob;
  filename: string;
  mime: string;
}

export function exportAs(ast: NoteAST, format: ExportFormat): ExportResult {
  const body = bodyFor(ast, format);
  const blob = new Blob([body], { type: MIME[format] });
  return { blob, filename: filenameFor(ast, format), mime: MIME[format] };
}

function bodyFor(ast: NoteAST, format: ExportFormat): string {
  // CRLF in line endings is a Windows-Notepad legacy. We always emit LF for
  // round-trippable text; consumers that need CRLF can convert downstream.
  const normalized = ast.body.replace(/\r\n/g, '\n');
  switch (format) {
    case 'txt':
      return normalized;
    case 'md':
      // Markdown export is the raw source — downstream tools render it.
      return normalized;
    case 'html':
      // For md-mode notes we render markdown into the export. Text-mode notes
      // still use the <pre> path so whitespace + monospace are preserved.
      if (ast.mode === 'md') {
        // T6.1 — auto-link glossary terms inline (first occurrence per term,
        // skipping code/anchor blocks). The function is a no-op in non-DOM
        // environments, so this is safe for any caller.
        const linked = autoLinkGlossary(renderMd(normalized));
        return htmlTemplate(ast, linked, { prose: true });
      }
      return htmlTemplate(ast, escapeHtml(normalized), { prose: false });
  }
}

export function filenameFor(ast: NoteAST, format: ExportFormat): string {
  const slug = slugify(ast.title) || 'sveska-note';
  const stamp = isoStampForFilename(new Date(ast.exportedAt));
  return `${slug}-${stamp}.${EXT[format]}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics so "Najbolji početak" → "najbolji-pocetak"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function isoStampForFilename(d: Date): string {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(
    d.getHours(),
  )}${pad(d.getMinutes())}`;
}

/**
 * Trigger a save dialog in the browser. Uses an ephemeral anchor so we don't
 * leak DOM. createObjectURL → click → revokeObjectURL on next tick.
 */
export function download(result: ExportResult): void {
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// ─────────────────────────────────────────────────────────────────
// HTML template — inlined so the export module is self-contained.
// Subset of tokens.css only: enough to render the note legibly without
// pulling in app chrome. CSP-safe (no external requests).
// ─────────────────────────────────────────────────────────────────
function htmlTemplate(ast: NoteAST, bodyHtml: string, opts: { prose: boolean }): string {
  const safeTitle = escapeHtml(ast.title || 'Untitled');
  const exported = new Date(ast.exportedAt).toISOString();
  const updated = new Date(ast.updatedAt).toISOString();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle} — Sveska</title>
<meta name="generator" content="Sveska / sveska.studio">
<meta name="description" content="Note exported from Sveska on ${exported}.">
<style>
  :root {
    --bg: #f4efe6;
    --text: #15110a;
    --text-dim: #6b6457;
    --border: #e2dcce;
    --accent: #c9871f;
    --paper: #fbf8f1;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0c0c0e;
      --text: #f4efe6;
      --text-dim: #b8b2a6;
      --border: #222228;
      --accent: #f2b544;
      --paper: #161619;
    }
  }
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: "Satoshi", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  main {
    max-width: 72ch;
    margin: 0 auto;
    padding: 64px 32px 96px;
  }
  header {
    margin: 0 0 32px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--border);
  }
  h1 {
    margin: 0 0 6px;
    font-family: "Bricolage Grotesque", ui-serif, Georgia, serif;
    font-weight: 700;
    font-size: clamp(28px, 4vw, 40px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .meta {
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-dim);
  }
  .meta a { color: var(--accent); text-decoration: none; }
  .meta a:hover { text-decoration: underline; }
  pre.note {
    margin: 0;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 22px 24px;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 16px;
    line-height: 1.7;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .prose { font-size: 16px; line-height: 1.7; color: var(--text); }
  .prose h1, .prose h2, .prose h3 { font-family: "Bricolage Grotesque", ui-serif, Georgia, serif; line-height: 1.2; margin: 1.6em 0 0.4em; }
  .prose h1 { font-size: 1.8em; }
  .prose h2 { font-size: 1.4em; }
  .prose h3 { font-size: 1.15em; }
  .prose p { margin: 0 0 1em; }
  .prose code { background: var(--paper); border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px; font-family: ui-monospace, monospace; font-size: 0.95em; }
  .prose pre { background: var(--paper); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; overflow-x: auto; }
  .prose pre code { border: 0; padding: 0; background: transparent; }
  .prose a { color: var(--accent); }
  .prose blockquote { border-left: 3px solid var(--border); margin: 1em 0; padding: 0.2em 1em; color: var(--text-dim); }
  .prose table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  .prose th, .prose td { border: 1px solid var(--border); padding: 6px 10px; text-align: left; }
  .prose ul, .prose ol { padding-left: 1.4em; margin: 0 0 1em; }
  .prose hr { border: 0; border-top: 1px solid var(--border); margin: 1.5em 0; }
  footer {
    margin-top: 48px;
    padding-top: 18px;
    border-top: 1px solid var(--border);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-dim);
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  @media print {
    body { background: #fff; color: #000; }
    pre.note { background: #fff; border: 0; padding: 0; }
    footer { border-top: 1px solid #ccc; }
  }
</style>
</head>
<body>
<main>
  <header>
    <h1>${safeTitle}</h1>
    <p class="meta">Updated ${updated} · Exported ${exported} · <a href="https://sveska.studio">sveska.studio</a></p>
  </header>
  ${opts.prose ? `<div class="prose">${bodyHtml}</div>` : `<pre class="note">${bodyHtml}</pre>`}
  <footer>
    <span>Sveska · local-first · studio-grade</span>
    <span><a href="https://sveska.studio/blog?utm_source=html-export">subscribe</a> · <a href="https://sveska.studio?utm_source=html-export">made with sveska.studio</a></span>
    <span>Prazna sveska. Najbolji početak.</span>
  </footer>
</main>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
