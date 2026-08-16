import { useEffect, useRef, useState } from 'react';
import { type Tab, type Note } from '@/notes/db';
import { renameNote } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { formatRelativeTime } from '@/lib/relativeTime';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  notesById: Record<string, Note>;
  /** Body of the active note (so the dirty dot reflects unsaved typing). */
  activeBody: string;
}

export function TabBar({
  tabs,
  activeTabId,
  notesById,
  activeBody,
}: TabBarProps): React.JSX.Element {
  const activate = useTabs((s) => s.activate);
  const close = useTabs((s) => s.close);
  const newNote = useTabs((s) => s.newNote);
  const refreshActiveNote = useTabs((s) => s.refreshActiveNote);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  async function commitRename(noteId: string, value: string): Promise<void> {
    await renameNote(noteId, value);
    await refreshActiveNote();
    setRenamingId(null);
  }

  // a11y: we use role="toolbar" instead of role="tablist". Tabs would be
  // semantically correct, but tablist forbids non-tab children — and each
  // chip ships a close button next to the activate button. Toolbar accepts
  // a mixed row of buttons cleanly. Active state goes on aria-current.
  return (
    <div className="tab-bar" role="toolbar" aria-label="Open notes" data-testid="tab-bar">
      <div className="tab-bar-list">
        {tabs.map((t) => {
          const note = notesById[t.noteId];
          const active = t.id === activeTabId;
          const title = note?.title.trim() || 'Untitled';
          const dirty = active && note ? activeBody !== note.body : false;
          return (
            <TabChip
              key={t.id}
              tab={t}
              title={title}
              updatedAt={note?.updatedAt}
              active={active}
              dirty={dirty}
              renaming={renamingId === t.id}
              onActivate={() => void activate(t.id)}
              onClose={() => void close(t.id)}
              onStartRename={() => active && setRenamingId(t.id)}
              onCommitRename={(value) => {
                if (note) void commitRename(note.id, value);
              }}
              onCancelRename={() => setRenamingId(null)}
            />
          );
        })}
      </div>
      <button
        type="button"
        className="tab-new fx-layer fx-scanline"
        title="New note"
        aria-label="New note"
        onClick={() => void newNote()}
        data-testid="tab-new"
      >
        +
      </button>
    </div>
  );
}

interface TabChipProps {
  tab: Tab;
  title: string;
  /** Note's `updatedAt` — undefined only while the note hasn't hydrated yet. */
  updatedAt: number | undefined;
  active: boolean;
  dirty: boolean;
  renaming: boolean;
  onActivate: () => void;
  onClose: () => void;
  onStartRename: () => void;
  onCommitRename: (value: string) => void;
  onCancelRename: () => void;
}

function TabChip({
  tab,
  title,
  updatedAt,
  active,
  dirty,
  renaming,
  onActivate,
  onClose,
  onStartRename,
  onCommitRename,
  onCancelRename,
}: TabChipProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(title);

  useEffect(() => {
    if (renaming) {
      setDraft(title);
      // Select-all so a double-click → type replaces the title in one go.
      queueMicrotask(() => inputRef.current?.select());
    }
  }, [renaming, title]);

  // Tooltip on the OUTER wrapper (not the inner button) so hovering any
  // part of the chip — including the padding around the close button —
  // surfaces it consistently. A `title` on both the wrapper and the child
  // button would make the browser show only whichever one the pointer is
  // precisely over, which reads as flaky rather than intentional.
  const hoverHint = updatedAt
    ? `${title} — updated ${formatRelativeTime(updatedAt)}. Double-click to rename.`
    : `${title} — double-click to rename.`;

  // a11y: the wrapper is a plain flex container; activate + close are
  // sibling <button>s inside, so neither nests an interactive element.
  return (
    <div
      className={`tab-chip fx-layer fx-scanline${active ? ' tab-chip--active' : ''}${dirty ? ' tab-chip--dirty' : ''}`}
      onClick={() => !renaming && !active && onActivate()}
      onDoubleClick={() => onStartRename()}
      title={renaming ? undefined : hoverHint}
      data-testid={`tab-${tab.id}`}
    >
      {renaming ? (
        <input
          ref={inputRef}
          className="tab-rename"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onCommitRename(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onCommitRename(draft);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onCancelRename();
            }
          }}
          aria-label="Rename tab"
          data-testid="tab-rename-input"
        />
      ) : (
        <button
          type="button"
          aria-current={active ? 'page' : undefined}
          className="tab-activate"
          onClick={() => !active && onActivate()}
        >
          <span
            className="tab-dot"
            aria-hidden="true"
            data-testid={dirty ? 'tab-dot-dirty' : 'tab-dot'}
          />
          <span className="tab-title">{title}</span>
        </button>
      )}
      {!renaming && (
        <button
          type="button"
          className="tab-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close"
          aria-label={`Close ${title}`}
          data-testid="tab-close"
        >
          ×
        </button>
      )}
    </div>
  );
}
