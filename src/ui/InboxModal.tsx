import { useEffect, useRef, useState } from 'react';
import { Modal } from './Modal';
import { type InboxItem } from '@/notes/db';
import {
  addInboxItem,
  deleteInboxItem,
  listInbox,
  markProcessed,
  markUnprocessed,
} from '@/notes/inboxRepo';
import { createNote } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { closeInbox, useInboxModal } from './inboxModalStore';

/**
 * Quick-capture inbox (M2.T2.5). Opens via `Ctrl+Shift+K`. The top single-line
 * input drops a new row into the `inbox` Dexie table on Enter; the list below
 * shows everything, newest-first, with three actions per row:
 *   - **→ Note** — promote into a fresh note (and open it in a tab)
 *   - **✓** — mark processed (won't count toward the rail badge)
 *   - **×** — delete
 */
export function InboxModalHost(): React.JSX.Element {
  const open = useInboxModal((s) => s.open);
  const openNote = useTabs((s) => s.openNote);

  const [items, setItems] = useState<InboxItem[]>([]);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh(): Promise<void> {
    setItems(await listInbox());
  }

  useEffect(() => {
    if (!open) return;
    setDraft('');
    void refresh();
    queueMicrotask(() => inputRef.current?.focus());
  }, [open]);

  async function commitDraft(): Promise<void> {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    await addInboxItem(t);
    await refresh();
  }

  async function promote(item: InboxItem): Promise<void> {
    const note = await createNote({ title: item.text.slice(0, 60), body: item.text });
    await markProcessed(item.id);
    await refresh();
    closeInbox();
    await openNote(note.id);
  }

  async function toggle(item: InboxItem): Promise<void> {
    if (item.processed === 1) await markUnprocessed(item.id);
    else await markProcessed(item.id);
    await refresh();
  }

  async function remove(item: InboxItem): Promise<void> {
    await deleteInboxItem(item.id);
    await refresh();
  }

  return (
    <Modal open={open} onClose={closeInbox} title="Inbox" describedById="inbox-hint">
      <p id="inbox-hint" className="visually-hidden">
        Quick-capture single-line items. Press Enter to save, then process them into notes later.
      </p>
      <div className="inbox-shell">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Quick capture · press Enter to save…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              e.preventDefault();
              void commitDraft();
            }
          }}
          aria-label="New inbox item"
          data-testid="inbox-input"
        />
        <ul className="inbox-list" data-testid="inbox-list">
          {items.length === 0 && (
            <li className="search-empty" data-testid="inbox-empty">
              Inbox is empty. Capture a thought above.
            </li>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className={`inbox-row${item.processed ? ' inbox-row--done' : ''}`}
              data-testid={`inbox-row-${item.id}`}
            >
              <span className="inbox-text">{item.text}</span>
              <span className="inbox-actions">
                <button
                  type="button"
                  className="snap-btn"
                  onClick={() => void promote(item)}
                  title="Promote to a new note"
                  data-testid={`inbox-promote-${item.id}`}
                >
                  → Note
                </button>
                <button
                  type="button"
                  className="snap-btn"
                  onClick={() => void toggle(item)}
                  aria-pressed={item.processed === 1}
                  title={item.processed ? 'Mark unprocessed' : 'Mark processed'}
                  data-testid={`inbox-toggle-${item.id}`}
                >
                  {item.processed ? '↺' : '✓'}
                </button>
                <button
                  type="button"
                  className="snap-btn snap-btn--danger"
                  onClick={() => void remove(item)}
                  title="Delete"
                  data-testid={`inbox-delete-${item.id}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
