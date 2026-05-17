# CLAUDE.md — Sveska

<session-start>

**At session start, read in this order. Do not read this whole file unless making architectural changes.**

1. [`tasks.md`](tasks.md) — current TODO + active ticket
2. [`plan.md`](plan.md) — per-ticket implementation plan
3. [`memory.md`](memory.md) — locked decisions, deployment topology, gotchas
4. This file (CLAUDE.md) — full spec; only re-read if changing architecture

90%+ of needed context lives in the 3 files above. Treat them as authoritative; conversation history beyond the current session is decay.

After every ticket: tick `tasks.md` + update `memory.md` if you learned something durable. Suggest `/compact` when a ticket closes or context > 100k tokens.

</session-start>

> Paste-in spec for Claude Code. Read top-to-bottom before writing code. Build **milestone by milestone, in order**. Do not skip ahead. Each ticket has acceptance criteria — a ticket is done only when criteria pass and a commit is made.

---

## 0. Mission & non-negotiables

**Sveska** = a studio-grade, **local-first, offline-first** notepad PWA at `sveska.studio`. Reference behavior: `notepad.js.org` (Amit Merchant, MIT) — used as the **behavioral spec, not a code fork**. Notepad++ is a Win32 C++ app and is explicitly **out of scope** as a base.

Non-negotiables:

1. **Local-first.** App is fully functional with zero network. No mandatory account. Data lives in IndexedDB.
2. **No secrets in the client.** API keys never ship to the browser. AI calls go through a thin server proxy. (Treat this as a security gate, not a nicety.)
3. **Every project = platform.** Sveska ships with a content/SEO surface, glossary, lead-gen seam, and instrumentation from M0 — not bolted on later.
4. **Canvas behind a seam.** The drawing module sits behind `CanvasProvider`. Implementation = Excalidraw (MIT, vendored). No tldraw, no license exposure.
5. **Performance budget:** TTI < 1.5s on mid mobile, main bundle < 180KB gzip pre-canvas, 60fps typing at 50k chars.

## 1. Stack (locked)

| Concern           | Choice                                                       | Why                                                                  |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Build             | **Vite + React 18 + TypeScript (strict)**                    | Fast, typed, plays clean with Excalidraw/React                       |
| State             | **Zustand**                                                  | Minimal, no boilerplate, easy persistence middleware                 |
| Storage           | **Dexie.js** (IndexedDB)                                     | Multi-note, versions, blobs; localStorage only as legacy-import path |
| PWA               | **vite-plugin-pwa** (Workbox)                                | Generated SW + manifest; no hand-rolled `sw.js`                      |
| Styling           | CSS + tokens (`tokens.css`), light Tailwind optional         | Tokens already defined in brand kit                                  |
| Markdown          | `markdown-it` + `DOMPurify`                                  | Render + sanitize (XSS gate)                                         |
| Editor            | Native `<textarea>` v1 → CodeMirror 6 when MD/slash needs it | Don't over-engineer M1                                               |
| Backend (AI only) | Edge function (Cloudflare Worker **or** Vercel Edge)         | Stateless proxy; no DB server                                        |
| Tests             | Vitest + Testing Library; Playwright for PWA/offline         |                                                                      |
| Deploy            | Static host (Netlify/Cloudflare Pages) + edge fn             | Connector already available                                          |

## 2. Repo structure

```
sveska/
  index.html
  /public        manifest.json, /brand (icons), robots, sitemap
  /src
    /app         router, providers, theme
    /editor      textarea/CM, autosave, focus/typewriter
    /notes       Dexie schema, store, tabs, search, tags, pins
    /markdown    render, preview, export
    /canvas      CanvasProvider seam + Excalidraw impl (vendored, lazy)
    /ai          client → /api/ai proxy; slash commands
    /platform    glossary, content pages, lead-gen, analytics
    /ui          components, command palette, modals
    /lib         debounce, hash-share, diff, fuzzy, file io
  /server        edge function: /api/ai (key stays here)
  /docs          architecture.svg, this file
```

## 3. Architecture principles

- **Store is the source of truth.** UI subscribes; persistence is a Zustand→Dexie middleware (debounced 400ms write, immediate on blur/visibilitychange).
- **CanvasProvider seam:** `interface CanvasProvider { mount(el), load(doc), export(fmt), onChange(cb) }`. **Only impl = Excalidraw (`@excalidraw/excalidraw`, MIT), vendored & pinned, lazy-loaded.** tldraw is dropped. The seam stays purely for future optionality — app code imports the seam, never a vendor directly.
- **AI is a capability, not a coupling:** `aiClient.run(command, context) → POST /api/ai`. Proxy injects the key, enforces rate limit, returns stream. Client degrades gracefully if `/api/ai` 401/unconfigured.
- **Export pipeline is one module** producing txt/md/html/pdf from a single AST so formats stay consistent.

## 4. Data model (Dexie)

```ts
notes:     id, title, body, mode('text'|'md'|'checklist'), tags[], pinned, createdAt, updatedAt, deletedAt
versions:  id, noteId, body, snapshotAt, label?            // local history + named snapshots
canvas:    id, noteId, providerId, doc(blob)               // canvas per note (optional)
tabs:      id, order, noteId, active                        // session restore
prefs:     key, value                                       // single-row settings
inbox:     id, text, capturedAt, processed                  // quick-capture
templates: id, name, body, kind
snippets:  id, trigger, body
```

Soft-delete via `deletedAt`. Migration step: import legacy `localStorage["note"]` → first note, then clear key.

## 5. Security & privacy (gate — do not weaken)

- AI key only in edge function env. Client has **no** key, ever. Reject PRs that add `VITE_*_API_KEY`.
- CSP header: `default-src 'self'`; allow only the AI proxy origin + self. `DOMPurify` on all rendered Markdown/HTML import.
- Hash-share encodes note in URL fragment (`#`) only — never sent to a server. Warn user it's plaintext in the link.
- Optional sync (post-M6) must be E2E-encrypted or not shipped.
- No third-party trackers in the app shell. Analytics = privacy-respecting, self-host or cookieless, behind consent.

## 6. Build milestones & tickets

Legend: ☐ todo · ✅ done. Each milestone ends with: tests green, Lighthouse PWA pass, commit + tag.

### M0 — Scaffold & platform skeleton

- ✅ T0.1 Vite+TS+React+Zustand+Dexie+vite-plugin-pwa boot; tokens.css + brand assets wired; manifest + icons from brand kit.
- ✅ T0.2 Theme: dark default, light, system; persists. (`Ctrl+,` opens prefs shell.)
- ✅ T0.3 App shell + routing; analytics + consent stub; SEO meta + sitemap + `/glossary` route placeholder. **AC:** installable PWA, dark theme, Lighthouse PWA ✓.

### M1 — Core editor (notepad.js.org parity)

- ✅ T1.1 Textarea editor + autosave to Dexie, **debounced 400ms**, immediate on blur/visibility change. Survives refresh.
- ✅ T1.2 Snapshots: save/restore/clear point-in-time copy + dot indicator in toolbar.
- ✅ T1.3 Export `.txt` / `.md` / `.html` (shared export module).
- ✅ T1.4 Statistics modal: words, chars, lines, paragraphs, reading time, unique words.
- ☐ T1.5 Focus mode (`Alt+F`): hide chrome, widen margins.
- ☐ T1.6 Preferences: font size slider, line height, font family (Satoshi/mono/serif/dyslexic), spellcheck, tab-indent, focus margin.
- ✅ T1.7 Shortcuts: `Ctrl+S` save txt, `Alt+C` copy, `Ctrl+Del` clear, `Ctrl+,` prefs, `Alt+F` focus. **AC:** full parity with reference app, offline-capable.

### M2 — Multi-note + persistence depth

- ✅ T2.1 Multi-note tabs (named, switchable) + session restore + "open previous session" toggle.
- ✅ T2.2 Local version history per note + diff compare view.
- ✅ T2.3 Unsaved-draft recovery (crash/refresh safe).
- ☐ T2.4 Tags, pinned notes, saved filters, recent-notes rail, favorites bar.
- ☐ T2.5 Fuzzy search across notes (title+body) + quick-capture inbox. **AC:** 1k notes, search < 50ms.

### M3 — Power UX

- ☐ T3.1 Command palette (`Ctrl+K`) + slash commands in editor.
- ☐ T3.2 Per-note Markdown mode + split/overlay live preview.
- ☐ T3.3 Checklist mode: nested checklists, drag-reorder, filter unchecked.
- ☐ T3.4 Templates (incl. meeting-notes) + snippet manager + prompt library.
- ☐ T3.5 Typewriter mode + typing sounds (from reference repo: key/space/enter, volume).
- ☐ T3.6 Paper textures (dotted/graph/linen/grain, CSS-only), writing timer (Pomodoro + idle auto-pause), word-count goal w/ progress, find & replace.
- ☐ T3.7 Import `.txt`/`.md`; Web Share target; share-via-URL hash; PDF export (jsPDF). **AC:** all features keyboard-reachable, a11y AA.

### M4 — AI layer (secure)

- ☐ T4.1 Edge function `/api/ai`: key in env, rate-limited, streamed. Threat-model documented.
- ☐ T4.2 Slash AI: `/improve`, `/summarize`, `/continue`, `/rewrite`, "Copy as LinkedIn post". Graceful no-key degradation.
- ☐ T4.3 Notes → image (Concise / Detailed visualization render). **AC:** zero key in client bundle (grep gate in CI).

### M5 — Canvas module

- ☐ T5.1 `CanvasProvider` interface + Excalidraw (MIT) impl, canvas-per-note, export to image, offline.
- ☐ T5.2 ~~tldraw adapter~~ **DROPPED.** No tldraw. Excalidraw is the only canvas. Seam retained for optionality, no second adapter built.

### M6 — Platform & monetization (Kinetic Gain doctrine)

- ☐ T6.1 Glossary engine (auto-link terms in notes/exports; standalone SEO `/glossary`).
- ☐ T6.2 Content surface: marketing/landing, changelog, MDX blog; "Export to blog/MDX" from a note.
- ☐ T6.3 Lead-gen funnel: email capture, ad/affiliate placement slots in shell + HTML export footer, CTA system.
- ☐ T6.4 Pricing/upgrade scaffold (free local / Pro sync+AI). Instrumentation → MRR funnel dashboard. **AC:** funnel events firing; pricing page live; path to ROI ≥ $15K/mo documented.

### M7 — Hardening

- ☐ T7.1 Playwright offline + install + restore suite. Perf budget enforced in CI. Error boundary + crash recovery. a11y audit. Security review vs §5.

## 7. Conventions

- TS strict, no `any`. ESLint + Prettier. Conventional Commits. Feature-flag risky work.
- Every module: types + unit tests + a README stub.
- a11y: keyboard-first, focus rings on (amber), `prefers-reduced-motion` honored, contrast AA.
- Perf: lazy-load canvas & AI & PDF. No layout thrash on keystroke.

## 8. Definition of Done (per ticket)

`criteria met` ∧ `tests pass` ∧ `no a11y/console errors` ∧ `bundle within budget` ∧ `committed` ∧ `CLAUDE.md ticket checked`.

## 9. Parking lot / open decisions

| #   | Decision         | Owner      | Notes                                                                                                         |
| --- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | Canvas vendor    | ✅ DECIDED | Excalidraw (MIT), vendored + pinned, lazy-loaded behind CanvasProvider. tldraw dropped — no license exposure. |
| 2   | Edge host        | Miz        | Cloudflare Workers vs Vercel Edge (both connectors viable).                                                   |
| 3   | Sync (post-M6)   | Miz        | Only if E2E-encrypted.                                                                                        |
| 4   | Analytics vendor | Miz        | Cookieless/self-host; consent-gated.                                                                          |

---

_The map. Now build the territory — milestone by milestone._
