import { create } from 'zustand';
import { getPref, PREF_KEYS_UI, setPref } from './prefs';

/**
 * Global UI state that isn't theme. Persists to Dexie `prefs` table so it
 * survives reload. M1.T1.5 shipped `focus`; Phase 2 (2026-07-01) added
 * `density` (compact/comfortable/spacious, applied via `data-density` on
 * the root element and consumed by tokens.css) and `hideNotesRail`
 * (panel-visibility toggle for the notes rail sidebar).
 */

export type Density = 'compact' | 'comfortable' | 'spacious';
export type WorkspaceWidth = 'reading' | 'wide' | 'full';

export const DENSITY_OPTIONS: readonly Density[] = ['compact', 'comfortable', 'spacious'] as const;
export const DENSITY_LABEL: Record<Density, string> = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
};
export const WORKSPACE_WIDTH_OPTIONS: readonly WorkspaceWidth[] = ['reading', 'wide', 'full'];
export const WORKSPACE_WIDTH_LABEL: Record<WorkspaceWidth, string> = {
  reading: 'Reading',
  wide: 'Wide',
  full: 'Full',
};

interface UIState {
  focus: boolean;
  density: Density;
  hideNotesRail: boolean;
  workspaceWidth: WorkspaceWidth;
  setFocus: (focus: boolean) => Promise<void>;
  toggleFocus: () => Promise<void>;
  setDensity: (d: Density) => Promise<void>;
  setHideNotesRail: (hide: boolean) => Promise<void>;
  setWorkspaceWidth: (width: WorkspaceWidth) => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  focus: false,
  density: 'comfortable',
  hideNotesRail: false,
  workspaceWidth: 'full',
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
  setDensity: async (density): Promise<void> => {
    set({ density });
    applyDensityToDom(density);
    try {
      await setPref(PREF_KEYS_UI.density, density);
    } catch (err) {
      console.warn('[sveska] could not persist density:', err);
    }
  },
  setHideNotesRail: async (hide): Promise<void> => {
    set({ hideNotesRail: hide });
    try {
      await setPref(PREF_KEYS_UI.hideNotesRail, hide);
    } catch (err) {
      console.warn('[sveska] could not persist hideNotesRail:', err);
    }
  },
  setWorkspaceWidth: async (workspaceWidth): Promise<void> => {
    set({ workspaceWidth });
    try {
      await setPref(PREF_KEYS_UI.workspaceWidth, workspaceWidth);
    } catch (err) {
      console.warn('[sveska] could not persist workspaceWidth:', err);
    }
  },
}));

function applyFocusToDom(focus: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('focus-mode', focus);
}

/**
 * Density → data attribute on <html>. Tokens.css has selectors for
 * `[data-density="compact"]` and `[data-density="spacious"]`; the
 * comfortable default is expressed as absence-of-attribute so we remove
 * it in that case (matches the `system` theme pattern).
 */
function applyDensityToDom(density: Density): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (density === 'comfortable') {
    root.removeAttribute('data-density');
  } else {
    root.setAttribute('data-density', density);
  }
}

function isDensity(v: unknown): v is Density {
  return v === 'compact' || v === 'comfortable' || v === 'spacious';
}

function isWorkspaceWidth(v: unknown): v is WorkspaceWidth {
  return v === 'reading' || v === 'wide' || v === 'full';
}

/** Hydrate from Dexie before React mounts, same pattern as bootstrapTheme. */
export async function bootstrapUI(): Promise<void> {
  let focus = false;
  let density: Density = 'comfortable';
  let hideNotesRail = false;
  let workspaceWidth: WorkspaceWidth = 'full';
  try {
    const [savedFocus, savedDensity, savedHide, savedWorkspaceWidth] = await Promise.all([
      getPref<boolean>(PREF_KEYS_UI.focus),
      getPref<Density>(PREF_KEYS_UI.density),
      getPref<boolean>(PREF_KEYS_UI.hideNotesRail),
      getPref<WorkspaceWidth>(PREF_KEYS_UI.workspaceWidth),
    ]);
    if (savedFocus === true) focus = true;
    if (isDensity(savedDensity)) density = savedDensity;
    if (savedHide === true) hideNotesRail = true;
    if (isWorkspaceWidth(savedWorkspaceWidth)) workspaceWidth = savedWorkspaceWidth;
  } catch {
    // ignore — defaults are fine
  }
  applyFocusToDom(focus);
  applyDensityToDom(density);
  useUIStore.setState({ focus, density, hideNotesRail, workspaceWidth });
}
