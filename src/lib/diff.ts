/**
 * Line-level diff for the M2.T2.2 version-history view.
 *
 * Classic Hunt–McIlroy: build an LCS table then backtrack to emit aligned
 * rows. O(n·m) time / memory which is fine for note bodies (typical M2 sizes:
 * a few hundred lines; the 50k-char budget from CLAUDE.md §0 is ~600 lines of
 * typical prose). No deps — own this so we control the visual mapping exactly.
 *
 * Output is *row-aligned* for side-by-side rendering: each DiffRow is one
 * visual row in the UI. Equal rows fill both sides; deletions fill only the
 * left; additions fill only the right; both sides hold a `null` text for the
 * gap. That lets the renderer use a single CSS grid with two columns and
 * never have to worry about wrap-induced misalignment.
 */

export type SideType = 'eq' | 'del' | 'add' | null;

export interface DiffSide {
  text: string | null;
  type: SideType;
  /** 1-based line number in the source, or null if this side is a gap. */
  num: number | null;
}

export interface DiffRow {
  left: DiffSide;
  right: DiffSide;
}

const GAP: DiffSide = { text: null, type: null, num: null };

export function diffLines(oldText: string, newText: string): DiffRow[] {
  const a = normalizeLines(oldText);
  const b = normalizeLines(newText);

  // Trivial edge cases
  if (a.length === 0 && b.length === 0) return [];
  if (a.length === 0) {
    return b.map((line, i) => ({
      left: GAP,
      right: { text: line, type: 'add', num: i + 1 },
    }));
  }
  if (b.length === 0) {
    return a.map((line, i) => ({
      left: { text: line, type: 'del', num: i + 1 },
      right: GAP,
    }));
  }

  const dp = buildLCS(a, b);
  return backtrack(dp, a, b);
}

function normalizeLines(text: string): string[] {
  if (text.length === 0) return [];
  return text.replace(/\r\n/g, '\n').split('\n');
}

function buildLCS(a: string[], b: string[]): number[][] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const ai = a[i - 1];
    for (let j = 1; j <= m; j++) {
      const prevRow = dp[i - 1]!;
      const curRow = dp[i]!;
      if (ai === b[j - 1]) {
        curRow[j] = (prevRow[j - 1] ?? 0) + 1;
      } else {
        curRow[j] = Math.max(prevRow[j] ?? 0, curRow[j - 1] ?? 0);
      }
    }
  }
  return dp;
}

function backtrack(dp: number[][], a: string[], b: string[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let i = a.length;
  let j = b.length;

  const at = (row: number, col: number): number => dp[row]?.[col] ?? 0;

  while (i > 0 && j > 0) {
    const aLine = a[i - 1]!;
    const bLine = b[j - 1]!;
    if (aLine === bLine) {
      rows.push({
        left: { text: aLine, type: 'eq', num: i },
        right: { text: bLine, type: 'eq', num: j },
      });
      i--;
      j--;
    } else if (at(i - 1, j) >= at(i, j - 1)) {
      rows.push({
        left: { text: aLine, type: 'del', num: i },
        right: GAP,
      });
      i--;
    } else {
      rows.push({
        left: GAP,
        right: { text: bLine, type: 'add', num: j },
      });
      j--;
    }
  }
  while (i > 0) {
    rows.push({
      left: { text: a[i - 1]!, type: 'del', num: i },
      right: GAP,
    });
    i--;
  }
  while (j > 0) {
    rows.push({
      left: GAP,
      right: { text: b[j - 1]!, type: 'add', num: j },
    });
    j--;
  }

  return rows.reverse();
}

/** Compact summary: how many added / removed lines, total touched. */
export interface DiffSummary {
  added: number;
  removed: number;
  unchanged: number;
}

export function summarizeDiff(rows: DiffRow[]): DiffSummary {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const r of rows) {
    if (r.left.type === 'eq') unchanged++;
    if (r.left.type === 'del') removed++;
    if (r.right.type === 'add') added++;
  }
  return { added, removed, unchanged };
}
