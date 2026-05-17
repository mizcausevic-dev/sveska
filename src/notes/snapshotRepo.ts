import { db, type Version } from './db';

/**
 * Snapshots = point-in-time copies of a note's body. M1.T1.2.
 * Stored in the Dexie `versions` table; many-per-note, newest-first by snapshotAt.
 */

export async function createSnapshot(
  noteId: string,
  body: string,
  label?: string,
): Promise<Version> {
  const v: Version = {
    id: crypto.randomUUID(),
    noteId,
    body,
    snapshotAt: Date.now(),
    label: label ?? null,
  };
  await db().versions.add(v);
  return v;
}

export async function listSnapshots(noteId: string): Promise<Version[]> {
  // sortBy returns ascending — reverse for newest-first.
  const asc = await db().versions.where('noteId').equals(noteId).sortBy('snapshotAt');
  return asc.reverse();
}

export async function getLatestSnapshot(noteId: string): Promise<Version | null> {
  const all = await listSnapshots(noteId);
  return all[0] ?? null;
}

export async function restoreSnapshot(
  snapshotId: string,
): Promise<{ noteId: string; body: string } | null> {
  const snap = await db().versions.get(snapshotId);
  if (!snap) return null;
  await db().notes.update(snap.noteId, { body: snap.body, updatedAt: Date.now() });
  return { noteId: snap.noteId, body: snap.body };
}

export async function clearSnapshots(noteId: string): Promise<number> {
  return db().versions.where('noteId').equals(noteId).delete();
}
