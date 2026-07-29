import { db, type Directory } from './db';

function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, 80);
}

export async function listDirectories(): Promise<Directory[]> {
  const rows = await db().directories.toArray();
  return rows.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function createDirectory(
  name: string,
  parentId: string | null = null,
): Promise<Directory> {
  const normalized = cleanName(name);
  if (!normalized) throw new Error('Directory name is required');
  if (parentId !== null && !(await db().directories.get(parentId))) {
    throw new Error('Parent directory does not exist');
  }

  const siblings = (await db().directories.toArray()).filter((row) => row.parentId === parentId);
  const now = Date.now();
  const directory: Directory = {
    id: crypto.randomUUID(),
    name: normalized,
    parentId,
    order: siblings.reduce((max, item) => Math.max(max, item.order), -1) + 1,
    createdAt: now,
    updatedAt: now,
  };
  await db().directories.add(directory);
  return directory;
}

export async function renameDirectory(id: string, name: string): Promise<void> {
  const normalized = cleanName(name);
  if (!normalized) throw new Error('Directory name is required');
  await db().directories.update(id, { name: normalized, updatedAt: Date.now() });
}

function collectDescendantIds(rows: Directory[], rootId: string): string[] {
  const children = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.parentId) continue;
    const current = children.get(row.parentId) ?? [];
    current.push(row.id);
    children.set(row.parentId, current);
  }

  const ids: string[] = [];
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    ids.push(current);
    queue.push(...(children.get(current) ?? []));
  }
  return ids;
}

/**
 * Delete a directory subtree without deleting notes. Notes are moved to the
 * unfiled root first, so organization mistakes never become content loss.
 */
export async function deleteDirectoryTree(id: string): Promise<void> {
  const rows = await listDirectories();
  if (!rows.some((row) => row.id === id)) return;
  const ids = collectDescendantIds(rows, id);

  await db().transaction('rw', db().directories, db().notes, async () => {
    await db().notes.where('directoryId').anyOf(ids).modify({ directoryId: null });
    await db().directories.bulkDelete(ids);
  });
}

export function directoryDescendantIds(rows: Directory[], rootId: string): Set<string> {
  return new Set(collectDescendantIds(rows, rootId));
}

export interface FlatDirectory extends Directory {
  depth: number;
}

/** Depth-first rows for selects and the rail. Orphans are kept visible at root. */
export function flattenDirectories(rows: Directory[]): FlatDirectory[] {
  const byParent = new Map<string | null, Directory[]>();
  const ids = new Set(rows.map((row) => row.id));
  for (const row of rows) {
    const parent = row.parentId && ids.has(row.parentId) ? row.parentId : null;
    const siblings = byParent.get(parent) ?? [];
    siblings.push(row);
    byParent.set(parent, siblings);
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }

  const out: FlatDirectory[] = [];
  const walk = (parentId: string | null, depth: number): void => {
    for (const row of byParent.get(parentId) ?? []) {
      out.push({ ...row, depth });
      walk(row.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}
