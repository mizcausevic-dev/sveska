import { db } from './db';

/**
 * Crash-safe per-note draft shadow (M2.T2.3).
 *
 * The editor autosave is debounced 400ms, so a hard refresh / browser crash
 * inside that window can lose the most recent keystrokes. The shadow is
 * a small `prefs` row written on every body change (no debounce) keyed by
 * `draft.<noteId>`; on reboot we compare its `savedAt` to the note's
 * `updatedAt` and surface a recovery banner if the shadow is newer.
 *
 * Lives in `prefs` instead of its own table so it shares the existing Dexie
 * connection + reset path. Each row is { body, savedAt }; one row per note.
 */

const PREFIX = 'draft.';

export interface DraftShadow {
  body: string;
  savedAt: number;
}

function key(noteId: string): string {
  return PREFIX + noteId;
}

export async function writeDraft(noteId: string, body: string): Promise<void> {
  const row: DraftShadow = { body, savedAt: Date.now() };
  await db().prefs.put({ key: key(noteId), value: row });
}

export async function readDraft(noteId: string): Promise<DraftShadow | null> {
  const row = await db().prefs.get(key(noteId));
  if (!row) return null;
  const v = row.value as DraftShadow | undefined;
  if (!v || typeof v.body !== 'string' || typeof v.savedAt !== 'number') return null;
  return v;
}

export async function clearDraft(noteId: string): Promise<void> {
  await db().prefs.delete(key(noteId));
}
