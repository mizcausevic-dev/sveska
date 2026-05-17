import { describe, expect, it } from 'vitest';
import { diffLines, summarizeDiff } from '@/lib/diff';

describe('M2.T2.2 — diffLines (pure)', () => {
  it('empty / empty → no rows', () => {
    expect(diffLines('', '')).toEqual([]);
  });

  it('empty / non-empty → all additions on the right', () => {
    const rows = diffLines('', 'a\nb\nc');
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.left.type === null && r.right.type === 'add')).toBe(true);
    expect(rows.map((r) => r.right.text)).toEqual(['a', 'b', 'c']);
  });

  it('non-empty / empty → all deletions on the left', () => {
    const rows = diffLines('a\nb', '');
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.left.type === 'del' && r.right.type === null)).toBe(true);
  });

  it('identical text → all eq, no add/del', () => {
    const rows = diffLines('one\ntwo\nthree', 'one\ntwo\nthree');
    expect(rows.every((r) => r.left.type === 'eq' && r.right.type === 'eq')).toBe(true);
    expect(rows.map((r) => r.left.text)).toEqual(['one', 'two', 'three']);
    expect(rows.map((r) => r.right.text)).toEqual(['one', 'two', 'three']);
  });

  it('single-line edit shows a deletion + addition row', () => {
    const rows = diffLines('hello', 'hello world');
    const summary = summarizeDiff(rows);
    expect(summary.removed).toBe(1);
    expect(summary.added).toBe(1);
    expect(summary.unchanged).toBe(0);
  });

  it('aligned: inserted line in middle shows shared rows around an add', () => {
    const rows = diffLines('a\nb\nc', 'a\nNEW\nb\nc');
    // 4 rows: a (eq), gap+NEW (add), b (eq), c (eq)
    expect(rows).toHaveLength(4);
    expect(rows[0]?.left.type).toBe('eq');
    expect(rows[1]?.left.type).toBe(null);
    expect(rows[1]?.right.type).toBe('add');
    expect(rows[1]?.right.text).toBe('NEW');
    expect(rows[2]?.left.text).toBe('b');
    expect(rows[3]?.left.text).toBe('c');
  });

  it('aligned: deleted line in middle shows shared rows around a del', () => {
    const rows = diffLines('a\nold\nc', 'a\nc');
    expect(rows.find((r) => r.left.type === 'del' && r.left.text === 'old')).toBeDefined();
    const eqCount = rows.filter((r) => r.left.type === 'eq').length;
    expect(eqCount).toBe(2);
  });

  it('normalizes CRLF to LF (no spurious diff)', () => {
    const rows = diffLines('a\r\nb', 'a\nb');
    expect(rows.every((r) => r.left.type === 'eq')).toBe(true);
  });

  it('handles Unicode + diacritics as equal when identical (Bosnian)', () => {
    const rows = diffLines(
      'Prazna sveska.\nNajbolji početak.',
      'Prazna sveska.\nNajbolji početak.',
    );
    expect(rows.every((r) => r.left.type === 'eq')).toBe(true);
  });

  it('summarizeDiff: counts add/del/unchanged correctly', () => {
    const rows = diffLines('a\nb\nc', 'a\nz\nc\nd');
    const s = summarizeDiff(rows);
    expect(s.removed).toBe(1); // b
    expect(s.added).toBe(2); // z and d
    expect(s.unchanged).toBe(2); // a and c
  });

  it('line numbers are 1-based and follow the source side', () => {
    const rows = diffLines('a\nb\nc', 'a\nb\nz');
    const last = rows[rows.length - 1];
    // c was on left line 3; z on right line 3
    const dRow = rows.find((r) => r.left.text === 'c');
    const addRow = rows.find((r) => r.right.text === 'z');
    expect(dRow?.left.num).toBe(3);
    expect(addRow?.right.num).toBe(3);
    expect(last).toBeDefined();
  });
});
