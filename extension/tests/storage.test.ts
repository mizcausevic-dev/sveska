import { describe, expect, it, vi } from 'vitest';
import {
  createNote,
  deleteNote,
  getActiveNoteId,
  getActiveTab,
  getTheme,
  listAllNotesRaw,
  listNotes,
  setActiveNoteId,
  setActiveTab,
  setTheme,
  updateNote,
} from '../src/storage/notesStorage';

describe('notesStorage — chrome.storage.local round-trip', () => {
  it('creates a note with a UUID id and lists it', async () => {
    const note = await createNote('checklist');
    expect(note.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(note.mode).toBe('checklist');
    expect(note.deletedAt).toBeNull();

    const notes = await listNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0]!.id).toBe(note.id);
  });

  it('updates a note body + title, preserves id and createdAt, bumps updatedAt', async () => {
    const note = await createNote('text');
    const originalUpdatedAt = note.updatedAt;
    // Ensure clock advances a tick so updatedAt is strictly newer.
    await new Promise((r) => setTimeout(r, 5));
    await updateNote(note.id, { title: 'Hello', body: 'world' });
    const [after] = await listNotes();
    expect(after!.title).toBe('Hello');
    expect(after!.body).toBe('world');
    expect(after!.id).toBe(note.id);
    expect(after!.createdAt).toBe(note.createdAt);
    expect(after!.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
  });

  it('soft-deletes a note — listNotes filters, raw list retains the tombstone', async () => {
    const note = await createNote('text');
    await deleteNote(note.id);
    expect(await listNotes()).toHaveLength(0);
    const raw = await listAllNotesRaw();
    expect(raw).toHaveLength(1);
    expect(raw[0]!.deletedAt).not.toBeNull();
  });

  it('active tab defaults to "tasks" and persists across reads', async () => {
    expect(await getActiveTab()).toBe('tasks');
    await setActiveTab('notebook');
    expect(await getActiveTab()).toBe('notebook');
  });

  it('active note id defaults to null and persists across reads', async () => {
    expect(await getActiveNoteId()).toBeNull();
    const note = await createNote('checklist');
    await setActiveNoteId(note.id);
    expect(await getActiveNoteId()).toBe(note.id);
    await setActiveNoteId(null);
    expect(await getActiveNoteId()).toBeNull();
  });

  it('theme defaults to "dark" and persists any valid choice', async () => {
    expect(await getTheme()).toBe('dark');
    await setTheme('light');
    expect(await getTheme()).toBe('light');
    await setTheme('charcoal');
    expect(await getTheme()).toBe('charcoal');
    await setTheme('midnight');
    expect(await getTheme()).toBe('midnight');
    await setTheme('sepia');
    expect(await getTheme()).toBe('sepia');
    await setTheme('system');
    expect(await getTheme()).toBe('system');
  });

  it('note id uses crypto.randomUUID (matches PWA — DoD #2)', async () => {
    // Verify the extension's generator is Web Crypto UUID, same as
    // src/notes/noteRepo.ts:12 in the PWA. This is a regression guard:
    // if someone swaps to nanoid or a custom scheme later, tests catch it.
    const ids = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const n = await createNote('text');
      expect(n.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      ids.add(n.id);
    }
    expect(ids.size).toBe(5);
  });

  it('preserves every note when creates overlap', async () => {
    let backingStore: Record<string, unknown> = {};
    const storage = chrome.storage.local;
    const originalGet = storage.get;
    const originalSet = storage.set;

    storage.get = vi.fn(async (key: string) => {
      await Promise.resolve();
      return key in backingStore ? { [key]: structuredClone(backingStore[key]) } : {};
    }) as unknown as typeof storage.get;
    storage.set = vi.fn(async (items: Record<string, unknown>) => {
      await Promise.resolve();
      backingStore = { ...backingStore, ...structuredClone(items) };
    });

    try {
      const [first, second] = await Promise.all([createNote('text'), createNote('checklist')]);
      const stored = await listAllNotesRaw();
      expect(stored.map((note) => note.id)).toEqual(expect.arrayContaining([first.id, second.id]));
      expect(stored).toHaveLength(2);
    } finally {
      storage.get = originalGet;
      storage.set = originalSet;
    }
  });
});
