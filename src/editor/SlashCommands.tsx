import { useEffect, useMemo, useState } from 'react';
import { buildCommandCatalog, type PaletteCommand } from '@/ui/commandCatalog';
import { fuzzySearch } from '@/lib/fuzzy';
import { getSlashContext } from './slashContext';

/**
 * Inline slash-command popover (M3.T3.1).
 *
 * Anchored to the editor textarea: when the cursor is on a line whose text
 * starts with `/` (and there's no whitespace before the slash on the same
 * line), this surface shows a filtered list of palette commands. Picking
 * one deletes the `/query` text from the textarea and runs the command.
 *
 * Detection lives in `slashContext.ts` so this file stays component-only.
 */

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  selectionStart: number;
  onApply: (nextValue: string, nextCursor: number) => void;
}

/**
 * Renders nothing when no slash context is active. When active, shows a
 * floating list anchored beneath the slash. Visibility, keyboard arrows
 * (↑/↓/Enter/Escape), and re-anchoring are handled here.
 */
export function SlashCommands({
  textareaRef,
  value,
  selectionStart,
  onApply,
}: Props): React.JSX.Element | null {
  const ctx = useMemo(() => getSlashContext(value, selectionStart), [value, selectionStart]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [catalog] = useState<PaletteCommand[]>(() => buildCommandCatalog());

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
    if (!ctx) return [];
    return fuzzySearch(indexed, ctx.query, 8).map((h) => h.item.cmd);
  }, [indexed, ctx]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [ctx?.query]);

  useEffect(() => {
    if (!ctx) return;
    const activeCtx = ctx;
    function onKey(e: KeyboardEvent): void {
      if (matches.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(matches.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        runIdx(selectedIdx);
      } else if (e.key === 'Escape') {
        // Let the user dismiss by typing a space.
        e.preventDefault();
        const next = value.slice(0, activeCtx.start) + ' ' + value.slice(activeCtx.end);
        onApply(next, activeCtx.start + 1);
      }
    }
    const el = textareaRef.current;
    el?.addEventListener('keydown', onKey);
    return () => el?.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.start, ctx?.end, matches, selectedIdx]);

  function runIdx(idx: number): void {
    if (!ctx) return;
    const cmd = matches[idx];
    if (!cmd) return;
    // Strip the slash + query from the textarea.
    const next = value.slice(0, ctx.start) + value.slice(ctx.end);
    onApply(next, ctx.start);
    // Defer so the textarea state commit happens before the command runs.
    queueMicrotask(() => cmd.run());
  }

  if (!ctx || matches.length === 0) return null;

  return (
    <div className="slash-popover" data-testid="slash-popover" role="listbox">
      {matches.map((cmd, idx) => {
        const isSel = idx === selectedIdx;
        return (
          <button
            key={cmd.id}
            type="button"
            role="option"
            aria-selected={isSel}
            className={`slash-row${isSel ? ' slash-row--active' : ''}`}
            onMouseEnter={() => setSelectedIdx(idx)}
            onClick={() => runIdx(idx)}
            data-testid={`slash-row-${cmd.id}`}
          >
            <span className="slash-group mono">{cmd.group}</span>
            <span className="slash-label">{cmd.label}</span>
            {cmd.shortcut && <span className="slash-shortcut mono">{cmd.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}
