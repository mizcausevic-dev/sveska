import { useEffect, useMemo, useRef, useState } from 'react';
import { closeFindReplace, useFindReplace } from './findReplaceStore';

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  body: string;
  onBodyChange: (next: string, caret: number) => void;
}

/**
 * Inline Find & Replace bar (M3.T3.6). Anchored at the top of the
 * editor-input-wrap, opens on Ctrl+F. Find Next selects the next match in
 * the textarea (wraps to start). Replace swaps the current selection;
 * Replace All rewrites the body.
 *
 * Case-insensitive by default; a checkbox toggles case-sensitive search.
 * Search uses literal substring matching (no regex) — keeps the surface
 * forgiving and the implementation small.
 */
export function FindReplaceBar({
  textareaRef,
  body,
  onBodyChange,
}: Props): React.JSX.Element | null {
  const open = useFindReplace((s) => s.open);
  const findRef = useRef<HTMLInputElement>(null);
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => findRef.current?.focus());
  }, [open]);

  const matches = useMemo(() => countMatches(body, find, matchCase), [body, find, matchCase]);

  function findNext(): void {
    if (!find) return;
    const el = textareaRef.current;
    if (!el) return;
    const from = el.selectionEnd ?? 0;
    const idx = indexOfCase(body, find, from, matchCase);
    const wrapIdx = idx === -1 ? indexOfCase(body, find, 0, matchCase) : idx;
    if (wrapIdx === -1) return;
    el.focus();
    el.setSelectionRange(wrapIdx, wrapIdx + find.length);
  }

  function doReplace(): void {
    const el = textareaRef.current;
    if (!el || !find) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = body.slice(start, end);
    // If the current selection IS the find target, swap it. Otherwise, jump
    // to the next match first (matches editor convention).
    const selectionMatches = matchCase
      ? selected === find
      : selected.toLowerCase() === find.toLowerCase();
    if (!selectionMatches) {
      findNext();
      return;
    }
    const next = body.slice(0, start) + replace + body.slice(end);
    onBodyChange(next, start + replace.length);
    // Move to the next match after the replacement.
    requestAnimationFrame(findNext);
  }

  function replaceAll(): void {
    if (!find) return;
    if (matchCase) {
      onBodyChange(body.split(find).join(replace), 0);
    } else {
      const re = new RegExp(escapeRegex(find), 'gi');
      onBodyChange(body.replace(re, replace), 0);
    }
  }

  if (!open) return null;

  return (
    <div className="find-bar" role="dialog" aria-label="Find and replace" data-testid="find-bar">
      <input
        ref={findRef}
        type="text"
        className="find-input"
        placeholder="Find…"
        value={find}
        onChange={(e) => setFind(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            findNext();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            closeFindReplace();
          }
        }}
        aria-label="Search query"
        data-testid="find-input"
      />
      <input
        type="text"
        className="find-input"
        placeholder="Replace…"
        value={replace}
        onChange={(e) => setReplace(e.target.value)}
        aria-label="Replacement"
        data-testid="replace-input"
      />
      <label className="find-case">
        <input
          type="checkbox"
          checked={matchCase}
          onChange={(e) => setMatchCase(e.target.checked)}
          data-testid="find-case"
        />
        <span>Aa</span>
      </label>
      <span className="find-count mono" data-testid="find-count">
        {find ? `${matches} match${matches === 1 ? '' : 'es'}` : '—'}
      </span>
      <button
        type="button"
        className="snap-btn"
        onClick={findNext}
        disabled={!find}
        data-testid="find-next"
      >
        Next
      </button>
      <button
        type="button"
        className="snap-btn"
        onClick={doReplace}
        disabled={!find}
        data-testid="find-replace"
      >
        Replace
      </button>
      <button
        type="button"
        className="snap-btn"
        onClick={replaceAll}
        disabled={!find}
        data-testid="find-replace-all"
      >
        All
      </button>
      <button
        type="button"
        className="snap-btn"
        onClick={closeFindReplace}
        aria-label="Close find bar"
        data-testid="find-close"
        title="Close (Esc)"
      >
        ×
      </button>
    </div>
  );
}

function indexOfCase(hay: string, needle: string, from: number, matchCase: boolean): number {
  if (matchCase) return hay.indexOf(needle, from);
  return hay.toLowerCase().indexOf(needle.toLowerCase(), from);
}

function countMatches(hay: string, needle: string, matchCase: boolean): number {
  if (!needle) return 0;
  if (matchCase) return hay.split(needle).length - 1;
  return hay.toLowerCase().split(needle.toLowerCase()).length - 1;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
