import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from './Modal';
import { fuzzySearch } from '@/lib/fuzzy';
import { buildCommandCatalog, type PaletteCommand } from './commandCatalog';
import { closeCommandPalette, useCommandPalette } from './commandPaletteStore';

/**
 * Ctrl+K command palette (M3.T3.1). Lists every entry in the static catalog
 * and fuzzy-filters them as the user types. ↑ / ↓ navigates, Enter executes.
 *
 * The catalog is built fresh on every open via `buildCommandCatalog()` so the
 * `run` thunks see live store state (no stale captures from import time).
 */
export function CommandPaletteHost(): React.JSX.Element {
  const open = useCommandPalette((s) => s.open);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [catalog, setCatalog] = useState<PaletteCommand[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedIdx(0);
    setCatalog(buildCommandCatalog());
    queueMicrotask(() => inputRef.current?.focus());
  }, [open]);

  // The fuzzy scorer wants {id,title,body} — map each command into that shape
  // with `keywords` going into the body so prefix-of-keyword still hits.
  const indexed = useMemo(
    () =>
      catalog.map((c) => ({
        id: c.id,
        title: c.label,
        body: c.keywords ?? '',
        cmd: c,
      })),
    [catalog],
  );

  const matches = useMemo(() => {
    const hits = fuzzySearch(indexed, query, 30);
    return hits.map((h) => h.item.cmd);
  }, [indexed, query]);

  useEffect(() => {
    if (selectedIdx >= matches.length) setSelectedIdx(Math.max(0, matches.length - 1));
  }, [matches.length, selectedIdx]);

  function runSelected(): void {
    const cmd = matches[selectedIdx];
    if (!cmd) return;
    closeCommandPalette();
    // Defer so the modal-close state commit happens before the command's
    // own state changes (e.g. opening another modal).
    queueMicrotask(() => cmd.run());
  }

  function onKey(e: React.KeyboardEvent): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(matches.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runSelected();
    }
  }

  return (
    <Modal open={open} onClose={closeCommandPalette} title="Commands" describedById="palette-hint">
      <p id="palette-hint" className="visually-hidden">
        Type to fuzzy-search every available action. Up / Down navigate, Enter runs.
      </p>
      <div className="search-shell" onKeyDown={onKey}>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Type a command…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIdx(0);
          }}
          aria-label="Command query"
          data-testid="palette-input"
        />
        <ul className="search-results" role="listbox" data-testid="palette-results">
          {matches.length === 0 && (
            <li className="search-empty" data-testid="palette-empty">
              No commands match.
            </li>
          )}
          {matches.map((cmd, idx) => {
            const isSel = idx === selectedIdx;
            return (
              <li
                key={cmd.id}
                role="option"
                aria-selected={isSel}
                className={`search-row palette-row${isSel ? ' search-row--active' : ''}`}
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={runSelected}
                data-testid={`palette-row-${cmd.id}`}
              >
                <div className="palette-row-main">
                  <span className="palette-group mono">{cmd.group}</span>
                  <span className="palette-label">{cmd.label}</span>
                </div>
                {cmd.shortcut && <span className="palette-shortcut mono">{cmd.shortcut}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
