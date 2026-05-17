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
} as const;

export const PREF_KEYS_EDITOR = {
  fontSize: 'editor.fontSize',
  lineHeight: 'editor.lineHeight',
  fontFamily: 'editor.fontFamily',
  spellcheck: 'editor.spellcheck',
  tabSize: 'editor.tabSize',
} as const;
