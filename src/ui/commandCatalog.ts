import { openPrefs } from './prefsModalStore';
import { openStats } from '@/editor/statsModalStore';
import { openShortcuts } from './shortcutsModalStore';
import { openSearch } from './searchModalStore';
import { openInbox } from './inboxModalStore';
import { openVersions } from '@/editor/versionsModalStore';
import { useEditorCommands } from '@/editor/editorCommands';
import { useUIStore } from '@/notes/uiStore';
import { useNotesRail } from '@/notes/notesRailStore';
import { useTabs } from '@/notes/tabsStore';
import { setNotePinned } from '@/notes/noteRepo';

/**
 * Static catalog of every user-facing action (M3.T3.1).
 *
 * Each entry has a stable id (used as React key + slash-command alias), a
 * display label, an optional shortcut hint for the row, an optional keywords
 * blob for fuzzy matching, and the `run` thunk. Most thunks just call the
 * already-existing modal-opener or editor-command — the palette is a
 * discovery surface, not a re-implementation.
 *
 * Built lazily as a function (not a top-level const) because some `run`s
 * read the current Zustand state via `getState()` and we want each invocation
 * to see fresh state, not state from import time.
 */
export interface PaletteCommand {
  id: string;
  label: string;
  keywords?: string;
  shortcut?: string;
  group: 'editor' | 'view' | 'navigate' | 'note' | 'app';
  run: () => void;
}

export function buildCommandCatalog(): PaletteCommand[] {
  return [
    // ─── navigate ──────────────────────────────────────────────────────────
    {
      id: 'open.search',
      label: 'Search notes',
      keywords: 'find go to find file',
      shortcut: 'Ctrl + P',
      group: 'navigate',
      run: openSearch,
    },
    {
      id: 'open.inbox',
      label: 'Open inbox',
      keywords: 'capture quick',
      shortcut: 'Ctrl + Shift + K',
      group: 'navigate',
      run: openInbox,
    },
    {
      id: 'toggle.rail',
      label: 'Toggle notes rail',
      keywords: 'sidebar hide show',
      group: 'navigate',
      run: () => useNotesRail.getState().toggle(),
    },
    {
      id: 'new.note',
      label: 'New note',
      keywords: 'create',
      group: 'navigate',
      run: () => void useTabs.getState().newNote(),
    },

    // ─── note ──────────────────────────────────────────────────────────────
    {
      id: 'note.pin.toggle',
      label: 'Toggle pin on this note',
      keywords: 'favorite star',
      group: 'note',
      run: () => {
        const n = useTabs.getState().activeNote;
        if (!n) return;
        void setNotePinned(n.id, n.pinned !== 1).then(() => useTabs.getState().refreshActiveNote());
      },
    },
    {
      id: 'note.history',
      label: 'Version history…',
      keywords: 'versions snapshots diff',
      group: 'note',
      run: openVersions,
    },

    // ─── editor ────────────────────────────────────────────────────────────
    {
      id: 'export.txt',
      label: 'Export as .txt',
      keywords: 'download save plain text',
      shortcut: 'Ctrl + S',
      group: 'editor',
      run: () => useEditorCommands.getState().run('export.txt'),
    },
    {
      id: 'copy.body',
      label: 'Copy note body to clipboard',
      keywords: 'clipboard yank',
      shortcut: 'Alt + C',
      group: 'editor',
      run: () => useEditorCommands.getState().run('copy.body'),
    },
    {
      id: 'clear.body',
      label: 'Clear note body…',
      keywords: 'empty erase delete',
      shortcut: 'Ctrl + Del',
      group: 'editor',
      run: () => useEditorCommands.getState().run('clear.body.request'),
    },

    // ─── view ──────────────────────────────────────────────────────────────
    {
      id: 'view.focus',
      label: 'Toggle focus mode',
      keywords: 'hide chrome distraction',
      shortcut: 'Alt + F',
      group: 'view',
      run: () => void useUIStore.getState().toggleFocus(),
    },
    {
      id: 'view.stats',
      label: 'Note statistics',
      keywords: 'word count reading time',
      shortcut: 'Ctrl + Shift + I',
      group: 'view',
      run: openStats,
    },

    // ─── app ───────────────────────────────────────────────────────────────
    {
      id: 'app.prefs',
      label: 'Preferences',
      keywords: 'settings font size theme',
      shortcut: 'Ctrl + ,',
      group: 'app',
      run: openPrefs,
    },
    {
      id: 'app.shortcuts',
      label: 'Keyboard shortcuts',
      keywords: 'help cheatsheet keys',
      shortcut: 'Ctrl + ?',
      group: 'app',
      run: openShortcuts,
    },
  ];
}
