import { db } from './db';

export async function getPref<T>(key: string): Promise<T | undefined> {
  const row = await db().prefs.get(key);
  return row?.value as T | undefined;
}

export async function setPref<T>(key: string, value: T): Promise<void> {
  await db().prefs.put({ key, value });
}

export const PREF_KEYS = {
  theme: 'theme',
  consent: 'consent',
} as const;

export const PREF_KEYS_UI = {
  focus: 'ui.focus',
  restoreSession: 'ui.restoreSession',
  // Phase 2 chrome-preferences (2026-07-01): density preset + notes-rail
  // visibility toggle. Both apply via html attribute + persist in Dexie.
  density: 'ui.density',
  hideNotesRail: 'ui.hideNotesRail',
  workspaceWidth: 'ui.workspaceWidth',
} as const;

export const PREF_KEYS_EDITOR = {
  fontSize: 'editor.fontSize',
  lineHeight: 'editor.lineHeight',
  fontFamily: 'editor.fontFamily',
  spellcheck: 'editor.spellcheck',
  tabSize: 'editor.tabSize',
  typewriter: 'editor.typewriter',
  sounds: 'editor.sounds',
  soundVolume: 'editor.soundVolume',
  paper: 'editor.paper',
  wordGoal: 'editor.wordGoal',
  richEditor: 'editor.richEditor',
} as const;
