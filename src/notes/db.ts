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

/**
 * Pasted/dropped image attachment for a note (screenshot paste, v2).
 * Stored as a Blob keyed by id; referenced in note bodies as
 * `sveska-img:<id>` and resolved to a data: URI at render/export time.
 */
export interface Attachment {
  id: string;
  noteId: string;
  blob: Blob;
  mime: string;
  name: string;
  createdAt: number;
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
  attachments!: EntityTable<Attachment, 'id'>;

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
    // v2 (screenshot paste) — additive: new `attachments` store only.
    // Dexie carries existing v1 stores forward automatically.
    this.version(2).stores({
      attachments: 'id, noteId, createdAt',
    });
  }
}

let _db: SveskaDB | null = null;

export function db(): SveskaDB {
  if (!_db) _db = new SveskaDB();
  return _db;
}

// Test-only: close the connection, drop the database, and null the singleton.
// Awaits the delete so the next test boots against a guaranteed-empty IDB.
export async function _resetDbForTests(): Promise<void> {
  if (_db) {
    _db.close();
    _db = null;
  }
  try {
    await Dexie.delete('sveska');
  } catch {
    // ignore — db may not exist yet
  }
}
