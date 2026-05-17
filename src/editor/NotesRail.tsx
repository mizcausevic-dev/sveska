import { useEffect, useMemo, useState } from 'react';
import { type Note } from '@/notes/db';
import { listNotes } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { useNotesRail, type RailFilter } from '@/notes/notesRailStore';
import { countUnprocessed } from '@/notes/inboxRepo';
import { openInbox, useInboxModal } from '@/ui/inboxModalStore';
import { openSearch } from '@/ui/searchModalStore';

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

  const [notes, setNotes] = useState<Note[]>([]);
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    void (async () => {
      setNotes(await listNotes());
    })();
  }, [tabs.length, activeNote?.id, activeNote?.title, activeNote?.pinned, activeNote?.tags]);

  // Refresh the inbox badge whenever the inbox modal closes (most likely
  // moment a row was processed/added) or on first mount.
  useEffect(() => {
    if (inboxOpen) return;
    void (async () => {
      setInboxCount(await countUnprocessed());
    })();
  }, [inboxOpen]);

  const visible = useMemo(() => applyFilter(notes, filter), [notes, filter]);
  const pinned = visible.filter((n) => n.pinned === 1);
  const recent = visible.filter((n) => n.pinned !== 1).slice(0, RECENT_LIMIT);

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
    <aside className="notes-rail" aria-label="Notes" data-testid="notes-rail">
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
      </div>
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
        label="Recent"
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
