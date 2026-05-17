import { create } from 'zustand';

/**
 * Writing-session timer (M3.T3.6). Session-scoped — not persisted across
 * reloads (per ticket "Don't"). Counts up while the user is typing; auto-
 * pauses after 60s of input idle. Toggle start/stop manually too.
 */
const IDLE_AFTER_MS = 60_000;
const TICK_MS = 1_000;

interface TimerState {
  running: boolean;
  elapsedMs: number;
  lastInputAt: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  /** Editor calls this on every keystroke (cheap — no Dexie, no re-render). */
  registerInput: () => void;
  _tick: () => void;
}

export const useWritingTimer = create<TimerState>((set, get) => ({
  running: false,
  elapsedMs: 0,
  lastInputAt: 0,
  start: () => set({ running: true, lastInputAt: Date.now() }),
  stop: () => set({ running: false }),
  reset: () => set({ running: false, elapsedMs: 0, lastInputAt: 0 }),
  registerInput: () => {
    const s = get();
    set({ lastInputAt: Date.now(), running: s.running || s.elapsedMs === 0 });
  },
  _tick: () => {
    const s = get();
    if (!s.running) return;
    const now = Date.now();
    // Auto-pause when idle > IDLE_AFTER_MS — but only after we've ever
    // received input (lastInputAt > 0).
    if (s.lastInputAt > 0 && now - s.lastInputAt > IDLE_AFTER_MS) {
      set({ running: false });
      return;
    }
    set({ elapsedMs: s.elapsedMs + TICK_MS });
  },
}));

let intervalId: ReturnType<typeof setInterval> | null = null;
export function startWritingTimerTick(): void {
  if (intervalId !== null) return;
  intervalId = setInterval(() => useWritingTimer.getState()._tick(), TICK_MS);
}
export function stopWritingTimerTick(): void {
  if (intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

/** Format ms as `m:ss` (or `h:mm:ss` past an hour). */
export function formatTimer(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Count words in a body — shared with the word-goal progress bar. */
export function countWords(body: string): number {
  if (!body || !body.trim()) return 0;
  return body.trim().split(/\s+/).length;
}
