import { useEffect, useState } from 'react';
import { getOrCreateActiveNote, migrateLegacyLocalStorage } from '@/notes/noteRepo';
import { useAutosave, type SaveState } from './useAutosave';

const PLACEHOLDER = 'Prazna sveska. Najbolji početak.';

const STATE_LABEL: Record<SaveState, string> = {
  idle: 'idle',
  pending: 'pending',
  saving: 'saving',
  saved: 'saved',
  error: 'save failed',
};

export function Editor(): React.JSX.Element {
  const [noteId, setNoteId] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await migrateLegacyLocalStorage();
      } catch (err) {
        console.warn('[sveska] legacy localStorage migration skipped:', err);
      }
      const note = await getOrCreateActiveNote();
      if (cancelled) return;
      setNoteId(note.id);
      setBody(note.body);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { state, lastSavedAt } = useAutosave({ noteId, body });

  return (
    <section className="editor" aria-busy={!hydrated}>
      <textarea
        className="editor-input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={PLACEHOLDER}
        spellCheck
        autoFocus
        aria-label="Note body"
        data-testid="editor-textarea"
      />
      <SaveIndicator state={state} lastSavedAt={lastSavedAt} hydrated={hydrated} />
    </section>
  );
}

interface SaveIndicatorProps {
  state: SaveState;
  lastSavedAt: number | null;
  hydrated: boolean;
}

function SaveIndicator({ state, lastSavedAt, hydrated }: SaveIndicatorProps): React.JSX.Element {
  const label = !hydrated ? 'loading' : STATE_LABEL[state];
  const stamp =
    lastSavedAt === null
      ? ''
      : new Date(lastSavedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
  return (
    <div className="save-indicator" role="status" aria-live="polite" data-testid="save-state">
      <span className={`save-dot save-dot--${state}`} aria-hidden="true" />
      <span className="save-label">{label}</span>
      {stamp && <span className="save-stamp mono"> · {stamp}</span>}
    </div>
  );
}
