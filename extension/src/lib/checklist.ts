/**
 * Pure helpers for parsing/serializing/mutating checklist-mode note bodies.
 *
 * DUPLICATED verbatim from ../../../src/lib/checklist.ts (M3.T3.3 in the
 * PWA). Kept in sync manually. The parser has zero external deps and no
 * DOM/IndexedDB coupling — it's a pure `body: string` → `ParsedLine[]`
 * transformer. If the PWA version changes, mirror the change here.
 *
 * The Tasks tab in the extension is a UI over this parser.
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
  // Empty body → empty items. Without this, `''.split('\n')` returns
  // `['']` and we'd get a single empty passthrough that sits at index 0
  // and pushes appended tasks to index 1 — a subtle UI bug for the
  // "first task on a fresh list" path. Deliberate divergence from the
  // PWA's parser, kept minimal on purpose.
  if (body === '') return [];
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
 * Remove a line at `index`. Passthroughs are removed too (used by the
 * extension's row-delete button, which operates on full parsed indices).
 */
export function removeAt(items: readonly ParsedLine[], index: number): ParsedLine[] {
  if (index < 0 || index >= items.length) return items.slice();
  const next = items.slice();
  next.splice(index, 1);
  return next;
}

/** Append a new task at the end of the parsed list. */
export function appendTask(items: readonly ParsedLine[], text: string): ParsedLine[] {
  return [...items, { kind: 'task', indent: '', done: false, text }];
}
