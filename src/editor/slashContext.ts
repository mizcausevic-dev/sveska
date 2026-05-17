/**
 * Pure helper for M3.T3.1 slash-command detection.
 *
 * Returns the slash range + query when the textarea cursor is on a line
 * whose first character is `/` and the query so far has no whitespace.
 * Lives in its own file so the SlashCommands component can stay
 * component-only (react-refresh rule).
 */

export interface SlashContext {
  /** Absolute character offset where the slash sits. */
  start: number;
  /** Absolute character offset of the cursor (one past the last query char). */
  end: number;
  /** The query string between the slash and the cursor (exclusive of `/`). */
  query: string;
}

export function getSlashContext(value: string, selectionStart: number): SlashContext | null {
  let lineStart = selectionStart;
  while (lineStart > 0 && value[lineStart - 1] !== '\n') lineStart--;
  if (value[lineStart] !== '/') return null;
  const query = value.slice(lineStart + 1, selectionStart);
  if (/\s/.test(query)) return null;
  return { start: lineStart, end: selectionStart, query };
}
