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
  /** T3.5 — keep the active line centered in the textarea viewport. */
  typewriter: boolean;
  /** T3.5 — play a short WebAudio click on each keystroke. Default OFF. */
  sounds: boolean;
  /** 0–1 volume for typing sounds. */
  soundVolume: number;
}

export const DEFAULT_EDITOR_PREFS: EditorPrefs = {
  fontSize: 17,
  lineHeight: 1.7,
  fontFamily: 'mono',
  spellcheck: true,
  tabSize: 2,
  typewriter: false,
  sounds: false,
  soundVolume: 0.4,
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
  setTypewriter: (b: boolean) => Promise<void>;
  setSounds: (b: boolean) => Promise<void>;
  setSoundVolume: (n: number) => Promise<void>;
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
  setTypewriter: async (b) => {
    set({ typewriter: b });
    await persist(PREF_KEYS_EDITOR.typewriter, b);
  },
  setSounds: async (b) => {
    set({ sounds: b });
    await persist(PREF_KEYS_EDITOR.sounds, b);
  },
  setSoundVolume: async (n) => {
    const clamped = Math.max(0, Math.min(1, n));
    set({ soundVolume: clamped });
    await persist(PREF_KEYS_EDITOR.soundVolume, clamped);
  },
  reset: async () => {
    set(DEFAULT_EDITOR_PREFS);
    await Promise.all([
      persist(PREF_KEYS_EDITOR.fontSize, DEFAULT_EDITOR_PREFS.fontSize),
      persist(PREF_KEYS_EDITOR.lineHeight, DEFAULT_EDITOR_PREFS.lineHeight),
      persist(PREF_KEYS_EDITOR.fontFamily, DEFAULT_EDITOR_PREFS.fontFamily),
      persist(PREF_KEYS_EDITOR.spellcheck, DEFAULT_EDITOR_PREFS.spellcheck),
      persist(PREF_KEYS_EDITOR.tabSize, DEFAULT_EDITOR_PREFS.tabSize),
      persist(PREF_KEYS_EDITOR.typewriter, DEFAULT_EDITOR_PREFS.typewriter),
      persist(PREF_KEYS_EDITOR.sounds, DEFAULT_EDITOR_PREFS.sounds),
      persist(PREF_KEYS_EDITOR.soundVolume, DEFAULT_EDITOR_PREFS.soundVolume),
    ]);
  },
}));

/** Hydrate from Dexie before React mounts. Falls back to defaults on miss. */
export async function bootstrapEditorPrefs(): Promise<void> {
  try {
    const [fontSize, lineHeight, fontFamily, spellcheck, tabSize, typewriter, sounds, soundVolume] =
      await Promise.all([
        getPref<number>(PREF_KEYS_EDITOR.fontSize),
        getPref<number>(PREF_KEYS_EDITOR.lineHeight),
        getPref<FontFamily>(PREF_KEYS_EDITOR.fontFamily),
        getPref<boolean>(PREF_KEYS_EDITOR.spellcheck),
        getPref<number>(PREF_KEYS_EDITOR.tabSize),
        getPref<boolean>(PREF_KEYS_EDITOR.typewriter),
        getPref<boolean>(PREF_KEYS_EDITOR.sounds),
        getPref<number>(PREF_KEYS_EDITOR.soundVolume),
      ]);
    useEditorPrefs.setState({
      fontSize: typeof fontSize === 'number' ? fontSize : DEFAULT_EDITOR_PREFS.fontSize,
      lineHeight: typeof lineHeight === 'number' ? lineHeight : DEFAULT_EDITOR_PREFS.lineHeight,
      fontFamily: isFontFamily(fontFamily) ? fontFamily : DEFAULT_EDITOR_PREFS.fontFamily,
      spellcheck: typeof spellcheck === 'boolean' ? spellcheck : DEFAULT_EDITOR_PREFS.spellcheck,
      tabSize: typeof tabSize === 'number' ? tabSize : DEFAULT_EDITOR_PREFS.tabSize,
      typewriter: typeof typewriter === 'boolean' ? typewriter : DEFAULT_EDITOR_PREFS.typewriter,
      sounds: typeof sounds === 'boolean' ? sounds : DEFAULT_EDITOR_PREFS.sounds,
      soundVolume: typeof soundVolume === 'number' ? soundVolume : DEFAULT_EDITOR_PREFS.soundVolume,
    });
  } catch {
    useEditorPrefs.setState(DEFAULT_EDITOR_PREFS);
  }
}

function isFontFamily(v: unknown): v is FontFamily {
  return v === 'mono' || v === 'serif' || v === 'ui' || v === 'dyslexic';
}
