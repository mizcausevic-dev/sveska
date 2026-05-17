import { useEffect, useRef } from 'react';
import { findTriggerAt } from '@/notes/snippetsRepo';

/**
 * Watches the editor body + caret. When the text immediately to the left
 * of the caret ends with a saved snippet trigger (e.g. `;todo`), the
 * trigger is replaced with the snippet body and the caret moves to the
 * end of the expansion. Async (Dexie lookup) but fire-and-forget so it
 * doesn't block keystrokes.
 *
 * The expansion is debounced via a per-render ref so a single keystroke
 * that completes a trigger only fires the lookup once, even though
 * `body`/`selectionStart` change together. We use a "last lookup key"
 * to avoid re-expanding the same trigger position if the user types past
 * it without typing anything new (e.g. arrow-key navigation).
 */
interface Opts {
  body: string;
  selectionStart: number;
  onExpand: (nextBody: string, nextCursor: number) => void;
}

export function useSnippetExpand({ body, selectionStart, onExpand }: Opts): void {
  const lastKey = useRef<string>('');
  useEffect(() => {
    const prefix = body.slice(0, selectionStart);
    const key = `${selectionStart}:${prefix}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    let cancelled = false;
    void (async () => {
      const snippet = await findTriggerAt(prefix);
      if (cancelled || !snippet) return;
      const newPrefix = prefix.slice(0, prefix.length - snippet.trigger.length) + snippet.body;
      const nextBody = newPrefix + body.slice(selectionStart);
      const nextCursor = newPrefix.length;
      onExpand(nextBody, nextCursor);
    })();
    return () => {
      cancelled = true;
    };
  }, [body, selectionStart, onExpand]);
}
