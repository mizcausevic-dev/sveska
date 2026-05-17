import { db, type CanvasDoc } from '@/notes/db';

/**
 * Per-note canvas docs (M5.T5.1). Each note can have at most one canvas
 * row in the Dexie `canvas` table; the row stores the vendor doc as an
 * opaque Blob plus the providerId so we know which adapter wrote it.
 *
 * Saves are debounced upstream (the canvas adapter writes the latest
 * doc through `onChange` ~400ms after the last edit, mirroring the
 * note-body autosave debounce).
 */

const ID_FOR = (noteId: string): string => `c:${noteId}`;

export async function readCanvas(noteId: string): Promise<CanvasDoc | null> {
  return (await db().canvas.get(ID_FOR(noteId))) ?? null;
}

export async function writeCanvas(noteId: string, providerId: string, doc: Blob): Promise<void> {
  await db().canvas.put({ id: ID_FOR(noteId), noteId, providerId, doc });
}

export async function deleteCanvas(noteId: string): Promise<void> {
  await db().canvas.delete(ID_FOR(noteId));
}

/** Count of notes that have a canvas — useful for a future "Has canvas" rail filter. */
export async function countCanvases(): Promise<number> {
  return db().canvas.count();
}
