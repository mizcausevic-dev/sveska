import { create } from 'zustand';
import { getPref, PREF_KEYS_EDITOR, setPref } from './prefs';

/**
 * Editor preferences (M1.T1.6). All persisted to Dexie `prefs` table, one
 * row per pref. Hydrated at app boot alongside theme + UI state, applied
 * via inline style on the textarea.
 */

export type FontFamily = 'mono' | 'serif' | 'ui' | 'dyslexic';

export interface EditorPrefs {
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
  spellcheck: boolean;
  tabSize: number;
}

export const DEFAULT_EDITOR_PREFS: EditorPrefs = {
  fontSize: 17,
  lineHeight: 1.7,
  fontFamily: 'mono',
  spellcheck: true,
  tabSize: 2,
};

export const FONT_FAMILY_CSS: Record<FontFamily, string> = {
  mono: 'var(--font-mono)',
  serif: 'var(--font-serif)',
  ui: 'var(--font-ui)',
  // OpenDyslexic isn't vendored yet (TODO in memory.md open decisions).
  // Falls through to UI font until then.
  dyslexic: '"OpenDyslexic", var(--font-ui)',
};

export const FONT_FAMILY_LABEL: Record<FontFamily, string> = {
  mono: 'Mono',
  serif: 'Serif',
  ui: 'Sans',
  dyslexic: 'Dyslexic',
};

interface EditorPrefsState extends EditorPrefs {
  setFontSize: (n: number) => Promise<void>;
  setLineHeight: (n: number) => Promise<void>;
  setFontFamily: (f: FontFamily) => Promise<void>;
  setSpellcheck: (b: boolean) => Promise<void>;
  setTabSize: (n: number) => Promise<void>;
  reset: () => Promise<void>;
}

async function persist<T>(key: string, value: T): Promise<void> {
  try {
    await setPref(key, value);
  } catch (err) {
    console.warn(`[sveska] could not persist ${key}:`, err);
  }
}

export const useEditorPrefs = create<EditorPrefsState>((set) => ({
  ...DEFAULT_EDITOR_PREFS,
  setFontSize: async (n) => {
    set({ fontSize: n });
    await persist(PREF_KEYS_EDITOR.fontSize, n);
  },
  setLineHeight: async (n) => {
    set({ lineHeight: n });
    await persist(PREF_KEYS_EDITOR.lineHeight, n);
  },
  setFontFamily: async (f) => {
    set({ fontFamily: f });
    await persist(PREF_KEYS_EDITOR.fontFamily, f);
  },
  setSpellcheck: async (b) => {
    set({ spellcheck: b });
    await persist(PREF_KEYS_EDITOR.spellcheck, b);
  },
  setTabSize: async (n) => {
    set({ tabSize: n });
    await persist(PREF_KEYS_EDITOR.tabSize, n);
  },
  reset: async () => {
    set(DEFAULT_EDITOR_PREFS);
    await Promise.all([
      persist(PREF_KEYS_EDITOR.fontSize, DEFAULT_EDITOR_PREFS.fontSize),
      persist(PREF_KEYS_EDITOR.lineHeight, DEFAULT_EDITOR_PREFS.lineHeight),
      persist(PREF_KEYS_EDITOR.fontFamily, DEFAULT_EDITOR_PREFS.fontFamily),
      persist(PREF_KEYS_EDITOR.spellcheck, DEFAULT_EDITOR_PREFS.spellcheck),
      persist(PREF_KEYS_EDITOR.tabSize, DEFAULT_EDITOR_PREFS.tabSize),
    ]);
  },
}));

/** Hydrate from Dexie before React mounts. Falls back to defaults on miss. */
export async function bootstrapEditorPrefs(): Promise<void> {
  try {
    const [fontSize, lineHeight, fontFamily, spellcheck, tabSize] = await Promise.all([
      getPref<number>(PREF_KEYS_EDITOR.fontSize),
      getPref<number>(PREF_KEYS_EDITOR.lineHeight),
      getPref<FontFamily>(PREF_KEYS_EDITOR.fontFamily),
      getPref<boolean>(PREF_KEYS_EDITOR.spellcheck),
      getPref<number>(PREF_KEYS_EDITOR.tabSize),
    ]);
    useEditorPrefs.setState({
      fontSize: typeof fontSize === 'number' ? fontSize : DEFAULT_EDITOR_PREFS.fontSize,
      lineHeight: typeof lineHeight === 'number' ? lineHeight : DEFAULT_EDITOR_PREFS.lineHeight,
      fontFamily: isFontFamily(fontFamily) ? fontFamily : DEFAULT_EDITOR_PREFS.fontFamily,
      spellcheck: typeof spellcheck === 'boolean' ? spellcheck : DEFAULT_EDITOR_PREFS.spellcheck,
      tabSize: typeof tabSize === 'number' ? tabSize : DEFAULT_EDITOR_PREFS.tabSize,
    });
  } catch {
    useEditorPrefs.setState(DEFAULT_EDITOR_PREFS);
  }
}

function isFontFamily(v: unknown): v is FontFamily {
  return v === 'mono' || v === 'serif' || v === 'ui' || v === 'dyslexic';
}
