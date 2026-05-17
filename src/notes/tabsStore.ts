import { create } from 'zustand';
import {
  activateTab as repoActivate,
  addTab as repoAddTab,
  clearAllTabs,
  closeTab as repoCloseTab,
  getActiveTab,
  listTabs,
} from './tabsRepo';
import { type Tab, type Note } from './db';
import { createNote, getNoteById, listNotes } from './noteRepo';
import { getPref, PREF_KEYS_UI, setPref } from './prefs';

/**
 * Multi-note state for the editor (M2.T2.1).
 *
 * Tabs persist to the Dexie `tabs` table; this store is the in-memory mirror
 * the UI subscribes to. The Editor reads `activeNote` and renders it; the
 * tab strip reads `tabs` + `activeTabId` for switching.
 *
 * Session restore: bootstrap reads the `ui.restoreSession` pref (default true).
 * - true  → load whatever tabs existed at last unload
 * - false → wipe tab rows on boot, open a fresh note
 *
 * Either way, if the strip ends up empty (first run, or all notes deleted),
 * we open a fresh note so the editor always has something to render.
 */

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  activeNote: Note | null;
  ready: boolean;

  bootstrap: () => Promise<void>;
  /** Open a note by id; if a tab for it exists, activate it; else add one. */
  openNote: (noteId: string) => Promise<void>;
  /** Create + open a fresh empty note. */
  newNote: () => Promise<void>;
  /** Switch to a tab by id. */
  activate: (tabId: string) => Promise<void>;
  /** Close a tab; opens previous, or creates new if strip empties. */
  close: (tabId: string) => Promise<void>;
  /** Re-fetch the active note from Dexie (after a rename, etc). */
  refreshActiveNote: () => Promise<void>;
}

export const useTabs = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  activeNote: null,
  ready: false,

  bootstrap: async () => {
    const restoreSession = (await getPref<boolean>(PREF_KEYS_UI.restoreSession)) !== false;
    if (!restoreSession) {
      await clearAllTabs();
    }
    let tabs = await listTabs();

    // Drop tabs whose target note was deleted while we were away.
    const alive: Tab[] = [];
    for (const t of tabs) {
      const n = await getNoteById(t.noteId);
      if (n) alive.push(t);
    }
    if (alive.length !== tabs.length) {
      for (const t of tabs.filter((x) => !alive.includes(x))) {
        await repoCloseTab(t.id);
      }
      tabs = await listTabs();
    }

    // Empty strip → open the most-recent note, or a fresh one if there's nothing.
    if (tabs.length === 0) {
      const recent = (await listNotes())[0];
      const note = recent ?? (await createNote());
      await repoAddTab(note.id);
      tabs = await listTabs();
    }

    // Pick the active tab (whatever the repo says, or fall back to first).
    let active = await getActiveTab();
    if (!active && tabs[0]) {
      await repoActivate(tabs[0].id);
      active = (await getActiveTab()) ?? null;
    }
    const activeNote = active ? await getNoteById(active.noteId) : null;

    set({
      tabs,
      activeTabId: active?.id ?? null,
      activeNote,
      ready: true,
    });
  },

  openNote: async (noteId) => {
    const existing = get().tabs.find((t) => t.noteId === noteId);
    if (existing) {
      await get().activate(existing.id);
      return;
    }
    await repoAddTab(noteId);
    const [tabs, active] = await Promise.all([listTabs(), getActiveTab()]);
    const activeNote = active ? await getNoteById(active.noteId) : null;
    set({ tabs, activeTabId: active?.id ?? null, activeNote });
  },

  newNote: async () => {
    const note = await createNote();
    await repoAddTab(note.id);
    const [tabs, active] = await Promise.all([listTabs(), getActiveTab()]);
    set({ tabs, activeTabId: active?.id ?? null, activeNote: note });
  },

  activate: async (tabId) => {
    await repoActivate(tabId);
    const [tabs, active] = await Promise.all([listTabs(), getActiveTab()]);
    const activeNote = active ? await getNoteById(active.noteId) : null;
    set({ tabs, activeTabId: active?.id ?? null, activeNote });
  },

  close: async (tabId) => {
    const nextActiveId = await repoCloseTab(tabId);
    let tabs = await listTabs();
    if (tabs.length === 0) {
      // Strip emptied → fresh note rather than a blank screen.
      const note = await createNote();
      await repoAddTab(note.id);
      tabs = await listTabs();
    }
    const active = await getActiveTab();
    const activeNote = active ? await getNoteById(active.noteId) : null;
    set({
      tabs,
      activeTabId: active?.id ?? nextActiveId,
      activeNote,
    });
  },

  refreshActiveNote: async () => {
    const id = get().activeNote?.id;
    if (!id) return;
    const fresh = await getNoteById(id);
    set({ activeNote: fresh });
  },
}));

/** Setter for the `ui.restoreSession` pref. Persisted to Dexie. */
export async function setRestoreSession(value: boolean): Promise<void> {
  try {
    await setPref(PREF_KEYS_UI.restoreSession, value);
  } catch (err) {
    console.warn('[sveska] could not persist restoreSession pref:', err);
  }
}

export async function getRestoreSession(): Promise<boolean> {
  try {
    const v = await getPref<boolean>(PREF_KEYS_UI.restoreSession);
    return v !== false; // default = true
  } catch {
    return true;
  }
}
