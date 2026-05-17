import { create } from 'zustand';
import { getPref, PREF_KEYS_UI, setPref } from './prefs';

/**
 * Global UI state that isn't theme. Persists to Dexie `prefs` table so it
 * survives reload. M1.T1.5 only needs `focus`; later tickets can extend with
 * typewriter mode (M3.5), word-count goal (M3.6), etc.
 */

interface UIState {
  focus: boolean;
  setFocus: (focus: boolean) => Promise<void>;
  toggleFocus: () => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  focus: false,
  setFocus: async (focus): Promise<void> => {
    set({ focus });
    applyFocusToDom(focus);
    try {
      await setPref(PREF_KEYS_UI.focus, focus);
    } catch (err) {
      console.warn('[sveska] could not persist focus mode:', err);
    }
  },
  toggleFocus: async (): Promise<void> => {
    await get().setFocus(!get().focus);
  },
}));

function applyFocusToDom(focus: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('focus-mode', focus);
}

/** Hydrate from Dexie before React mounts, same pattern as bootstrapTheme. */
export async function bootstrapUI(): Promise<void> {
  let focus = false;
  try {
    const saved = await getPref<boolean>(PREF_KEYS_UI.focus);
    if (saved === true) focus = true;
  } catch {
    // ignore — defaults to non-focus
  }
  applyFocusToDom(focus);
  useUIStore.setState({ focus });
}
