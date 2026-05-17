import { create } from 'zustand';
import { db } from '@/notes/db';

/**
 * CTA-dismissal state (M6.T6.3). Each CTA has a stable id; dismissals are
 * remembered in Dexie's `prefs` table under key `cta.dismissed` so they
 * stick across reloads. The store hydrates on first read.
 */
const KEY = 'cta.dismissed';

interface CTAState {
  dismissed: Set<string>;
  ready: boolean;
  bootstrap: () => Promise<void>;
  isDismissed: (id: string) => boolean;
  dismiss: (id: string) => Promise<void>;
  /** Test-only: reset to empty without touching Dexie. */
  _reset: () => void;
}

export const useCTA = create<CTAState>((set, get) => ({
  dismissed: new Set(),
  ready: false,
  bootstrap: async () => {
    try {
      const row = await db().prefs.get(KEY);
      const arr = Array.isArray(row?.value) ? (row.value as string[]) : [];
      set({ dismissed: new Set(arr), ready: true });
    } catch {
      set({ ready: true });
    }
  },
  isDismissed: (id) => get().dismissed.has(id),
  dismiss: async (id) => {
    const next = new Set(get().dismissed);
    next.add(id);
    set({ dismissed: next });
    try {
      await db().prefs.put({ key: KEY, value: Array.from(next) });
    } catch (err) {
      console.warn('[cta] persist failed', err);
    }
  },
  _reset: () => set({ dismissed: new Set(), ready: false }),
}));
