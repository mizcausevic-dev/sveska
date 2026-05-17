<!-- tasks.md — durable TODO. UPDATE on every commit. -->
<!-- This file replaces in-session TodoWrite for cross-session continuity. -->

# Tasks · Sveska

> **At session start, read this file first.** It holds the active ticket and the next 3–5 sequential ones. Older / completed work is summarized for context but should not be re-litigated.

## In progress

- [ ] **T1.7 — Shortcuts + cheatsheet overlay**
  - **Bindings to add**: `Ctrl/Cmd+S` → trigger `.txt` export (T1.3) · `Alt+C` → copy whole body to clipboard · `Ctrl/Cmd+Del` → clear body (confirm modal, destructive) · `Ctrl/Cmd+?` (or `Shift+/`) → open shortcuts cheatsheet overlay
  - **Files**: extend `src/app/KeyBindings.tsx` · new `src/ui/ShortcutsModal.tsx` + `src/ui/shortcutsModalStore.ts` · new `src/editor/ClearConfirm.tsx` (small confirm dialog) · `src/__tests__/shortcuts.test.tsx`
  - **AC**: all shortcuts work on Win + Mac; help overlay lists every binding currently wired; clear is two-step (Ctrl+Del → confirm dialog → Yes); no conflicts with browser-native shortcuts (app's `Ctrl+S` wins via `e.preventDefault()`)
  - **Don't**: trigger downloads from the global shortcut without the user having focused the editor first — preserve browser print/save behaviour on non-editor pages

## Next up (sequential, top-down)

- [ ] **M1 close** — Lighthouse PWA pass on `sveska.studio`, tag `v0.1.0-m1`, write release notes

## Recently done (this branch only)

- ✅ **M0 ship** — 5 commits, tagged `v0.0.1-m0`, deployed to `sveska.studio`
- ✅ T1.1 — Editor + Dexie autosave (debounced 400ms + blur/visibility flush + refresh-safe)
- ✅ T1.2 — Snapshots save/restore/clear + pending dot indicator
- ✅ T1.3 — Export `.txt` / `.md` / `.html` from shared AST + ExportMenu
- ✅ T1.4 — Statistics modal (pure `computeStats` + live UI + `Ctrl+Shift+I`)
- ✅ T1.5 — Focus mode (`Alt+F`, persists in Dexie, exit chip in corner)
- ✅ T1.6 — Editor prefs (size / line height / family / spellcheck / tab size / reset; round-trip persisted)
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
