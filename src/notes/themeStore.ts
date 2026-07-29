import { create } from 'zustand';
import { getPref, PREF_KEYS, setPref } from './prefs';

export type ThemeChoice = 'dark' | 'light' | 'system' | 'charcoal' | 'midnight' | 'sepia';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeState {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  setTheme: (choice: ThemeChoice) => Promise<void>;
}

const VALID: ReadonlySet<ThemeChoice> = new Set<ThemeChoice>([
  'dark',
  'light',
  'system',
  'charcoal',
  'midnight',
  'sepia',
]);

/** Named themes → their base brightness, for the theme-color meta + system detection. */
const BRIGHTNESS: Record<Exclude<ThemeChoice, 'system'>, ResolvedTheme> = {
  dark: 'dark',
  light: 'light',
  charcoal: 'dark',
  midnight: 'dark',
  sepia: 'light',
};

function osPrefersLight(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

function resolveChoice(choice: ThemeChoice): ResolvedTheme {
  if (choice === 'system') return osPrefersLight() ? 'light' : 'dark';
  return BRIGHTNESS[choice];
}

function applyDom(choice: ThemeChoice, resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (choice === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', choice);
  }
  // Keep <meta name="theme-color"> aligned with the resolved theme. Static
  // media-query meta tags in index.html cover the system-pref case.
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (meta) meta.content = resolved === 'dark' ? '#0C0C0E' : '#F4EFE6';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  choice: 'dark',
  resolved: 'dark',
  setTheme: async (choice: ThemeChoice): Promise<void> => {
    if (!VALID.has(choice)) return;
    const resolved = resolveChoice(choice);
    applyDom(choice, resolved);
    set({ choice, resolved });
    try {
      await setPref(PREF_KEYS.theme, choice);
    } catch (err) {
      console.warn('[sveska] could not persist theme to Dexie:', err);
    }
    // Refresh subscription to OS scheme changes when entering/leaving system mode.
    _wireSystemListener(get);
  },
}));

let _mql: MediaQueryList | null = null;
let _mqlHandler: ((e: MediaQueryListEvent) => void) | null = null;

function _wireSystemListener(get: () => ThemeState): void {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  if (_mql && _mqlHandler) _mql.removeEventListener('change', _mqlHandler);
  _mql = window.matchMedia('(prefers-color-scheme: light)');
  _mqlHandler = (): void => {
    if (get().choice !== 'system') return;
    const resolved: ResolvedTheme = osPrefersLight() ? 'light' : 'dark';
    applyDom('system', resolved);
    useThemeStore.setState({ resolved });
  };
  _mql.addEventListener('change', _mqlHandler);
}

/** Read persisted choice from Dexie and apply it. Called once at boot before React mounts. */
export async function bootstrapTheme(): Promise<void> {
  let stored: ThemeChoice = 'dark';
  try {
    const saved = await getPref<ThemeChoice>(PREF_KEYS.theme);
    if (saved && VALID.has(saved)) stored = saved;
  } catch {
    // Dexie unavailable — keep the dark default.
  }
  const resolved = resolveChoice(stored);
  applyDom(stored, resolved);
  useThemeStore.setState({ choice: stored, resolved });
  _wireSystemListener(useThemeStore.getState);
}
