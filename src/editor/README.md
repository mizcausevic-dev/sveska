# src/editor

Native `<textarea>` editor + autosave hook. CodeMirror 6 lands when Markdown / slash
commands need it (M3.2 onwards).

- `Editor.tsx` — the textarea, save indicator, hydrates the active note from Dexie on mount.
- `useAutosave.ts` — debounced (400 ms) write to Dexie via `saveNoteBody`, with immediate
  flush on `blur` + `visibilitychange:hidden` + `pagehide` + unmount. Exposes a `flush()`
  callback for tests / a future "save now" button.

Migrates any legacy `localStorage["note"]` into the first Dexie note on first run
(CLAUDE.md §4 migration step). The migration runs once, then the key is cleared.
