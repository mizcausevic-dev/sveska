import { useEffect, useRef, useState } from 'react';
import { type Tab, type Note } from '@/notes/db';
import { renameNote } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';

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

  return (
    <div className="tab-bar" role="tablist" aria-label="Open notes" data-testid="tab-bar">
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
      <button
        type="button"
        className="tab-new"
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

  return (
    <div
      role="tab"
      aria-selected={active}
      className={`tab-chip${active ? ' tab-chip--active' : ''}${dirty ? ' tab-chip--dirty' : ''}`}
      onClick={() => !renaming && !active && onActivate()}
      onDoubleClick={() => onStartRename()}
      data-testid={`tab-${tab.id}`}
    >
      <span
        className="tab-dot"
        aria-hidden="true"
        data-testid={dirty ? 'tab-dot-dirty' : 'tab-dot'}
      />
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
        <span className="tab-title" title={`${title} — double-click to rename`}>
          {title}
        </span>
      )}
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
    </div>
  );
}
