# Changelog

Per-milestone snapshots of what shipped. Each entry links to the matching GitHub release for the full release notes.

## v0.8.0 — Rich editor + image paste

Paste or drag-drop a screenshot straight into a note — it's stored locally in IndexedDB and renders inline. The editor moved to CodeMirror 6 (now the default): inline images, Markdown syntax highlighting, slash commands, snippet expansion, find/replace, and typewriter mode all on one surface. The classic textarea remains a one-toggle opt-out. HTML export embeds pasted images as self-contained data URIs.

## v0.7.0-m7 — Hardening

Top-level error boundary with a crash-recovery screen, accessibility sweep (axe-clean across the app shell, glossary, and pricing), an on-demand Playwright smoke suite (offline + install + key routes), a security review against the project's privacy gate, and the perf budget enforced in CI.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.7.0-m7)

## v0.6.0-m6 — Platform & monetization

Glossary engine that auto-links terms in notes and exports (plus a standalone `/glossary`), a content surface (Markdown blog + changelog, note → MDX export), a lead-gen funnel (email capture, CTA slots), and a pricing scaffold with an internal MRR dashboard.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.6.0-m6)

## v0.5.0-m5 — Canvas

Excalidraw, vendored and lazy-loaded behind the `CanvasProvider` seam. Canvas-per-note saved to Dexie, ✎ toggle in the TagsBar, PNG export from the palette. The 2.6 MB vendor chunk only loads when the canvas opens.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.5.0-m5)

## v0.4.0-m4 — AI layer (secure)

Edge function `/api/ai` on Netlify (Deno) — streaming Anthropic proxy with per-IP token bucket, schema gate, same-origin guard. Slash AI commands (`/improve`, `/summarize`, `/continue`, `/rewrite`, "Copy as LinkedIn post"). Notes → image rendered locally on a 1200×630 canvas.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.4.0-m4)

## v0.3.0-m3 — Power UX

`Ctrl+K` command palette + inline slash commands. Per-note Markdown mode with split live preview (DOMPurify XSS gate). Checklist mode with drag-reorder. Templates + snippet typeahead. Typewriter mode + WebAudio typing clicks. Paper textures + writing timer + word goal + `Ctrl+F` find/replace. Import .txt/.md + Web Share Target + share-via-URL hash + lazy PDF export.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.3.0-m3)

## v0.2.0-m2 — Multi-note + persistence depth

Multi-note tabs with session restore. Per-note version history with side-by-side LCS diff. Crash-safe draft shadow. Tags + pins + NotesRail with filters. Fuzzy search across notes (1k notes < 50ms). Inbox quick-capture.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.2.0-m2)

## v0.1.0-m1 — Core editor (notepad.js.org parity)

Native textarea editor. Autosave (400 ms debounce + flush on blur). Snapshots. Export `.txt` / `.md` / `.html`. Statistics modal. Focus mode. Editor preferences. Full M1 keyboard shortcut set.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.1.0-m1)

## v0.0.1-m0 — Scaffold + platform skeleton

Vite + React 18 + TS strict + Zustand + Dexie + vite-plugin-pwa. Dark theme default. Routing + analytics consent stub + SEO meta + sitemap + `/glossary` route placeholder. Installable PWA.

[Release notes](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.0.1-m0)
