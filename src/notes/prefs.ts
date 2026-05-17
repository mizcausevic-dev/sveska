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
} as const;
