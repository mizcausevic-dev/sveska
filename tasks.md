<!-- tasks.md — durable TODO. UPDATE on every commit. -->
<!-- This file replaces in-session TodoWrite for cross-session continuity. -->

# Tasks · Sveska

> **At session start, read this file first.** It holds the active ticket and the next 3–5 sequential ones. Older / completed work is summarized for context but should not be re-litigated.

## In progress

- [ ] **T3.6 — Paper textures · writing timer · word-count goal · find & replace**
  - **Why**: writing-ritual polish. Pick a paper texture (dotted / graph / linen / grain) for the editor background; set a per-session word-count goal with progress; run a Pomodoro / idle-aware writing timer; find & replace inside the active note.
  - **AC**: paper texture choice in Prefs persists + applies via CSS class on `.editor`; word-count goal modal sets a target N + shows a progress bar in the SaveIndicator footer; writing timer pill shows mm:ss running, pauses on idle > 60s; Ctrl+F opens find & replace within the textarea (case-sensitive opt-in, all/next/replace).
  - **Don't**: persist the timer across reloads in v1 — keep it session-scoped.

## Next up (sequential, top-down)

- [ ] T3.4 — Templates (incl. meeting-notes) + snippet manager + prompt library
- [ ] T3.5 — Typewriter mode + typing sounds (key / space / enter, volume)
- [ ] T3.6 — Paper textures · writing timer · word-count goal · find & replace
- [ ] T3.7 — Import .txt/.md · Web Share target · share-via-URL hash · PDF export
- [ ] **M3 close** — tag `v0.3.0-m3`, release notes

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
- ✅ T2.3 — Crash-safe draft shadow per note (`prefs.draft.<noteId>`) · written on every keystroke · cleared on debounced save · recovery banner with Keep / Discard on stale shadow · 10 unit tests
- ✅ T2.4 — Per-note tag chips · pin toggle · NotesRail sidebar with Pinned/Recent sections · saved-filter dropdown (All/Pinned/Untagged/#tag) · collapsible rail · 12 unit tests + browser preview verified
- ✅ T2.5 — Hand-rolled fuzzy scorer (1k notes <50ms) · Ctrl+P SearchModal (title+body fuzzy, ↑↓ Enter) · Inbox repo + Ctrl+Shift+K InboxModal (capture, promote-to-note, mark processed) · rail badge for unprocessed count · 19 unit tests + browser preview verified
- ✅ **M2 ship** — tagged [v0.2.0-m2](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.2.0-m2), GitHub release with per-ticket bullets
- ✅ Layout fix — `.editor` switched from grid to flex (TagsBar broke the 4-track grid; textarea now always `flex: 1`)
- ✅ T3.1 — Command catalog (12 entries across editor/view/navigate/note/app groups) · Ctrl+K CommandPalette modal (fuzzy filter, ↑↓ Enter) · inline slash-command popover in the editor (cursor on `/`-line triggers, Enter runs + strips `/query`) · 12 unit tests + browser preview verified
- ✅ T3.2 — `markdown-it` + DOMPurify renderer · `setNoteMode()` · TagsBar TXT/MD toggle · split editor + PreviewPane when MD + preview-toggle · HTML export uses `.prose` div for md notes · XSS gates (no `<script>`, no `javascript:` hrefs) · 12 unit tests + browser preview verified
- ✅ T3.3 — Pure parser for `- [ ]`/`- [x]` lines + passthrough preservation · ChecklistPane split-view with click-to-toggle, indent levels, drag-reorder, filter unchecked, summary · TagsBar mode cycle TXT → MD → CHK → TXT · 11 unit tests + browser preview verified
- ✅ T3.4 — `templates` + `snippets` Dexie repos with 5 built-in templates (meeting / daily / retro / standup / brief) + 3 built-in snippets · TemplatesModal (Ctrl+T) with Templates / Snippets tabs · "New note from template" creates + opens · in-editor snippet typeahead (`findTriggerAt` matches longest trigger to caret) · palette commands wired · 8 unit tests + browser preview verified
- ✅ T3.5 — Typewriter scroll hook (active line centered ~40% from top) + typing sounds hook (WebAudio synth click, 25ms throttle, pitch per key: 520Hz Enter / 360Hz Space / 440Hz default) · Prefs rows with conditional volume slider · 3 new persisted editor prefs (typewriter / sounds / soundVolume, both toggles default OFF) · 6 unit tests + browser preview verified
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
