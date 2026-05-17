<!-- tasks.md — durable TODO. UPDATE on every commit. -->
<!-- This file replaces in-session TodoWrite for cross-session continuity. -->

# Tasks · Sveska

> **At session start, read this file first.** It holds the active ticket and the next 3–5 sequential ones. Older / completed work is summarized for context but should not be re-litigated.

## In progress

- [ ] **T2.3 — Unsaved-draft recovery (crash/refresh safe)**
  - **Why**: autosave is debounced 400ms so a crash / hard refresh during the window loses keystrokes. Recovery = a tiny crash-safe shadow in IndexedDB written synchronously on every input, replayed on next boot if newer than the saved note body.
  - **AC**: typing → close tab → reopen → unsaved tail is restored to the textarea with a non-blocking "recovered draft" toast offering Keep / Discard.
  - **Don't**: build a separate Dexie table — store the shadow in `prefs` (key = `draft.<noteId>`) so it shares the existing connection + cleanup path.

## Next up (sequential, top-down)

- [ ] T2.4 — Tags, pinned notes, saved filters, recent-notes rail, favorites bar
- [ ] T2.5 — Fuzzy search across notes (title + body) + quick-capture inbox · **AC**: 1k notes, search < 50ms
- [ ] **M2 close** — tag `v0.2.0-m2`, release notes

## Recently done (this branch only)

- ✅ **M0 ship** — 5 commits, tagged `v0.0.1-m0`, deployed to `sveska.studio`
- ✅ T1.1 — Editor + Dexie autosave (debounced 400ms + blur/visibility flush + refresh-safe)
- ✅ T1.2 — Snapshots save/restore/clear + pending dot indicator
- ✅ T1.3 — Export `.txt` / `.md` / `.html` from shared AST + ExportMenu
- ✅ T1.4 — Statistics modal (pure `computeStats` + live UI + `Ctrl+Shift+I`)
- ✅ T1.5 — Focus mode (`Alt+F`, persists in Dexie, exit chip in corner)
- ✅ T1.6 — Editor prefs (size / line height / family / spellcheck / tab size / reset; round-trip persisted)
- ✅ T1.7 — Shortcuts (`Ctrl+S`/`Alt+C`/`Ctrl+Del` w/ confirm/`Ctrl+?` cheatsheet) + editorCommands registry
- ✅ **M1 close** — tagged [v0.1.0-m1](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.1.0-m1)
- ✅ Polish (4b3b84f) — missing T1.3–T1.7 CSS rules · SW update banner · loosened alias redirects
- ✅ T2.1 — Multi-note tabs + session restore + "open previous session" pref + inline rename + dirty dot
- ✅ T2.2 — Version history modal · pure LCS line diff · side-by-side panes · restore writes back to active note · empty-state · 16 unit tests
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
