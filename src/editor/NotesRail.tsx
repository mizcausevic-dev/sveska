import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { type Directory, type Note } from '@/notes/db';
import { listNotes } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { useNotesRail, type RailFilter } from '@/notes/notesRailStore';
import { countUnprocessed } from '@/notes/inboxRepo';
import { openInbox, useInboxModal } from '@/ui/inboxModalStore';
import { openSearch } from '@/ui/searchModalStore';
import { importFiles } from '@/lib/importFiles';
import { useDirectories } from '@/notes/directoryStore';
import {
  directoryDescendantIds,
  flattenDirectories,
  type FlatDirectory,
} from '@/notes/directoryRepo';

const RECENT_LIMIT = 8;

/**
 * Left sidebar (M2.T2.4). Two sections:
 *  - **Pinned** — every pinned non-deleted note (no limit, sorted by updatedAt)
 *  - **Recent** — the next 8 most-recently-updated unpinned notes
 *
 * Filter dropdown narrows the visible set: All / Pinned / Untagged / #tag.
 * A header toggle collapses the rail to a narrow chevron so the editor gets
 * the full width when the user wants it.
 *
 * Subscribes to tabs-store mutations indirectly: every time `tabs` or
 * `activeNote` changes we re-fetch the note list. That covers rename, new,
 * pin toggle, tag change — anything that hits Dexie via the existing flows.
 */
export function NotesRail(): React.JSX.Element {
  const open = useNotesRail((s) => s.open);
  const filter = useNotesRail((s) => s.filter);
  const toggle = useNotesRail((s) => s.toggle);
  const setFilter = useNotesRail((s) => s.setFilter);

  const openNote = useTabs((s) => s.openNote);
  const tabs = useTabs((s) => s.tabs);
  const activeNote = useTabs((s) => s.activeNote);
  const inboxOpen = useInboxModal((s) => s.open);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [inboxCount, setInboxCount] = useState(0);
  const directories = useDirectories((s) => s.directories);
  const selectedDirectoryId = useDirectories((s) => s.selectedId);
  const selectDirectory = useDirectories((s) => s.select);
  const bootstrapDirectories = useDirectories((s) => s.bootstrap);

  useEffect(() => {
    void bootstrapDirectories();
  }, [bootstrapDirectories]);

  async function handleImport(files: FileList | File[] | null): Promise<void> {
    if (!files || (files instanceof FileList ? files.length === 0 : files.length === 0)) return;
    const { notes: created } = await importFiles(files);
    if (created.length === 0) return;
    setNotes(await listNotes());
    const first = created[0];
    if (first) await openNote(first.id);
  }

  useEffect(() => {
    void (async () => {
      setNotes(await listNotes());
    })();
  }, [
    tabs.length,
    activeNote?.id,
    activeNote?.title,
    activeNote?.pinned,
    activeNote?.tags,
    activeNote?.directoryId,
  ]);

  // Refresh the inbox badge whenever the inbox modal closes (most likely
  // moment a row was processed/added) or on first mount.
  useEffect(() => {
    if (inboxOpen) return;
    void (async () => {
      setInboxCount(await countUnprocessed());
    })();
  }, [inboxOpen]);

  const selectedDirectoryIds = useMemo(
    () => (selectedDirectoryId ? directoryDescendantIds(directories, selectedDirectoryId) : null),
    [directories, selectedDirectoryId],
  );
  const visible = useMemo(() => {
    const filtered = applyFilter(notes, filter);
    if (!selectedDirectoryIds) return filtered;
    return filtered.filter(
      (note) => note.directoryId !== null && selectedDirectoryIds.has(note.directoryId),
    );
  }, [filter, notes, selectedDirectoryIds]);
  const pinned = visible.filter((n) => n.pinned === 1);
  const recent = selectedDirectoryId
    ? visible.filter((n) => n.pinned !== 1)
    : visible.filter((n) => n.pinned !== 1).slice(0, RECENT_LIMIT);

  // Build the tag set across all notes for the filter dropdown.
  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const n of notes) for (const t of n.tags) s.add(t);
    return Array.from(s).sort();
  }, [notes]);

  if (!open) {
    return (
      <aside className="notes-rail notes-rail--collapsed" data-testid="notes-rail-collapsed">
        <button
          type="button"
          className="rail-toggle"
          onClick={toggle}
          aria-label="Open notes rail"
          title="Open notes rail"
          data-testid="rail-toggle"
        >
          »
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="notes-rail"
      aria-label="Notes"
      data-testid="notes-rail"
      onDragOver={(e) => {
        if (Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files.length > 0) {
          e.preventDefault();
          void handleImport(e.dataTransfer.files);
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.markdown,text/plain,text/markdown"
        multiple
        className="visually-hidden"
        onChange={(e) => {
          void handleImport(e.target.files);
          e.target.value = '';
        }}
        aria-label="Import notes from .txt or .md files"
        data-testid="rail-import-input"
      />
      <header className="rail-header">
        <span className="rail-title mono">Notes</span>
        <button
          type="button"
          className="rail-toggle"
          onClick={toggle}
          aria-label="Collapse notes rail"
          title="Collapse notes rail"
          data-testid="rail-toggle"
        >
          «
        </button>
      </header>
      <div className="rail-actions">
        <button
          type="button"
          className="snap-btn rail-action"
          onClick={openSearch}
          title="Search notes (Ctrl + P)"
          data-testid="rail-search"
        >
          Search · <span className="kbd">Ctrl+P</span>
        </button>
        <button
          type="button"
          className="snap-btn rail-action"
          onClick={openInbox}
          title="Open inbox (Ctrl + Shift + K)"
          data-testid="rail-inbox"
        >
          Inbox
          {inboxCount > 0 && (
            <span className="rail-badge" data-testid="inbox-badge">
              {inboxCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className="snap-btn rail-action"
          onClick={() => fileInputRef.current?.click()}
          title="Import .txt or .md files (or drag-drop onto the rail)"
          data-testid="rail-import"
        >
          Import…
        </button>
      </div>
      <DirectoryBrowser
        directories={directories}
        selectedId={selectedDirectoryId}
        onSelect={selectDirectory}
        onNotesMoved={async () => setNotes(await listNotes())}
      />
      <div className="rail-filter">
        <label htmlFor="rail-filter-select" className="visually-hidden">
          Filter notes
        </label>
        <select
          id="rail-filter-select"
          className="rail-filter-select mono"
          value={filterToValue(filter)}
          onChange={(e) => setFilter(valueToFilter(e.target.value))}
          data-testid="rail-filter"
        >
          <option value="all">All</option>
          <option value="pinned">Pinned</option>
          <option value="untagged">Untagged</option>
          {allTags.length > 0 && <option disabled>──── tags ────</option>}
          {allTags.map((t) => (
            <option key={t} value={`tag:${t}`}>
              #{t}
            </option>
          ))}
        </select>
      </div>

      {pinned.length > 0 && (
        <RailSection
          label="Pinned"
          notes={pinned}
          activeId={activeNote?.id ?? null}
          onSelect={(id) => void openNote(id)}
          testid="rail-pinned"
        />
      )}
      <RailSection
        label={selectedDirectoryId ? 'Notes' : 'Recent'}
        notes={recent}
        activeId={activeNote?.id ?? null}
        onSelect={(id) => void openNote(id)}
        testid="rail-recent"
        emptyHint={
          recent.length === 0 && pinned.length === 0 ? 'No notes match this filter.' : null
        }
      />
    </aside>
  );
}

interface DirectoryEditorState {
  kind: 'create' | 'rename';
  parentId: string | null;
  id: string | null;
  value: string;
}

function DirectoryBrowser({
  directories,
  selectedId,
  onSelect,
  onNotesMoved,
}: {
  directories: Directory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNotesMoved: () => Promise<void>;
}): React.JSX.Element {
  const create = useDirectories((s) => s.create);
  const rename = useDirectories((s) => s.rename);
  const remove = useDirectories((s) => s.remove);
  const rows = useMemo(() => flattenDirectories(directories), [directories]);
  const [editor, setEditor] = useState<DirectoryEditorState | null>(null);

  function beginCreate(parentId: string | null): void {
    setEditor({ kind: 'create', parentId, id: null, value: '' });
  }

  function beginRename(row: FlatDirectory): void {
    setEditor({
      kind: 'rename',
      parentId: row.parentId,
      id: row.id,
      value: row.name,
    });
  }

  async function commit(): Promise<void> {
    const name = editor?.value.trim();
    if (!editor || !name) return;
    if (editor.kind === 'create') {
      const created = await create(name, editor.parentId);
      onSelect(created.id);
    } else if (editor.id) {
      await rename(editor.id, name);
    }
    setEditor(null);
  }

  async function removeDirectory(row: FlatDirectory): Promise<void> {
    const confirmed = window.confirm(
      `Delete "${row.name}" and its subfolders? Notes will be moved to All notes.`,
    );
    if (!confirmed) return;
    await remove(row.id);
    await onNotesMoved();
  }

  return (
    <section className="directory-browser" aria-label="Directories" data-testid="directory-browser">
      <header className="directory-header">
        <span className="rail-section-label mono">Directories</span>
        <button
          type="button"
          className="directory-add"
          onClick={() => beginCreate(null)}
          aria-label="New top-level directory"
          title="New top-level directory"
          data-testid="directory-new-root"
        >
          + New
        </button>
      </header>
      {editor && (
        <div className="directory-editor" data-testid="directory-editor">
          <input
            type="text"
            value={editor.value}
            onChange={(event) =>
              setEditor((current) =>
                current ? { ...current, value: event.target.value } : current,
              )
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void commit();
              }
              if (event.key === 'Escape') setEditor(null);
            }}
            placeholder={editor.kind === 'create' ? 'Directory name…' : 'Rename directory…'}
            aria-label={editor.kind === 'create' ? 'Directory name' : 'Rename directory'}
            autoFocus
            data-testid="directory-name-input"
          />
          <button
            type="button"
            className="directory-editor-save"
            onClick={() => void commit()}
            disabled={!editor.value.trim()}
          >
            Save
          </button>
          <button type="button" className="directory-editor-cancel" onClick={() => setEditor(null)}>
            Cancel
          </button>
        </div>
      )}
      <ul className="directory-tree">
        <li>
          <button
            type="button"
            className={`directory-select${selectedId === null ? ' directory-select--active' : ''}`}
            onClick={() => onSelect(null)}
            data-testid="directory-all"
          >
            <span aria-hidden="true">⌂</span>
            <span>All notes</span>
          </button>
        </li>
        {rows.map((row) => (
          <li
            key={row.id}
            className="directory-row"
            style={{ '--directory-depth': row.depth } as CSSProperties}
          >
            <button
              type="button"
              className={`directory-select${
                selectedId === row.id ? ' directory-select--active' : ''
              }`}
              onClick={() => onSelect(row.id)}
              data-testid={`directory-${row.id}`}
            >
              <span aria-hidden="true">▱</span>
              <span className="directory-name">{row.name}</span>
            </button>
            <span className="directory-actions">
              <button
                type="button"
                onClick={() => beginCreate(row.id)}
                aria-label={`Add subdirectory to ${row.name}`}
                title="Add subdirectory"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => beginRename(row)}
                aria-label={`Rename ${row.name}`}
                title="Rename"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() => void removeDirectory(row)}
                aria-label={`Delete ${row.name}`}
                title="Delete directory"
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RailSection({
  label,
  notes,
  activeId,
  onSelect,
  testid,
  emptyHint = null,
}: {
  label: string;
  notes: Note[];
  activeId: string | null;
  onSelect: (id: string) => void;
  testid: string;
  emptyHint?: string | null;
}): React.JSX.Element {
  return (
    <section className="rail-section" data-testid={testid}>
      <h3 className="rail-section-label mono">{label}</h3>
      {notes.length === 0 && emptyHint && <p className="rail-empty">{emptyHint}</p>}
      <ul className="rail-list">
        {notes.map((n) => {
          const isActive = n.id === activeId;
          const title = n.title.trim() || 'Untitled';
          return (
            <li key={n.id}>
              <button
                type="button"
                className={`rail-item${isActive ? ' rail-item--active' : ''}`}
                onClick={() => onSelect(n.id)}
                data-testid={`rail-item-${n.id}`}
              >
                <span className="rail-item-title">{title}</span>
                {n.tags.length > 0 && (
                  <span className="rail-item-tags mono">
                    {n.tags
                      .slice(0, 3)
                      .map((t) => `#${t}`)
                      .join(' ')}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function applyFilter(notes: Note[], f: RailFilter): Note[] {
  switch (f.kind) {
    case 'all':
      return notes;
    case 'pinned':
      return notes.filter((n) => n.pinned === 1);
    case 'untagged':
      return notes.filter((n) => n.tags.length === 0);
    case 'tag':
      return notes.filter((n) => n.tags.includes(f.tag));
  }
}

function filterToValue(f: RailFilter): string {
  return f.kind === 'tag' ? `tag:${f.tag}` : f.kind;
}

function valueToFilter(v: string): RailFilter {
  if (v === 'pinned') return { kind: 'pinned' };
  if (v === 'untagged') return { kind: 'untagged' };
  if (v.startsWith('tag:')) return { kind: 'tag', tag: v.slice(4) };
  return { kind: 'all' };
}
