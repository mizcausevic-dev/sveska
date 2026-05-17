import { useEffect, useMemo, useState } from 'react';
import { debounce } from '@/lib/debounce';
import { saveNoteBody } from '@/notes/noteRepo';

export type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface AutosaveOpts {
  noteId: string | null;
  body: string;
  /** Debounce window in ms. CLAUDE.md §6 T1.1 = 400. */
  debounceMs?: number;
}

interface AutosaveResult {
  state: SaveState;
  lastSavedAt: number | null;
  /** Flush a pending write immediately. Exposed for tests + UI buttons. */
  flush: () => void;
}

/**
 * Autosave a note body to Dexie. Debounced by `debounceMs` (400 ms default), with an
 * immediate flush on `blur` + `visibilitychange:hidden` + `pagehide`. The flush bindings
 * cover the cases where a user closes the tab or switches apps before the debounce fires.
 */
export function useAutosave({ noteId, body, debounceMs = 400 }: AutosaveOpts): AutosaveResult {
  const [state, setState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Build the debounced writer once per noteId. Re-keying when noteId changes
  // means a switch never persists the prior note's pending edits to the wrong row.
  const writer = useMemo(() => {
    if (noteId === null) return null;
    const persist = (id: string, b: string): void => {
      setState('saving');
      void saveNoteBody(id, b)
        .then(() => {
          setLastSavedAt(Date.now());
          setState('saved');
        })
        .catch((err) => {
          console.error('[sveska] autosave failed:', err);
          setState('error');
        });
    };
    return debounce(persist, debounceMs);
  }, [noteId, debounceMs]);

  // Schedule a save whenever the body changes.
  useEffect(() => {
    if (writer === null || noteId === null) return;
    setState('pending');
    writer(noteId, body);
  }, [body, noteId, writer]);

  // Flush bindings: blur, visibility hidden, pagehide.
  useEffect(() => {
    if (writer === null) return;
    const flush = (): void => writer.flush();
    const onVisibility = (): void => {
      if (document.hidden) flush();
    };
    window.addEventListener('blur', flush);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', flush);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      // Best-effort: flush on unmount too.
      flush();
    };
  }, [writer]);

  return {
    state,
    lastSavedAt,
    flush: writer ? writer.flush : () => undefined,
  };
}
