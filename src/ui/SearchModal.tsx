import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from './Modal';
import { listNotes } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { type Note } from '@/notes/db';
import { fuzzySearch, previewAround } from '@/lib/fuzzy';
import { closeSearch, useSearchModal } from './searchModalStore';

/**
 * Fuzzy search across all non-deleted notes (M2.T2.5). Opens via `Ctrl+P`.
 * Up / Down navigates the result list; Enter opens the highlighted note in a
 * new tab (or activates its existing tab); Escape closes the modal.
 *
 * The corpus is fetched once when the modal opens — for 1k notes the cost is
 * milliseconds and we'd rather pay it once than rebuild on every keystroke.
 */
export function SearchModalHost(): React.JSX.Element {
  const open = useSearchModal((s) => s.open);
  const openNote = useTabs((s) => s.openNote);

  const [query, setQuery] = useState('');
  const [corpus, setCorpus] = useState<Note[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedIdx(0);
    void (async () => {
      setCorpus(await listNotes());
    })();
  }, [open]);

  // Focus the input after open. queueMicrotask ensures the modal has mounted.
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo(() => fuzzySearch(corpus, query, 50), [corpus, query]);

  // Keep the selection in range when the query shrinks the result set.
  useEffect(() => {
    if (selectedIdx >= results.length) setSelectedIdx(Math.max(0, results.length - 1));
  }, [results.length, selectedIdx]);

  async function openSelected(): Promise<void> {
    const hit = results[selectedIdx];
    if (!hit) return;
    closeSearch();
    await openNote(hit.item.id);
  }

  function onKey(e: React.KeyboardEvent): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      void openSelected();
    }
  }

  return (
    <Modal open={open} onClose={closeSearch} title="Search notes" describedById="search-hint">
      <p id="search-hint" className="visually-hidden">
        Type to fuzzy-search across all note titles and bodies. Up / Down navigate, Enter opens.
      </p>
      <div className="search-shell" onKeyDown={onKey}>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Type to search title or body…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIdx(0);
          }}
          aria-label="Search query"
          data-testid="search-input"
        />
        <ul className="search-results" role="listbox" data-testid="search-results">
          {results.length === 0 && (
            <li className="search-empty" data-testid="search-empty">
              {corpus.length === 0 ? 'No notes yet.' : 'No matches.'}
            </li>
          )}
          {results.map((r, idx) => {
            const isSel = idx === selectedIdx;
            const title = r.item.title.trim() || 'Untitled';
            const preview =
              r.field === 'body'
                ? previewAround(r.item.body, r.matches[0])
                : r.item.body.slice(0, 80) || '';
            return (
              <li
                key={r.item.id}
                role="option"
                aria-selected={isSel}
                className={`search-row${isSel ? ' search-row--active' : ''}`}
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={() => void openSelected()}
                data-testid={`search-row-${r.item.id}`}
              >
                <div className="search-row-title">{title}</div>
                {preview && <div className="search-row-preview">{preview}</div>}
                {r.item.tags.length > 0 && (
                  <div className="search-row-tags mono">
                    {r.item.tags.map((t) => `#${t}`).join(' ')}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
