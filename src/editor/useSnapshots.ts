import { useCallback, useEffect, useState } from 'react';
import { type Version } from '@/notes/db';
import {
  clearSnapshots,
  createSnapshot,
  listSnapshots,
  restoreSnapshot,
} from '@/notes/snapshotRepo';

interface UseSnapshotsOpts {
  noteId: string | null;
  body: string;
}

export interface SnapshotsAPI {
  latest: Version | null;
  count: number;
  /** body differs from latest snapshot (or no snapshot exists and body is non-empty). */
  pending: boolean;
  save: () => Promise<Version | null>;
  /** restore the most recent snapshot; returns the restored body, or null if none. */
  restoreLast: () => Promise<string | null>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSnapshots({ noteId, body }: UseSnapshotsOpts): SnapshotsAPI {
  const [latest, setLatest] = useState<Version | null>(null);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async (): Promise<void> => {
    if (noteId === null) {
      setLatest(null);
      setCount(0);
      return;
    }
    const all = await listSnapshots(noteId);
    setCount(all.length);
    setLatest(all[0] ?? null);
  }, [noteId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (): Promise<Version | null> => {
    if (noteId === null) return null;
    const v = await createSnapshot(noteId, body);
    await refresh();
    return v;
  }, [noteId, body, refresh]);

  const restoreLast = useCallback(async (): Promise<string | null> => {
    if (latest === null) return null;
    const result = await restoreSnapshot(latest.id);
    return result?.body ?? null;
  }, [latest]);

  const clearAll = useCallback(async (): Promise<void> => {
    if (noteId === null) return;
    await clearSnapshots(noteId);
    await refresh();
  }, [noteId, refresh]);

  const pending = latest === null ? body.length > 0 : latest.body !== body;

  return { latest, count, pending, save, restoreLast, clearAll, refresh };
}
