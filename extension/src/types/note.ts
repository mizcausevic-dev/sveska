/**
 * Note type — DUPLICATED verbatim from ../../../src/notes/db.ts (Note interface).
 *
 * Kept in sync manually. The spec chose duplication over a shared package
 * because a shared data layer becomes mandatory once cross-device sync
 * ships anyway (CLAUDE.md §5.5). If you change one, change the other, or
 * cross-store sync will need a translation layer.
 *
 * Fields that Dexie-specific (`pinned: 0 | 1` instead of boolean, because
 * Dexie doesn't index booleans) are kept EXACTLY the same shape here so a
 * future sync layer sees identical records on either side of the pipe.
 */
export interface Note {
  id: string;
  title: string;
  body: string;
  mode: 'text' | 'md' | 'checklist';
  tags: string[];
  directoryId: string | null;
  pinned: 0 | 1;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}
