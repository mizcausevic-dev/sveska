import { useEffect, useState } from 'react';
import { type Note } from '@/notes/db';
import { getOrCreateActiveNote, migrateLegacyLocalStorage } from '@/notes/noteRepo';
import { useAutosave, type SaveState } from './useAutosave';
import { useSnapshots } from './useSnapshots';
import { SnapshotToolbar } from './SnapshotToolbar';
import { ExportMenu } from './ExportMenu';
import { StatsModalHost } from './StatsModal';
import { openStats } from './statsModalStore';
import { FONT_FAMILY_CSS, useEditorPrefs } from '@/notes/editorPrefs';
import { useEditorCommands } from './editorCommands';
import { astFromNote } from '@/markdown/ast';
import { download, exportAs } from '@/markdown/export';
import { ClearConfirmHost } from './ClearConfirm';
import { confirmClear } from './clearConfirmStore';
import { saveNoteBody } from '@/notes/noteRepo';

const PLACEHOLDER = 'Prazna sveska. Najbolji početak.';

const STATE_LABEL: Record<SaveState, string> = {
  idle: 'idle',
  pending: 'pending',
  saving: 'saving',
  saved: 'saved',
  error: 'save failed',
};

export function Editor(): React.JSX.Element {
  const [note, setNote] = useState<Note | null>(null);
  const [body, setBody] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const noteId = note?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await migrateLegacyLocalStorage();
      } catch (err) {
        console.warn('[sveska] legacy localStorage migration skipped:', err);
      }
      const n = await getOrCreateActiveNote();
      if (cancelled) return;
      setNote(n);
      setBody(n.body);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { state, lastSavedAt } = useAutosave({ noteId, body });
  const snapshots = useSnapshots({ noteId, body });
  const prefs = useEditorPrefs();

  // Register T1.7 commands so KeyBindings can invoke them from the global handler.
  useEffect(() => {
    const reg = useEditorCommands.getState().register;
    const unreg = useEditorCommands.getState().unregister;

    reg('export.txt', () => {
      if (!note) return;
      const ast = astFromNote({ ...note, body });
      download(exportAs(ast, 'txt'));
    });
    reg('copy.body', () => {
      if (!navigator.clipboard) return;
      void navigator.clipboard.writeText(body);
    });
    reg('clear.body.request', () => {
      if (!note) return;
      void confirmClear().then((ok) => {
        if (!ok) return;
        setBody('');
        // Flush a save immediately so Dexie reflects the cleared body
        // even if the user navigates away before the 400ms debounce.
        void saveNoteBody(note.id, '');
      });
    });
    return () => {
      unreg('export.txt');
      unreg('copy.body');
      unreg('clear.body.request');
    };
  }, [note, body]);

  function onTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart, selectionEnd, value } = el;
      const next = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd);
      setBody(next);
      // Restore caret one char after the inserted tab.
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 1;
      });
    }
  }

  return (
    <section className="editor" aria-busy={!hydrated}>
      <div className="editor-actions">
        <SnapshotToolbar snapshots={snapshots} onAfterRestore={setBody} />
        <div className="editor-actions-secondary">
          <button
            type="button"
            className="snap-btn stats-btn"
            onClick={openStats}
            data-testid="stats-open"
            title="Statistics (Ctrl + Shift + I)"
          >
            Stats
          </button>
          <ExportMenu note={note} body={body} />
        </div>
      </div>
      <StatsModalHost body={body} />
      <ClearConfirmHost />
      <textarea
        className="editor-input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onTextareaKeyDown}
        placeholder={PLACEHOLDER}
        spellCheck={prefs.spellcheck}
        autoFocus
        aria-label="Note body"
        data-testid="editor-textarea"
        style={{
          fontSize: `${prefs.fontSize}px`,
          lineHeight: prefs.lineHeight,
          fontFamily: FONT_FAMILY_CSS[prefs.fontFamily],
          tabSize: prefs.tabSize,
        }}
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
