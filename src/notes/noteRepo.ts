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
