import { useEffect, useMemo, useState } from 'react';
import { type Note } from '@/notes/db';
import { setNoteDirectory, setNoteMode, setNotePinned, updateNoteTags } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { useCanvasView } from '@/canvas/canvasViewStore';
import { useDirectories } from '@/notes/directoryStore';
import { flattenDirectories } from '@/notes/directoryRepo';

interface Props {
  note: Note;
  onInsertTable: () => void;
}

/**
 * Per-note tag chips + pin toggle (M2.T2.4). Renders directly under TabBar
 * inside the Editor. Tag adds happen on Enter or `,`; chips delete on × or
 * Backspace when the input is empty. All writes round-trip through
 * `updateNoteTags` so normalization is consistent with the rail filter.
 */
export function TagsBar({ note, onInsertTable }: Props): React.JSX.Element {
  const refreshActiveNote = useTabs((s) => s.refreshActiveNote);
  const [draft, setDraft] = useState('');
  const directories = useDirectories((s) => s.directories);
  const bootstrapDirectories = useDirectories((s) => s.bootstrap);
  const directoryOptions = useMemo(() => flattenDirectories(directories), [directories]);

  useEffect(() => {
    void bootstrapDirectories();
  }, [bootstrapDirectories]);

  async function addFromDraft(): Promise<void> {
    const next = [...note.tags, draft];
    setDraft('');
    await updateNoteTags(note.id, next);
    await refreshActiveNote();
  }

  async function removeTag(tag: string): Promise<void> {
    const next = note.tags.filter((t) => t !== tag);
    await updateNoteTags(note.id, next);
    await refreshActiveNote();
  }

  const canvasOpen = useCanvasView((s) => s.open);
  const toggleCanvas = useCanvasView((s) => s.toggle);

  async function togglePin(): Promise<void> {
    await setNotePinned(note.id, !note.pinned);
    await refreshActiveNote();
  }

  async function toggleMode(): Promise<void> {
    // Cycle TXT → MD → CHK → TXT.
    const next: typeof note.mode =
      note.mode === 'text' ? 'md' : note.mode === 'md' ? 'checklist' : 'text';
    await setNoteMode(note.id, next);
    await refreshActiveNote();
  }

  return (
    <div className="tags-bar" role="group" aria-label="Note tags" data-testid="tags-bar">
      <button
        type="button"
        className={`pin-btn${note.pinned ? ' pin-btn--on' : ''}`}
        onClick={() => void togglePin()}
        aria-pressed={note.pinned === 1}
        title={note.pinned ? 'Unpin note' : 'Pin note to top of rail'}
        data-testid="pin-toggle"
      >
        <span aria-hidden="true">{note.pinned ? '★' : '☆'}</span>
        <span className="visually-hidden">{note.pinned ? 'Unpin' : 'Pin'} note</span>
      </button>
      <button
        type="button"
        className={`mode-toggle mode-toggle--${note.mode === 'md' ? 'md' : note.mode === 'checklist' ? 'chk' : 'txt'}`}
        onClick={() => void toggleMode()}
        aria-pressed={note.mode !== 'text'}
        title={
          note.mode === 'text'
            ? 'Switch to Markdown mode'
            : note.mode === 'md'
              ? 'Switch to Checklist mode'
              : 'Switch to plain text mode'
        }
        data-testid="mode-toggle"
      >
        {note.mode === 'md' ? 'MD' : note.mode === 'checklist' ? 'CHK' : 'TXT'}
      </button>
      <button
        type="button"
        className={`mode-toggle${canvasOpen ? ' mode-toggle--canvas' : ''}`}
        onClick={toggleCanvas}
        aria-pressed={canvasOpen}
        title={canvasOpen ? 'Close canvas view' : 'Open canvas (Excalidraw)'}
        data-testid="canvas-toggle"
      >
        ✎
      </button>
      <label className="directory-picker-label">
        <span className="visually-hidden">Directory</span>
        <select
          className="directory-picker mono"
          value={note.directoryId ?? ''}
          onChange={(event) => {
            const directoryId = event.target.value || null;
            void setNoteDirectory(note.id, directoryId).then(() => refreshActiveNote());
          }}
          data-testid="note-directory"
          title="Move note to directory"
        >
          <option value="">Unfiled</option>
          {directoryOptions.map((directory) => (
            <option key={directory.id} value={directory.id}>
              {`${'  '.repeat(directory.depth)}${directory.name}`}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="mode-toggle table-insert-button"
        onClick={onInsertTable}
        title="Insert Markdown table"
        data-testid="table-open"
      >
        Table
      </button>
      <ul className="tag-list" data-testid="tag-list">
        {note.tags.map((tag) => (
          <li key={tag} className="tag-chip" data-testid={`tag-chip-${tag}`}>
            <span className="tag-text">#{tag}</span>
            <button
              type="button"
              className="tag-x"
              onClick={() => void removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              data-testid={`tag-remove-${tag}`}
            >
              ×
            </button>
          </li>
        ))}
        <li className="tag-input-li">
          <input
            type="text"
            className="tag-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
                if (!draft.trim()) return;
                e.preventDefault();
                void addFromDraft();
              } else if (e.key === 'Backspace' && draft === '' && note.tags.length > 0) {
                e.preventDefault();
                const last = note.tags[note.tags.length - 1];
                if (last !== undefined) void removeTag(last);
              }
            }}
            placeholder={note.tags.length === 0 ? 'add tag…' : ''}
            aria-label="Add tag"
            data-testid="tag-input"
          />
        </li>
      </ul>
    </div>
  );
}
