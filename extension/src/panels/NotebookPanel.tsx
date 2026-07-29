import type { Note } from '../types/note';

interface Props {
  notes: Note[];
  active: Note | null;
  onCreateNote: () => Promise<Note>;
  onSelectNote: (id: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onBodyChange: (id: string, body: string) => Promise<void>;
  onTitleChange: (id: string, title: string) => Promise<void>;
}

/**
 * Notebook tab. Plain textarea over `note.body` — no CodeMirror, no
 * markdown preview, no syntax highlighting. This is the side-panel form
 * factor (~380 px wide), so a full rich editor would be overkill and
 * would bloat the extension bundle. If the user wants markdown live
 * preview they open the note in the PWA. (Sync between the two is a
 * separate roadmap item — CLAUDE.md §5.5.)
 */
export function NotebookPanel(props: Props): React.JSX.Element {
  if (!props.active) {
    return (
      <div className="panel-empty" data-testid="notebook-empty">
        <p>No notes yet.</p>
        <button
          type="button"
          className="panel-primary-btn"
          onClick={() => void props.onCreateNote()}
          data-testid="notebook-create-note"
        >
          + New note
        </button>
      </div>
    );
  }

  const active = props.active;

  return (
    <div className="notebook-panel" data-testid="notebook-panel">
      <div className="notebook-picker">
        <select
          value={active.id}
          onChange={(e) => void props.onSelectNote(e.target.value)}
          aria-label="Note"
          data-testid="notebook-picker"
        >
          {props.notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title || 'Untitled note'}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="notebook-add"
          onClick={() => void props.onCreateNote()}
          aria-label="New note"
          title="New note"
          data-testid="notebook-new-note"
        >
          +
        </button>
      </div>
      <input
        className="notebook-title"
        value={active.title}
        onChange={(e) => void props.onTitleChange(active.id, e.target.value)}
        placeholder="Note title"
        aria-label="Note title"
        data-testid="notebook-title"
      />
      <textarea
        className="notebook-body"
        value={active.body}
        onChange={(e) => void props.onBodyChange(active.id, e.target.value)}
        placeholder="Start writing…"
        aria-label="Note body"
        data-testid="notebook-body"
        spellCheck={false}
      />
      <button
        type="button"
        className="notebook-delete"
        onClick={() => void props.onDeleteNote(active.id)}
        data-testid="notebook-delete"
        title="Delete note"
      >
        Delete note
      </button>
    </div>
  );
}
