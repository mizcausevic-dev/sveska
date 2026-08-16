/**
 * Pure relative-time formatter for note-tab hover tooltips ("3 hours ago").
 * `Intl.RelativeTimeFormat` ships in every evergreen browser and in Node 20
 * (the CI runner), so no fallback/polyfill branch is needed.
 */
const RTF = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const UNITS: readonly { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

/**
 * `now` is a parameter (not `Date.now()` inline) so callers — and tests —
 * get a deterministic result instead of one that drifts with wall-clock time.
 */
export function formatRelativeTime(timestampMs: number, now: number = Date.now()): string {
  const deltaMs = timestampMs - now;
  if (Math.abs(deltaMs) < 45_000) return 'just now';
  for (const { unit, ms } of UNITS) {
    if (Math.abs(deltaMs) >= ms || unit === 'minute') {
      return RTF.format(Math.round(deltaMs / ms), unit);
    }
  }
  return 'just now';
}
