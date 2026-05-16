import Dexie, { type EntityTable } from 'dexie';

// Full schema per CLAUDE.md §4. M0 only writes to `prefs`; the rest of the tables
// are declared now so M1+ migrations don't fight an empty database.

export interface Note {
  id: string;
  title: string;
  body: string;
  mode: 'text' | 'md' | 'checklist';
  tags: string[];
  pinned: 0 | 1; // Dexie indexes don't accept booleans
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Version {
  id: string;
  noteId: string;
  body: string;
  snapshotAt: number;
  label: string | null;
}

export interface CanvasDoc {
  id: string;
  noteId: string;
  providerId: string;
  doc: Blob;
}

export interface Tab {
  id: string;
  order: number;
  noteId: string;
  active: 0 | 1;
}

export interface Pref {
  key: string;
  value: unknown;
}

export interface InboxItem {
  id: string;
  text: string;
  capturedAt: number;
  processed: 0 | 1;
}

export interface Template {
  id: string;
  name: string;
  body: string;
  kind: string;
}

export interface Snippet {
  id: string;
  trigger: string;
  body: string;
}

export class SveskaDB extends Dexie {
  notes!: EntityTable<Note, 'id'>;
  versions!: EntityTable<Version, 'id'>;
  canvas!: EntityTable<CanvasDoc, 'id'>;
  tabs!: EntityTable<Tab, 'id'>;
  prefs!: EntityTable<Pref, 'key'>;
  inbox!: EntityTable<InboxItem, 'id'>;
  templates!: EntityTable<Template, 'id'>;
  snippets!: EntityTable<Snippet, 'id'>;

  constructor() {
    super('sveska');
    this.version(1).stores({
      notes: 'id, updatedAt, pinned, deletedAt, *tags',
      versions: 'id, noteId, snapshotAt',
      canvas: 'id, noteId',
      tabs: 'id, order, active',
      prefs: 'key',
      inbox: 'id, capturedAt, processed',
      templates: 'id, kind',
      snippets: 'id, trigger',
    });
  }
}

let _db: SveskaDB | null = null;

export function db(): SveskaDB {
  if (!_db) _db = new SveskaDB();
  return _db;
}

// Test-only: reset the singleton (fake-indexeddb resets between tests via the setup file).
export function _resetDbForTests(): void {
  _db = null;
}
