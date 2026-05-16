import { create } from 'zustand';
import { getPref, PREF_KEYS, setPref } from '@/notes/prefs';
import { analytics } from './analytics';

export type ConsentState = 'unset' | 'granted' | 'denied';

interface ConsentStore {
  state: ConsentState;
  hydrate: () => Promise<void>;
  grant: () => Promise<void>;
  deny: () => Promise<void>;
}

export const useConsent = create<ConsentStore>((set) => ({
  state: 'unset',
  hydrate: async (): Promise<void> => {
    try {
      const saved = await getPref<ConsentState>(PREF_KEYS.consent);
      if (saved === 'granted' || saved === 'denied') set({ state: saved });
    } catch {
      // ignore — keep 'unset'
    }
  },
  grant: async (): Promise<void> => {
    set({ state: 'granted' });
    await setPref(PREF_KEYS.consent, 'granted');
    analytics().pageview(window.location.pathname);
  },
  deny: async (): Promise<void> => {
    set({ state: 'denied' });
    await setPref(PREF_KEYS.consent, 'denied');
  },
}));
