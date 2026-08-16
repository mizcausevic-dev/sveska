import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from '@/lib/relativeTime';

const NOW = new Date('2026-08-16T12:00:00.000Z').getTime();

describe('formatRelativeTime — note-tab tooltip strings', () => {
  it('collapses anything under 45s to "just now"', () => {
    expect(formatRelativeTime(NOW - 10_000, NOW)).toBe('just now');
    expect(formatRelativeTime(NOW - 44_000, NOW)).toBe('just now');
  });

  it('minutes ago', () => {
    expect(formatRelativeTime(NOW - 3 * 60_000, NOW)).toBe('3 minutes ago');
  });

  it('hours ago', () => {
    expect(formatRelativeTime(NOW - 5 * 60 * 60_000, NOW)).toBe('5 hours ago');
  });

  it('exactly one day back reads as "yesterday"', () => {
    expect(formatRelativeTime(NOW - 24 * 60 * 60_000, NOW)).toBe('yesterday');
  });

  it('multiple days ago', () => {
    expect(formatRelativeTime(NOW - 3 * 24 * 60 * 60_000, NOW)).toBe('3 days ago');
  });

  it('weeks ago', () => {
    expect(formatRelativeTime(NOW - 14 * 24 * 60 * 60_000, NOW)).toBe('2 weeks ago');
  });

  it('is stable given an explicit `now` — no wall-clock flakiness', () => {
    const a = formatRelativeTime(NOW - 60 * 60_000, NOW);
    const b = formatRelativeTime(NOW - 60 * 60_000, NOW);
    expect(a).toBe(b);
  });
});
