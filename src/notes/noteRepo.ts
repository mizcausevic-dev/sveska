import { db, type Note } from './db';

/**
 * M1 note CRUD. M0 only wrote `prefs`; this module is where the editor talks
 * to the `notes` table. Multi-note + tabs land at M2.
 */

const NEW_NOTE_DEFAULTS = (): Note => {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: '',
    body: '',
    mode: 'text',
    tags: [],
    pinned: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};

/** Return the most recently-updated non-deleted note. Creates a fresh one if the table is empty. */
export async function getOrCreateActiveNote(): Promise<Note> {
  const live = await db()
    .notes.orderBy('updatedAt')
    .reverse()
    .filter((n) => n.deletedAt === null)
    .first();
  if (live) return live;

  const note = NEW_NOTE_DEFAULTS();
  await db().notes.add(note);
  return note;
}

/** Update a note's body + touch updatedAt. Used by the autosave path. */
export async function saveNoteBody(id: string, body: string): Promise<void> {
  await db().notes.update(id, { body, updatedAt: Date.now() });
}

/** Rename a note (title) + touch updatedAt. M2 tab strip uses this for inline rename. */
export async function renameNote(id: string, title: string): Promise<void> {
  await db().notes.update(id, { title: title.trim(), updatedAt: Date.now() });
}

/** Get a single note by id (or null if missing / soft-deleted). */
export async function getNoteById(id: string): Promise<Note | null> {
  const n = await db().notes.get(id);
  if (!n || n.deletedAt !== null) return null;
  return n;
}

/** List all non-deleted notes, newest-first by updatedAt. */
export async function listNotes(): Promise<Note[]> {
  const all = await db().notes.orderBy('updatedAt').reverse().toArray();
  return all.filter((n) => n.deletedAt === null);
}

/** Create a fresh note. M2 tab strip calls this for "+ new". */
export async function createNote(
  seed: Partial<Pick<Note, 'title' | 'body' | 'mode'>> = {},
): Promise<Note> {
  const note = NEW_NOTE_DEFAULTS();
  if (seed.title !== undefined) note.title = seed.title;
  if (seed.body !== undefined) note.body = seed.body;
  if (seed.mode !== undefined) note.mode = seed.mode;
  await db().notes.add(note);
  return note;
}

/** Soft-delete a note (sets deletedAt). Snapshots + tab entries pointing at it
 * stay; the tabsStore is responsible for closing any tab that references it. */
export async function softDeleteNote(id: string): Promise<void> {
  await db().notes.update(id, { deletedAt: Date.now() });
}

/**
 * Replace a note's tag list (M2.T2.4). Tags are trimmed, lowercased, deduped,
 * and stripped of empties. The single source of truth for tag normalization
 * lives here so the UI never has to second-guess case/whitespace.
 */
export function normalizeTags(input: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    const t = raw.trim().toLowerCase();
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export async function updateNoteTags(id: string, tags: readonly string[]): Promise<void> {
  await db().notes.update(id, { tags: normalizeTags(tags), updatedAt: Date.now() });
}

/** Toggle / set the pinned flag (M2.T2.4). Indexed as 0/1 (Dexie can't index booleans). */
export async function setNotePinned(id: string, pinned: boolean): Promise<void> {
  await db().notes.update(id, { pinned: pinned ? 1 : 0, updatedAt: Date.now() });
}

/** All pinned non-deleted notes, newest-first. M2.T2.4 favorites bar. */
export async function listPinnedNotes(): Promise<Note[]> {
  const all = await db().notes.where('pinned').equals(1).toArray();
  return all.filter((n) => n.deletedAt === null).sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Migrate any legacy localStorage["note"] into a first note, then clear the key. */
export async function migrateLegacyLocalStorage(): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  const legacy = localStorage.getItem('note');
  if (legacy === null) return;
  const note = NEW_NOTE_DEFAULTS();
  note.body = legacy;
  note.title = 'Imported from notepad.js.org';
  await db().notes.add(note);
  localStorage.removeItem('note');
}
