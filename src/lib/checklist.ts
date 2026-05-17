/**
 * Pure helpers for the M3.T3.3 checklist mode.
 *
 * The source of truth stays the textarea body. Lines that match the
 * GitHub-flavored checkbox grammar (`[indent]- [ ] text` / `- [x] text`)
 * become interactive `Item` rows. Non-matching lines are preserved as
 * "passthrough" items so reordering doesn't drop or mangle prose lines.
 *
 * Why parse → mutate → serialize instead of mutating substring offsets:
 * indentation can shift after a toggle (e.g. `- [ ]` → `- [x]` is a single
 * char, but future enhancements like “demote one level” change widths),
 * and reorder operations move whole lines around. Round-tripping through
 * a typed array of items keeps each mutation a 5-line function.
 */

export interface ChecklistItem {
  kind: 'task';
  /** Raw whitespace before the `-` so we preserve indentation exactly. */
  indent: string;
  done: boolean;
  text: string;
}

export interface PassthroughLine {
  kind: 'passthrough';
  text: string;
}

export type ParsedLine = ChecklistItem | PassthroughLine;

// `[indent]- [ ]` / `- [x]` / `- [X]` (case-insensitive done marker).
// Capture: 1 indent, 2 done-marker, 3 text after the space.
const TASK_RE = /^([ \t]*)- \[([ xX])\] ?(.*)$/;

export function parseChecklist(body: string): ParsedLine[] {
  const lines = body.split('\n');
  return lines.map((line) => {
    const m = TASK_RE.exec(line);
    if (!m) return { kind: 'passthrough', text: line };
    return {
      kind: 'task',
      indent: m[1] ?? '',
      done: (m[2] ?? ' ').toLowerCase() === 'x',
      text: m[3] ?? '',
    };
  });
}

export function serializeChecklist(items: readonly ParsedLine[]): string {
  return items
    .map((item) => {
      if (item.kind === 'passthrough') return item.text;
      const mark = item.done ? 'x' : ' ';
      return `${item.indent}- [${mark}] ${item.text}`;
    })
    .join('\n');
}

/** Toggle the done state of the task at `index`. No-op for passthrough lines. */
export function toggleAt(items: readonly ParsedLine[], index: number): ParsedLine[] {
  return items.map((item, i) => {
    if (i !== index || item.kind !== 'task') return item;
    return { ...item, done: !item.done };
  });
}

/**
 * Move the row at `from` so it sits at `to` after the move. Both indices
 * are positions in the FULL parsed-line array, not "task-only" indices —
 * matching the data-attribute the DOM uses. Passthrough lines move with
 * their neighbors so we don't lose blank-line separators.
 */
export function moveLine(items: readonly ParsedLine[], from: number, to: number): ParsedLine[] {
  if (from === to) return items.slice();
  if (from < 0 || from >= items.length) return items.slice();
  const clamped = Math.max(0, Math.min(items.length - 1, to));
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  if (!moved) return items.slice();
  next.splice(clamped, 0, moved);
  return next;
}

/** Count how many tasks are done / total. Used in the filter footer. */
export interface ChecklistSummary {
  total: number;
  done: number;
}

export function summarize(items: readonly ParsedLine[]): ChecklistSummary {
  let total = 0;
  let done = 0;
  for (const item of items) {
    if (item.kind !== 'task') continue;
    total++;
    if (item.done) done++;
  }
  return { total, done };
}
