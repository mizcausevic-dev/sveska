import { useEffect, useState } from 'react';
import {
  createNote,
  deleteNote,
  getActiveNoteId,
  getActiveTab,
  getTheme,
  listNotes,
  setActiveNoteId,
  setActiveTab,
  setTheme,
  updateNote,
  type Tab,
  type ThemeChoice,
} from './storage/notesStorage';
import type { Note } from './types/note';
import { Header } from './panels/Header';
import { TasksPanel } from './panels/TasksPanel';
import { NotebookPanel } from './panels/NotebookPanel';

/**
 * Root of the side panel. Owns hydration from chrome.storage.local, the
 * active tab / active note / theme, and delegates rendering to Tasks or
 * Notebook. Writes are immediate (small side-panel notes; per-keystroke
 * chrome.storage.local writes are ~10 ms and non-blocking).
 *
 * Active-note fallback: activeNoteId is a single value, but the two tabs
 * filter to different modes. When the persisted activeNoteId doesn't
 * belong to the current tab, we transparently fall back to the first note
 * in that tab (or the empty state if none exist). The storage value is
 * only rewritten when the user explicitly selects or creates something.
 */
export function App(): React.JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteIdState] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('tasks');
  const [theme, setThemeState] = useState<ThemeChoice>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      const [n, id, t, th] = await Promise.all([
        listNotes(),
        getActiveNoteId(),
        getActiveTab(),
        getTheme(),
      ]);
      setNotes(n);
      setActiveNoteIdState(id);
      setTab(t);
      setThemeState(th);
      setHydrated(true);
    })();
  }, []);

  // Apply theme to <html data-theme>. Same convention as the PWA
  // (see ../../../src/notes/themeStore.ts) so tokens.css does the rest.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  async function onTabChange(t: Tab): Promise<void> {
    setTab(t);
    await setActiveTab(t);
  }

  async function onThemeChange(t: ThemeChoice): Promise<void> {
    setThemeState(t);
    await setTheme(t);
  }

  async function onNoteBodyChange(id: string, body: string): Promise<void> {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, body } : n)));
    await updateNote(id, { body });
  }

  async function onNoteTitleChange(id: string, title: string): Promise<void> {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)));
    await updateNote(id, { title });
  }

  async function onCreateNote(mode: Note['mode']): Promise<Note> {
    const n = await createNote(mode);
    setNotes((prev) => [...prev, n]);
    setActiveNoteIdState(n.id);
    await setActiveNoteId(n.id);
    return n;
  }

  async function onDeleteNote(id: string): Promise<void> {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteIdState(null);
      await setActiveNoteId(null);
    }
  }

  async function onSelectNote(id: string): Promise<void> {
    setActiveNoteIdState(id);
    await setActiveNoteId(id);
  }

  if (!hydrated) {
    return (
      <div className="panel-loading" data-testid="loading">
        Loading Sveska…
      </div>
    );
  }

  const tasksNotes = notes.filter((n) => n.mode === 'checklist');
  const notebookNotes = notes.filter((n) => n.mode !== 'checklist');
  const activeTasksNote = tasksNotes.find((n) => n.id === activeNoteId) ?? tasksNotes[0] ?? null;
  const activeNotebookNote =
    notebookNotes.find((n) => n.id === activeNoteId) ?? notebookNotes[0] ?? null;

  return (
    <div className="panel-root">
      <Header tab={tab} onTabChange={onTabChange} theme={theme} onThemeChange={onThemeChange} />
      {tab === 'tasks' ? (
        <TasksPanel
          notes={tasksNotes}
          active={activeTasksNote}
          onCreateNote={() => onCreateNote('checklist')}
          onSelectNote={onSelectNote}
          onDeleteNote={onDeleteNote}
          onBodyChange={onNoteBodyChange}
          onTitleChange={onNoteTitleChange}
        />
      ) : (
        <NotebookPanel
          notes={notebookNotes}
          active={activeNotebookNote}
          onCreateNote={() => onCreateNote('text')}
          onSelectNote={onSelectNote}
          onDeleteNote={onDeleteNote}
          onBodyChange={onNoteBodyChange}
          onTitleChange={onNoteTitleChange}
        />
      )}
    </div>
  );
}
