<!-- tasks.md — durable TODO. UPDATE on every commit. -->
<!-- This file replaces in-session TodoWrite for cross-session continuity. -->

# Tasks · Sveska

> **At session start, read this file first.** It holds the active ticket and the next 3–5 sequential ones. Older / completed work is summarized for context but should not be re-litigated.

## In progress

- [ ] **T1.3 — Export module** (`.txt` / `.md` / `.html` via shared AST)
  - **Files**: `src/markdown/export.ts` (new) · `src/markdown/ast.ts` (new) · `src/editor/Editor.tsx` (add download trio) · `src/__tests__/export.test.tsx` (new)
  - **AC**: one AST → three formats, consistent line endings, HTML wrapped in minimal template with Sveska CSP-safe styles
  - **Don't**: pull markdown-it yet (M3.2). For now: text → `<pre>` HTML + `.md` is the raw text + minimal escape

## Next up (sequential, top-down)

- [ ] T1.4 — Statistics modal (words/chars/lines/paragraphs/reading time/unique)
- [ ] T1.5 — Focus mode (`Alt+F`, hide chrome, widen margins to 880px column)
- [ ] T1.6 — Preferences (font size slider, line height, family, spellcheck, tab-indent, focus margin)
- [ ] T1.7 — Shortcuts (`Ctrl+S` save txt, `Alt+C` copy, `Ctrl+Del` clear, `Ctrl+,` prefs already, `Alt+F` focus)
- [ ] **M1 close** — Lighthouse PWA pass on `sveska.studio`, tag `v0.1.0-m1`, write release notes

## Recently done (this branch only)

- ✅ **M0 ship** — 5 commits, tagged `v0.0.1-m0`, deployed to `sveska.studio`
- ✅ T1.1 — Editor + Dexie autosave (debounced 400ms + blur/visibility flush + refresh-safe)
- ✅ T1.2 — Snapshots save/restore/clear + pending dot indicator
- ✅ Domain — `sveska.studio` canonical + 4 alias 301 redirects, CI/CD wired
- ✅ Design package absorbed — Claude Code Design files in `docs/design-mocks/` + `docs/landing/`

## After M1

- [ ] **M2** — Multi-note tabs · version history diff · unsaved-draft recovery · tags/pins · fuzzy search + inbox
- [ ] **M3** — Command palette · Markdown mode · checklists · templates · typewriter/sounds · paper textures · find&replace · import · share-target · PDF
- [ ] **M4** — Edge function `/api/ai` · slash AI · Notes → image
- [ ] **M5** — Canvas (Excalidraw vendored)
- [ ] **M6** — Glossary engine · content surface · lead-gen · pricing
- [ ] **M7** — Hardening (Playwright offline · perf budget CI · a11y audit · security review)

## Cross-cutting (any milestone)

- [ ] Bind Hostinger DNS token from `~/ftpkred.txt` to a GH Secret + CI step so DNS changes can be PR'd
- [ ] Add `npm test` + `pnpm lint` to PR-required checks once main is branch-protected
- [ ] Lighthouse PWA report on `sveska.studio` — verify ≥90 in PWA category
- [ ] Wire `landing.html` → real `/marketing` (or apex when M6 lands)
