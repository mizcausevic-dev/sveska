import { useState } from 'react';
import type { Note } from '../types/note';
import {
  appendTask,
  parseChecklist,
  removeAt,
  serializeChecklist,
  toggleAt,
} from '../lib/checklist';

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
 * Tasks tab. A note in `mode: 'checklist'` is treated as one list:
 * markdown `- [ ]` lines become interactive rows, everything else is
 * "passthrough" text preserved in the body so a round-trip via the PWA
 * doesn't lose formatting.
 *
 * Row indices are into the FULL parsed line array (not "task-only"), which
 * matches the checklist lib's contract and lets us delete/toggle
 * passthrough lines uniformly if that ever becomes needed.
 */
export function TasksPanel(props: Props): React.JSX.Element {
  const [newItemText, setNewItemText] = useState('');

  if (!props.active) {
    return (
      <div className="panel-empty" data-testid="tasks-empty">
        <p>No task lists yet.</p>
        <button
          type="button"
          className="panel-primary-btn"
          onClick={() => void props.onCreateNote()}
          data-testid="tasks-create-list"
        >
          + New task list
        </button>
      </div>
    );
  }

  const active = props.active;
  const items = parseChecklist(active.body);

  async function onToggle(fullIndex: number): Promise<void> {
    await props.onBodyChange(active.id, serializeChecklist(toggleAt(items, fullIndex)));
  }

  async function onDeleteRow(fullIndex: number): Promise<void> {
    await props.onBodyChange(active.id, serializeChecklist(removeAt(items, fullIndex)));
  }

  async function onAddItem(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const text = newItemText.trim();
    if (!text) return;
    await props.onBodyChange(active.id, serializeChecklist(appendTask(items, text)));
    setNewItemText('');
  }

  return (
    <div className="tasks-panel" data-testid="tasks-panel">
      <div className="tasks-list-picker">
        <select
          value={active.id}
          onChange={(e) => void props.onSelectNote(e.target.value)}
          aria-label="Task list"
          data-testid="tasks-picker"
        >
          {props.notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title || 'Untitled list'}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="tasks-list-add"
          onClick={() => void props.onCreateNote()}
          aria-label="New task list"
          title="New task list"
          data-testid="tasks-new-list"
        >
          +
        </button>
      </div>
      <input
        className="tasks-list-title"
        value={active.title}
        onChange={(e) => void props.onTitleChange(active.id, e.target.value)}
        placeholder="List name"
        aria-label="List name"
        data-testid="tasks-title"
      />
      <ul className="tasks-rows" role="list">
        {items.map((it, i) => {
          if (it.kind !== 'task') return null;
          return (
            <li key={i} className="tasks-row">
              <input
                type="checkbox"
                checked={it.done}
                onChange={() => void onToggle(i)}
                aria-label={it.text || 'Task'}
                data-testid={`task-checkbox-${i}`}
              />
              <span className={`tasks-row-text ${it.done ? 'is-done' : ''}`}>{it.text}</span>
              <button
                type="button"
                className="tasks-row-delete"
                onClick={() => void onDeleteRow(i)}
                aria-label={`Delete task: ${it.text || 'empty'}`}
                title="Delete task"
                data-testid={`task-delete-${i}`}
              >
                {'×'}
              </button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={(e) => void onAddItem(e)} className="tasks-add-row">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add task…"
          aria-label="Add task"
          data-testid="tasks-add-input"
        />
        <button type="submit" data-testid="tasks-add-submit">
          Add
        </button>
      </form>
      <button
        type="button"
        className="tasks-list-delete"
        onClick={() => void props.onDeleteNote(active.id)}
        data-testid="tasks-list-delete"
      >
        Delete list
      </button>
    </div>
  );
}
