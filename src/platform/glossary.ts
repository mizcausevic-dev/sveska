/**
 * Glossary data + auto-link helper (M6.T6.1).
 *
 * A curated set of terms used across Sveska — surfaced both on the
 * `/glossary` SEO page and as inline links inside rendered Markdown
 * exports. The auto-linker walks the HTML AST (via DOMParser) and only
 * wraps the FIRST occurrence of each term per document, skipping any
 * match inside an existing `<a>` or `<code>` block.
 *
 * Each term has:
 *   - `id`     — anchor slug ('#local-first')
 *   - `term`   — display label
 *   - `aliases?` — other strings that should auto-link to the same entry
 *   - `summary` — one-sentence gloss for the term card + tooltip
 *   - `body`   — longer body (Markdown-flavored plaintext) for the page
 */

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases?: string[];
  summary: string;
  body: string;
  group: 'concept' | 'tech' | 'brand' | 'milestone';
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'local-first',
    term: 'Local-first',
    aliases: ['local first'],
    summary:
      'A software design stance where data lives on the device and works offline; sync, if it exists, is collaborative not authoritative.',
    body: 'Coined by Ink & Switch in 2019. Sveska adopts the seven local-first principles: no spinners, multi-device, network-optional, longevity, privacy, user control, and "the long now" — the app should outlive the company that built it.',
    group: 'concept',
  },
  {
    id: 'pwa',
    term: 'PWA',
    aliases: ['Progressive Web App', 'progressive web app'],
    summary:
      'A web app installable to the home screen, runnable offline via a service worker, and indistinguishable from native at the OS level.',
    body: 'Sveska ships as a PWA via vite-plugin-pwa (Workbox). The manifest at /public/brand/manifest.json declares icons, share-target, and shortcuts; the generated service worker precaches the shell and serves it offline.',
    group: 'concept',
  },
  {
    id: 'snapshot',
    term: 'Snapshot',
    aliases: ['snapshots'],
    summary:
      'A point-in-time copy of a note body, stored locally and restorable from the History modal.',
    body: 'Snapshots are immutable rows in the Dexie `versions` table. The toolbar Save button creates one; the History modal shows a side-by-side LCS diff between any snapshot and the live body and lets you restore.',
    group: 'concept',
  },
  {
    id: 'inbox',
    term: 'Inbox',
    summary:
      "A single-line quick-capture surface for thoughts that don't belong in any open note yet.",
    body: 'Opened with Ctrl+Shift+K or the rail button. Each entry is a row in the `inbox` table with a `processed` flag. The Web Share Target route also writes here so shares from other apps land in the same bucket. Promote any row to a fresh note in one click.',
    group: 'concept',
  },
  {
    id: 'command-palette',
    term: 'Command palette',
    aliases: ['palette'],
    summary: 'A fuzzy launcher for every action in the app, opened with Ctrl+K.',
    body: "Sveska's palette is backed by a static catalog in src/ui/commandCatalog.ts. Every modal opener, editor command, mode toggle, and AI flow is one entry. The same catalog drives the inline slash-command popover when the editor cursor sits on a /-line.",
    group: 'concept',
  },
  {
    id: 'slash-command',
    term: 'Slash command',
    aliases: ['slash commands'],
    summary:
      'A command triggered by typing `/foo` at the start of an editor line; runs immediately and replaces the slash text on Enter.',
    body: 'Detection is in src/editor/slashContext.ts (pure). The popover shares the command-palette catalog so any new command shows up in both surfaces at once. AI commands (e.g. /improve, /summarize) are grouped under "ai".',
    group: 'concept',
  },
  {
    id: 'autosave',
    term: 'Autosave',
    summary:
      'Debounced 400 ms write of the textarea body to Dexie, with an immediate flush on tab blur or visibility-hidden.',
    body: 'Lives in src/editor/useAutosave.ts. The same hook writes a crash-safe "shadow" draft on every keystroke (no debounce); on reboot, if the shadow is newer than the saved note body, the recovery banner offers Keep / Discard.',
    group: 'concept',
  },
  {
    id: 'canvasprovider',
    term: 'CanvasProvider',
    aliases: ['Canvas provider'],
    summary:
      'The seam (interface) that decouples Sveska from the canvas vendor; app code never imports a vendor directly.',
    body: 'Defined in src/canvas/CanvasProvider.ts. The only implementation is Excalidraw (lazy-loaded). The seam was reserved at M0 and built against at M5; future implementations could plug in without touching the rest of the app.',
    group: 'concept',
  },
  {
    id: 'excalidraw',
    term: 'Excalidraw',
    summary:
      'MIT-licensed open-source whiteboard library, the only canvas vendor wired in behind the CanvasProvider seam.',
    body: 'Vendored via @excalidraw/excalidraw, lazy-loaded so the 2.6 MB vendor chunk (mermaid, mathjax, prismjs, roughjs, fonts) only arrives on first canvas open. tldraw was permanently dropped (license).',
    group: 'tech',
  },
  {
    id: 'dexie',
    term: 'Dexie',
    summary: "A typed wrapper around IndexedDB; Sveska's only persistence layer.",
    body: 'Eight tables: notes, versions, canvas, tabs, prefs, inbox, templates, snippets. localStorage is read-only and used solely to import legacy notepad.js.org notes on first boot.',
    group: 'tech',
  },
  {
    id: 'zustand',
    term: 'Zustand',
    summary:
      'A minimal React state library; every modal + tab + theme + AI-run flow goes through a small Zustand store.',
    body: "Every store has a corresponding reset line in src/test-setup.ts — stores survive Testing Library's cleanup() and would otherwise leak between tests.",
    group: 'tech',
  },
  {
    id: 'dompurify',
    term: 'DOMPurify',
    summary: 'HTML sanitizer; every Markdown render passes through it before reaching the DOM.',
    body: 'Configured in src/markdown/render.ts to reject `<script>`, `<iframe>`, inline event handlers, and javascript: URLs. The XSS gate is unit-tested + verified in the live preview each ship.',
    group: 'tech',
  },
  {
    id: 'markdown-it',
    term: 'markdown-it',
    summary: 'The Markdown parser Sveska uses (CommonMark + GFM-flavored).',
    body: "Configured with html:false so authors can't bypass DOMPurify by writing literal HTML. Linkify on, typographer on, line-breaks on.",
    group: 'tech',
  },
  {
    id: 'anthropic',
    term: 'Anthropic',
    summary: "Maker of Claude; the LLM Sveska's AI flows hit through the edge proxy.",
    body: 'The key lives in a Netlify env secret, never in the client bundle. A CI gate (check-no-keys.mjs) scans every build for key-shaped strings — see src/ai/README.md for the setup command.',
    group: 'tech',
  },
  {
    id: 'netlify-edge',
    term: 'Netlify Edge Functions',
    aliases: ['Netlify Edge', 'edge function'],
    summary:
      "Deno-runtime functions that run at Netlify's CDN edge; Sveska's AI proxy at /api/ai is one.",
    body: "Picked over Cloudflare Workers and Vercel Edge because it keeps the API same-origin (CSP default-src 'self' stays clean) and reuses the existing deploy pipeline. Decision recorded in CLAUDE.md §9.",
    group: 'tech',
  },
  {
    id: 'csp',
    term: 'CSP',
    aliases: ['Content Security Policy'],
    summary:
      "A browser header that whitelists which origins the page can fetch from; Sveska sets default-src 'self'.",
    body: 'Declared as both an HTML meta tag (runtime) and a Netlify response header (defence in depth). The strict policy is part of why the AI proxy had to be same-origin.',
    group: 'tech',
  },
  {
    id: 'lcs-diff',
    term: 'LCS diff',
    aliases: ['line diff'],
    summary:
      'Longest-Common-Subsequence-based line-by-line diff; powers the side-by-side view in the version-history modal.',
    body: 'Pure helper at src/lib/diff.ts — no external dep. Hunt-McIlroy classic build then backtrack. Output is row-aligned (eq, del, add, gap) for a 2-column CSS grid renderer.',
    group: 'tech',
  },
  {
    id: 'og-card',
    term: 'OG card',
    aliases: ['open graph card'],
    summary: 'A 1200×630 image generated for social-media link previews.',
    body: 'Sveska\'s "Notes → image" command asks the AI for a structured JSON spec (title + bullets or sections + accent color) and renders it locally on a canvas — no image-generation model in the loop.',
    group: 'tech',
  },
  {
    id: 'sarajevo-night',
    term: 'Sarajevo night',
    summary:
      'The brand vibe: deep near-black background with amber accents and inked-paper light mode.',
    body: 'Tokens live in /public/brand/tokens.css. Dark default is bg #0c0c0e + text #f4efe6 + accent #f2b544; light is the inverse on inked-paper cream.',
    group: 'brand',
  },
  {
    id: 'notepad-js-org',
    term: 'notepad.js.org',
    summary:
      "Amit Merchant's MIT-licensed reference notepad PWA; Sveska's behavioral spec, not a code fork.",
    body: 'Sveska re-implements the notepad.js.org feature set as a typed, modular PWA with a platform surface (glossary, lead-gen, pricing) from day one — and then extends past it (multi-note, AI, canvas).',
    group: 'brand',
  },
];

const SLASH_NORMALIZE = /[^a-z0-9]+/g;

/**
 * Auto-link the first occurrence of each glossary term within an HTML
 * fragment, skipping matches inside `<a>` and `<code>`/`<pre>`. Returns
 * the transformed HTML.
 *
 * Used by the .html export pipeline for md-mode notes so exported pages
 * carry inline glossary links back to /glossary#<id>. Live preview leaves
 * the body alone (no inline links) — autolinking is an export concern.
 */
export function autoLinkGlossary(html: string, baseUrl = 'https://sveska.studio'): string {
  if (typeof DOMParser === 'undefined' || !html) return html;
  const doc = new DOMParser().parseFromString(`<root>${html}</root>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return html;

  const used = new Set<string>();

  // Pre-build a sorted index: longest term first so "Service Worker" beats
  // "Service" if both ever overlap.
  const candidates = GLOSSARY.flatMap((e) => {
    const labels = [e.term, ...(e.aliases ?? [])];
    return labels.map((label) => ({ entry: e, label }));
  }).sort((a, b) => b.label.length - a.label.length);

  walk(root, (textNode) => {
    if (textNode.parentElement && shouldSkip(textNode.parentElement)) return;
    const text = textNode.nodeValue ?? '';
    for (const { entry, label } of candidates) {
      if (used.has(entry.id)) continue;
      const re = new RegExp(`\\b${escapeRegex(label)}\\b`, 'i');
      const m = re.exec(text);
      if (!m) continue;
      used.add(entry.id);

      const before = doc.createTextNode(text.slice(0, m.index));
      const link = doc.createElement('a');
      link.href = `${baseUrl}/glossary#${entry.id}`;
      link.title = entry.summary;
      link.className = 'glossary-link';
      link.textContent = m[0];
      const after = doc.createTextNode(text.slice(m.index + m[0].length));

      const parent = textNode.parentNode;
      if (!parent) break;
      parent.insertBefore(before, textNode);
      parent.insertBefore(link, textNode);
      parent.insertBefore(after, textNode);
      parent.removeChild(textNode);
      break; // each text node yields at most one new link per pass
    }
  });

  return root.innerHTML;
}

function shouldSkip(el: HTMLElement): boolean {
  let cur: HTMLElement | null = el;
  while (cur) {
    const tag = cur.tagName?.toLowerCase();
    if (tag === 'a' || tag === 'code' || tag === 'pre') return true;
    cur = cur.parentElement;
  }
  return false;
}

function walk(node: Node, fn: (text: Text) => void): void {
  const queue: Node[] = [node];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (!cur) continue;
    for (const child of Array.from(cur.childNodes)) {
      if (child.nodeType === 3) {
        fn(child as Text);
      } else {
        queue.push(child);
      }
    }
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function groupedGlossary(): Record<GlossaryEntry['group'], GlossaryEntry[]> {
  const out: Record<GlossaryEntry['group'], GlossaryEntry[]> = {
    concept: [],
    tech: [],
    brand: [],
    milestone: [],
  };
  for (const e of GLOSSARY) out[e.group].push(e);
  for (const k of Object.keys(out) as Array<GlossaryEntry['group']>) {
    out[k].sort((a, b) => a.term.localeCompare(b.term));
  }
  return out;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(SLASH_NORMALIZE, '-')
    .replace(/^-+|-+$/g, '');
}
