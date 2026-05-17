import { describe, expect, it } from 'vitest';
import { fuzzySearch, previewAround, type Searchable } from '@/lib/fuzzy';

function mk(id: string, title: string, body = ''): Searchable {
  return { id, title, body };
}

describe('M2.T2.5 — fuzzySearch', () => {
  it('returns all items in original order for an empty query', () => {
    const corpus = [mk('a', 'Alpha'), mk('b', 'Beta'), mk('c', 'Gamma')];
    const out = fuzzySearch(corpus, '');
    expect(out.map((m) => m.item.id)).toEqual(['a', 'b', 'c']);
  });

  it('matches subsequence across a title', () => {
    const corpus = [mk('1', 'meeting notes 2026'), mk('2', 'unrelated')];
    const out = fuzzySearch(corpus, 'mtg');
    expect(out[0]?.item.id).toBe('1');
    expect(out.find((r) => r.item.id === '2')).toBeUndefined();
  });

  it('title hits outrank body hits for the same query', () => {
    const corpus = [
      mk('body-only', 'Random title', 'this body contains alpha somewhere'),
      mk('title-hit', 'alpha priority', 'no body here'),
    ];
    const out = fuzzySearch(corpus, 'alpha');
    expect(out[0]?.item.id).toBe('title-hit');
  });

  it('word-start bonuses favor matches that hit word boundaries', () => {
    // 'pa' against 'opacity' (mid-word) vs 'park bench' (word-start) — the
    // word-start hit should outrank the mid-word hit even though both match.
    const corpus = [mk('a', 'opacity rules'), mk('b', 'park bench')];
    const out = fuzzySearch(corpus, 'pa');
    expect(out[0]?.item.id).toBe('b');
  });

  it('shorter titles break score ties', () => {
    const corpus = [mk('long', 'foooobar baseline weight', ''), mk('short', 'foo', '')];
    const out = fuzzySearch(corpus, 'foo');
    expect(out[0]?.item.id).toBe('short');
  });

  it('returns hit ranges for highlighting', () => {
    const corpus = [mk('a', 'meeting notes')];
    const out = fuzzySearch(corpus, 'mtg');
    expect(out[0]?.matches.length).toBeGreaterThan(0);
  });

  it('handles 1k notes in well under 50ms (perf budget)', () => {
    const corpus: Searchable[] = [];
    for (let i = 0; i < 1000; i++) {
      const body =
        'lorem ipsum dolor sit amet consectetur adipiscing elit ' +
        'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua '.repeat(20);
      corpus.push(mk(`n${i}`, `note ${i} project meeting`, body + ` keyword-${i}`));
    }
    const t0 = performance.now();
    const out = fuzzySearch(corpus, 'meet');
    const elapsed = performance.now() - t0;
    expect(out.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(50);
  });

  it('respects limit', () => {
    const corpus = Array.from({ length: 200 }, (_, i) => mk(`n${i}`, `alpha ${i}`));
    expect(fuzzySearch(corpus, 'alpha', 25).length).toBe(25);
  });
});

describe('M2.T2.5 — previewAround', () => {
  it('clips around a match with ellipses', () => {
    const body = 'a'.repeat(100) + 'TARGET' + 'b'.repeat(100);
    const preview = previewAround(body, [100, 106], 40);
    expect(preview).toContain('TARGET');
    expect(preview.startsWith('…') && preview.endsWith('…')).toBe(true);
  });

  it('returns the head of the body when no match is given', () => {
    const preview = previewAround('hello world long body', undefined, 11);
    expect(preview).toBe('hello world');
  });
});
