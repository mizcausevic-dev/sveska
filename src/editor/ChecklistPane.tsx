import { useMemo, useState } from 'react';
import {
  moveLine,
  parseChecklist,
  serializeChecklist,
  summarize,
  toggleAt,
  type ParsedLine,
} from '@/lib/checklist';

interface Props {
  body: string;
  /** Editor passes its setBody — every action serializes the new state back. */
  onBodyChange: (next: string) => void;
}

/**
 * Interactive checklist view (M3.T3.3). Reads the body, parses tasks +
 * passthrough lines, and renders an editable list. Clicks on checkboxes
 * toggle the source `[ ]`/`[x]`; drag-and-drop on the handle reorders
 * lines in the body; a Filter Unchecked toggle hides done rows in this
 * pane only (the textarea still shows everything).
 *
 * The textarea remains source-of-truth — every mutation in here flows
 * through `onBodyChange` which writes the serialized body back to the
 * editor, which then triggers autosave + the recovery shadow.
 */
export function ChecklistPane({ body, onBodyChange }: Props): React.JSX.Element {
  const items = useMemo<ParsedLine[]>(() => parseChecklist(body), [body]);
  const summary = useMemo(() => summarize(items), [items]);
  const [filter, setFilter] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  function commit(next: ParsedLine[]): void {
    onBodyChange(serializeChecklist(next));
  }

  return (
    <div className="checklist-pane" data-testid="checklist-pane">
      <header className="checklist-head">
        <span className="mono checklist-summary">
          {summary.done}/{summary.total} done
        </span>
        <label className="checklist-filter">
          <input
            type="checkbox"
            checked={filter}
            onChange={(e) => setFilter(e.target.checked)}
            data-testid="checklist-filter-toggle"
          />
          <span>Hide done</span>
        </label>
      </header>
      <ul className="checklist-list" data-testid="checklist-list">
        {items.map((item, idx) => {
          if (item.kind === 'passthrough') {
            // Empty lines become spacers; non-empty passthrough lines render
            // dimmed so users see why their bullet line didn't parse.
            if (item.text.trim() === '') {
              return <li key={idx} className="checklist-spacer" aria-hidden="true" />;
            }
            return (
              <li key={idx} className="checklist-passthrough" data-testid={`checklist-pass-${idx}`}>
                {item.text}
              </li>
            );
          }
          if (filter && item.done) return null;
          const indentLevel = Math.min(6, Math.floor(item.indent.replace(/\t/g, '  ').length / 2));
          const isDragOver = dragFrom !== null && dragFrom !== idx;
          return (
            <li
              key={idx}
              className={`checklist-row${item.done ? ' checklist-row--done' : ''}`}
              style={{ paddingLeft: `${indentLevel * 20}px` }}
              draggable
              onDragStart={(e) => {
                setDragFrom(idx);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                if (dragFrom === null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom === null || dragFrom === idx) return;
                commit(moveLine(items, dragFrom, idx));
                setDragFrom(null);
              }}
              onDragEnd={() => setDragFrom(null)}
              data-testid={`checklist-row-${idx}`}
              data-dragover={isDragOver ? 'true' : undefined}
            >
              <span className="checklist-handle mono" aria-hidden="true" title="Drag to reorder">
                ⋮⋮
              </span>
              <input
                type="checkbox"
                className="checklist-box"
                checked={item.done}
                onChange={() => commit(toggleAt(items, idx))}
                aria-label={item.text || 'task'}
                data-testid={`checklist-box-${idx}`}
              />
              <span className="checklist-text">{item.text || <em>empty task</em>}</span>
            </li>
          );
        })}
        {summary.total === 0 && (
          <li className="checklist-empty" data-testid="checklist-empty">
            No tasks yet — write lines like <code>- [ ] thing to do</code> in the textarea.
          </li>
        )}
      </ul>
    </div>
  );
}
