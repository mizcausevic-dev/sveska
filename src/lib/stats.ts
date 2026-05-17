/**
 * Note statistics. Pure functions, framework-free, fully covered by tests.
 * Used by the M1.T1.4 Statistics modal and (later) the word-count goal HUD (M3.6).
 *
 * Word definition: matches Unicode letters + numbers; underscores, apostrophes
 * inside a word ("don't") and hyphens ("twenty-one") count as part of the word.
 * Reading time = ceil(words / 230) — 230 wpm is the conservative-end avg for
 * mixed prose and is what notepad.js.org and Medium converge on.
 */

export interface NoteStats {
  words: number;
  chars: number;
  /** Characters with all whitespace stripped. */
  charsNoSpaces: number;
  lines: number;
  /** Blocks separated by one or more blank lines. */
  paragraphs: number;
  /** Math.ceil(words / 230) — 0 when body is empty. */
  readingMinutes: number;
  /** Distinct words, case-insensitive, after stripping leading/trailing punctuation. */
  uniqueWords: number;
}

const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}\p{Mn}\p{Mc}_'’-]*/gu;
const WHITESPACE_RE = /\s+/g;

const EMPTY: NoteStats = {
  words: 0,
  chars: 0,
  charsNoSpaces: 0,
  lines: 0,
  paragraphs: 0,
  readingMinutes: 0,
  uniqueWords: 0,
};

export function computeStats(body: string): NoteStats {
  if (body.length === 0) return EMPTY;

  const normalized = body.replace(/\r\n/g, '\n');
  const chars = normalized.length;
  const charsNoSpaces = normalized.replace(WHITESPACE_RE, '').length;
  const lines = normalized.split('\n').length;

  // A paragraph = a maximal run of non-blank lines. Trailing newline doesn't
  // create an extra paragraph. Whitespace-only lines count as blank.
  const paragraphs = normalized.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  const matches = normalized.match(WORD_RE) ?? [];
  const words = matches.length;

  const lowered = new Set<string>();
  for (const m of matches) {
    lowered.add(m.toLowerCase());
  }
  const uniqueWords = lowered.size;

  const readingMinutes = words === 0 ? 0 : Math.ceil(words / 230);

  return { words, chars, charsNoSpaces, lines, paragraphs, readingMinutes, uniqueWords };
}
