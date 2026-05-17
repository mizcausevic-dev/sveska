/**
 * Hand-rolled fuzzy scorer for the M2.T2.5 note search.
 *
 * Why not fuse.js: the corpus is small (CLAUDE.md §6 AC: 1k notes ≈ 5MB
 * total). A subsequence match with positional bonuses hits the < 50ms
 * budget without pulling 12KB of vendor JS for the M2 bundle.
 *
 * Scoring (per candidate):
 *   - Required: every query char (lowercased) appears in order in the haystack
 *   - Base score = 1000 minus the index of the first matched char
 *   - +100 per match at a word boundary (start of string, or preceded by
 *     whitespace / `-` / `_` / `/`)
 *   - +60 per consecutive match streak char (rewards tight prefixes)
 *   - −1 per skipped char (rewards short queries hitting the start)
 *
 * The score sort is descending; ties break on shorter candidates first
 * (a short note title containing the match beats a 5KB body that does).
 */

export interface FuzzyMatch<T> {
  item: T;
  score: number;
  /** Index range pairs into the searched field, for hit highlighting later. */
  matches: ReadonlyArray<[number, number]>;
  /** Which field hit best — useful for the modal to render the right preview. */
  field: 'title' | 'body';
}

export interface Searchable {
  id: string;
  title: string;
  body: string;
}

const WORD_BOUNDARY_RE = /[\s\-_/.,;:!?(){}[\]]/;

interface FieldHit {
  score: number;
  matches: [number, number][];
}

function isWordStart(s: string, i: number): boolean {
  if (i === 0) return true;
  return WORD_BOUNDARY_RE.test(s[i - 1] ?? '');
}

function matchField(haystack: string, q: string): FieldHit | null {
  if (q.length === 0) {
    return { score: 0, matches: [] };
  }
  if (haystack.length === 0) return null;
  const hay = haystack.toLowerCase();
  const matches: [number, number][] = [];
  let qi = 0;
  let lastMatch = -2;
  let score = 1000;
  let firstMatchIdx = -1;
  for (let i = 0; i < hay.length && qi < q.length; i++) {
    if (hay[i] === q[qi]) {
      if (firstMatchIdx === -1) firstMatchIdx = i;
      if (i === lastMatch + 1) {
        score += 60;
        // Extend the prior range instead of pushing a singleton.
        const tail = matches[matches.length - 1];
        if (tail) tail[1] = i + 1;
      } else {
        matches.push([i, i + 1]);
        score -= i - lastMatch - 1;
      }
      if (isWordStart(hay, i)) score += 100;
      lastMatch = i;
      qi++;
    }
  }
  if (qi < q.length) return null;
  score -= firstMatchIdx;
  return { score, matches };
}

export function fuzzySearch<T extends Searchable>(
  items: readonly T[],
  query: string,
  limit = 50,
): FuzzyMatch<T>[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return items.slice(0, limit).map((item) => ({
      item,
      score: 0,
      matches: [],
      field: 'title' as const,
    }));
  }

  const results: FuzzyMatch<T>[] = [];
  for (const item of items) {
    const titleHit = matchField(item.title, q);
    const bodyHit = matchField(item.body, q);
    let best: FieldHit | null = null;
    let field: 'title' | 'body' = 'title';
    if (titleHit && (!bodyHit || titleHit.score + 80 >= bodyHit.score)) {
      // Title hits beat body hits unless the body scores meaningfully higher.
      best = { score: titleHit.score + 80, matches: titleHit.matches };
      field = 'title';
    } else if (bodyHit) {
      best = bodyHit;
      field = 'body';
    }
    if (!best) continue;
    results.push({ item, score: best.score, matches: best.matches, field });
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.title.length - b.item.title.length;
  });
  return results.slice(0, limit);
}

/** Cut a body preview around the first match for the search row. */
export function previewAround(
  body: string,
  match: [number, number] | undefined,
  width = 80,
): string {
  if (!match) return body.slice(0, width);
  const [start, end] = match;
  const half = Math.floor(width / 2);
  const from = Math.max(0, start - half);
  const to = Math.min(body.length, end + half);
  const prefix = from > 0 ? '…' : '';
  const suffix = to < body.length ? '…' : '';
  return prefix + body.slice(from, to) + suffix;
}
