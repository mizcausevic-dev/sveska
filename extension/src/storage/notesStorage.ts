/// <reference types="chrome" />
import { newNoteId } from '../lib/id';
import type { Note } from '../types/note';

/**
 * chrome.storage.local wrapper for the extension's note store.
 *
 * Data model choice: a single key (`sveska:v1:notes`) holds Note[], read
 * and written whole. For a side panel the working set is <200 notes,
 * <10 KB total in practice; per-key CRUD is overkill and per-item indexing
 * (à la Dexie) would just duplicate the browser's cost. If the extension
 * ever grows an attachment surface, revisit.
 *
 * Versioned prefix (`v1`) leaves room for a schema migration later without
 * needing to invent a migrations table. Each accessor takes a fallback so
 * a fresh install returns sane defaults rather than undefined.
 */

const K = {
  notes: 'sveska:v1:notes',
  activeNoteId: 'sveska:v1:activeNoteId',
  activeTab: 'sveska:v1:activeTab',
  theme: 'sveska:v1:theme',
} as const;

export type Tab = 'tasks' | 'notebook';
export type ThemeChoice = 'dark' | 'light' | 'charcoal' | 'midnight' | 'sepia' | 'system';

async function readKey<T>(key: string, fallback: T): Promise<T> {
  const raw = await chrome.storage.local.get(key);
  const v = raw[key];
  return v === undefined ? fallback : (v as T);
}

async function writeKey<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

interface NotesMutation<T> {
  changed: boolean;
  value: T;
}

// chrome.storage.local has no transaction that spans a read-modify-write
// cycle. Keep every mutation of the shared notes array on one promise chain
// so a later operation always reads the latest committed value.
let notesMutationTail: Promise<void> = Promise.resolve();

function mutateNotes<T>(mutator: (all: Note[]) => NotesMutation<T>): Promise<T> {
  const operation = notesMutationTail.then(async () => {
    const all = await readKey<Note[]>(K.notes, []);
    const result = mutator(all);
    if (result.changed) await writeKey(K.notes, all);
    return result.value;
  });

  // A failed write must reject its caller without permanently poisoning the
  // queue for later user actions.
  notesMutationTail = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

/** All non-deleted notes, in insertion order (newest last). */
export async function listNotes(): Promise<Note[]> {
  const all = await readKey<Note[]>(K.notes, []);
  return all.filter((n) => n.deletedAt === null);
}

/** All notes including soft-deleted — for tests / diagnostics only. */
export async function listAllNotesRaw(): Promise<Note[]> {
  return readKey<Note[]>(K.notes, []);
}

export async function createNote(mode: Note['mode']): Promise<Note> {
  return mutateNotes((all) => {
    const now = Date.now();
    const note: Note = {
      id: newNoteId(),
      title: '',
      body: '',
      mode,
      tags: [],
      directoryId: null,
      pinned: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    all.push(note);
    return { changed: true, value: note };
  });
}

export async function updateNote(
  id: string,
  patch: Partial<Pick<Note, 'title' | 'body' | 'mode'>>,
): Promise<void> {
  await mutateNotes<void>((all) => {
    const idx = all.findIndex((n) => n.id === id);
    if (idx < 0) return { changed: false, value: undefined };
    const existing = all[idx];
    if (!existing) return { changed: false, value: undefined };
    all[idx] = { ...existing, ...patch, updatedAt: Date.now() };
    return { changed: true, value: undefined };
  });
}

/** Soft-delete a note (sets deletedAt). listNotes filters it out. */
export async function deleteNote(id: string): Promise<void> {
  await mutateNotes<void>((all) => {
    const idx = all.findIndex((n) => n.id === id);
    if (idx < 0) return { changed: false, value: undefined };
    const existing = all[idx];
    if (!existing) return { changed: false, value: undefined };
    all[idx] = { ...existing, deletedAt: Date.now() };
    return { changed: true, value: undefined };
  });
}

export async function getActiveNoteId(): Promise<string | null> {
  return readKey<string | null>(K.activeNoteId, null);
}
export async function setActiveNoteId(id: string | null): Promise<void> {
  await writeKey(K.activeNoteId, id);
}

export async function getActiveTab(): Promise<Tab> {
  return readKey<Tab>(K.activeTab, 'tasks');
}
export async function setActiveTab(tab: Tab): Promise<void> {
  await writeKey(K.activeTab, tab);
}

export async function getTheme(): Promise<ThemeChoice> {
  return readKey<ThemeChoice>(K.theme, 'dark');
}
export async function setTheme(t: ThemeChoice): Promise<void> {
  await writeKey(K.theme, t);
}
