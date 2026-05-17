<!-- plan.md — phased ticket plan. Edit when scope changes; otherwise treat as immutable. -->

# Plan · Sveska M1+

> **Pair this with `tasks.md`.** `tasks.md` says what's next; this file says how to implement each ticket. New sessions: read the in-progress entry here in full before writing code.

## Workflow (every ticket)

1. **Read** `tasks.md` (current) + this file's section for the in-progress ticket + `memory.md` (decisions/gotchas).
2. **Plan** — list files to touch + AC interpretation in 3 bullets (in chat, not code).
3. **Implement** — match the existing module shape; reuse `src/lib/*` helpers where possible.
4. **Test** — Vitest unit + integration, mirror existing test patterns (real timers, IDB-reset-per-case).
5. **Verify** — `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green.
6. **Browser-verify** — start `sveska-preview`, exercise the new feature, snapshot at minimum.
7. **Commit** — `feat(area): description (Tx.y)` body covers files/AC/test count/bundle size.
8. **Update** `tasks.md` (tick + add follow-ups) + tick the box in `CLAUDE.md`.
9. **Push** — CI auto-deploys to `sveska.studio`.
10. **Suggest `/compact`** if conversation > 100k tokens or a milestone closes.

## M1 — Core editor (notepad.js.org parity)

### T1.3 — Export `.txt` / `.md` / `.html` (shared AST)

**Goal**: one click anywhere produces the current note as a downloadable file in three formats. Single source-of-truth AST so future formats (PDF M3.7) don't drift.

**Files**:

- `src/markdown/ast.ts` — `NoteAST = { title, body, mode, snapshotAt? }`. Builder function `astFromNote(note)`.
- `src/markdown/export.ts` — `exportAs(ast, format: 'txt'|'md'|'html'): Blob`. Helper `download(blob, filename)` using `URL.createObjectURL`.
- `src/markdown/template.html.ts` — minimal HTML wrapper (uses inline `<style>` only, no external requests — CSP-safe).
- `src/editor/ExportMenu.tsx` — three buttons in the snapshot toolbar row (or new "actions" row).
- `src/__tests__/export.test.tsx` — Blob content per format + filename sanitization.

**AC**:

- txt = `body` exactly, LF endings, UTF-8 BOM optional (none for now)
- md = txt + filename `.md` (markdown-it formatting comes at M3.2)
- html = full HTML doc, `<title>` = note title or "Untitled", body in `<pre>` with `white-space: pre-wrap`, tokens.css inlined (small subset — bg, text, font)
- Filename = `{slugified title or 'sveska-note'}-{YYYY-MM-DD-HHmm}.{ext}`
- Empty body still exports (just empty file)
- No console errors

**Don't**:

- Don't import markdown-it / DOMPurify yet (M3 + M3.2)
- Don't add jsPDF (M3.7)
- Don't bundle the template HTML separately — keep it inline so the export module is one file

### T1.4 — Statistics modal

**Goal**: `Cmd/Ctrl+Shift+I` or button opens a modal showing words / chars / lines / paragraphs / reading time / unique words.

**Files**:

- `src/lib/stats.ts` — pure functions, all stats computed from a string
- `src/editor/StatsModal.tsx` — opens via the existing `<Modal>` primitive
- `src/__tests__/stats.test.tsx`

**AC**:

- Pure: `computeStats(body) = { words, chars, charsNoSpaces, lines, paragraphs, readingMinutes, uniqueWords }`
- Reading time = `Math.ceil(words / 230)` (avg reading speed)
- Modal is keyboard-reachable, Esc closes, amber focus ring, mono numerals
- Stats update live as body changes (useState + useMemo)

### T1.5 — Focus mode

**Goal**: `Alt+F` toggles focus mode — header/sidebar/snapshot-toolbar/status-bar hide; editor widens to 880px centered column; persists in Dexie prefs.

**Files**:

- `src/notes/themeStore.ts` extend with `focusMode: boolean` (or new `uiStore.ts`)
- `src/app/Layout.tsx` accept `focus` class
- `src/app/KeyBindings.tsx` add `Alt+F` handler
- `src/editor/Editor.tsx` accept `focus` prop, swap toolbar/save-indicator visibility
- CSS: `.app-shell--focus` rule hides everything but `.app-main`

**AC**:

- `Alt+F` toggles, persists across reload
- Focus mode hides: nav, theme switch, snapshot toolbar, save indicator, footer/consent
- Editor centered, max-width 880px, padding-top 64px
- Esc exits focus mode (per `<Modal>` pattern? or just `Alt+F` again?) — pick Alt+F again, document in cheatsheet

### T1.6 — Preferences

**Goal**: real preferences UI in the existing modal — font size, line height, font family (Satoshi/mono/serif/dyslexic), spellcheck on/off, tab inserts tab vs spaces (size), focus margin.

**Files**:

- `src/notes/prefs.ts` extend with typed pref schema
- `src/ui/PrefsModal.tsx` replace M0 stubs with controls
- `src/editor/Editor.tsx` apply prefs via inline style
- Pref persistence via `prefs` Dexie table (already wired for theme)
- `src/__tests__/prefs.test.tsx` — at least one round-trip per pref

**AC**:

- All prefs persist across reload
- Defaults match BRAND.md (editor 17px/1.7 mono)
- Font family includes OpenDyslexic option (need to vendor — flag in commit)
- Tab key inserts `\t` (size pref ignored for `\t`; sets visual `tab-size` CSS for spaces mode)

### T1.7 — Shortcuts

**Goal**: bind the M1 shortcut set in `KeyBindings.tsx`, surface them in a help dialog.

**Bindings**:

- `Ctrl+S` → trigger `.txt` export (T1.3)
- `Alt+C` → copy whole body to clipboard
- `Ctrl+Del` → clear body (with confirm modal, since destructive)
- `Ctrl+,` → open prefs (already wired)
- `Alt+F` → focus mode (already wired at T1.5)
- `Ctrl+?` (or `Shift+/`) → open `docs/design-mocks/keyboard-cheatsheet.html`-style overlay

**Files**: `src/app/KeyBindings.tsx`, `src/ui/ShortcutsModal.tsx` (new), `src/__tests__/shortcuts.test.tsx`

**AC**: All shortcuts work on Win + Mac + Linux. Help overlay reflects current bindings. No conflicts with browser-native shortcuts (Ctrl+S handled but app's variant wins; `e.preventDefault()`).

## After M1 — pointers

- **M2 (multi-note)**: tabs need URL state (`?note=<id>`). Multi-note autosave reuses T1.1's per-noteId debouncer (already keyed correctly).
- **M3 (power UX)**: CodeMirror 6 lands here for slash commands. Replace the textarea with a CM6 instance behind the same `Editor` API.
- **M4 (AI)**: pick the edge host first (parking lot §9 row 2). Cloudflare Workers + their Wrangler dev story is simpler; Vercel Edge if we already use Vercel. Neither needs the user to pick today.
- **M6 (platform)**: `docs/landing/landing.html` already exists — wire it into `/marketing` (or apex) when M6.2 kicks off.

## Quality gates (every commit)

- typecheck: `tsc -b` exits 0
- lint: `eslint . --max-warnings 0` exits 0
- tests: all pass (don't drop coverage; 17+ as of T1.2)
- build: `pnpm build` (runs key-leak + bundle-budget gates)
- bundle: JS gzip < 180 KB (pre-canvas/AI)
- CI: GH Action green on push to main
