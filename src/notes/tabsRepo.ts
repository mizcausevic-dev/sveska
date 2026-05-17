import { db, type Tab } from './db';

/**
 * M2.T2.1 — persistence for the open-tabs strip. One row per open tab.
 * `order` controls left-to-right position; `active` is 1 on at most one row.
 *
 * Tabs are SESSION state, not document state: they live in their own table so
 * closing a tab doesn't touch the underlying note (and the note keeps its
 * snapshots etc). Re-opening a closed note creates a fresh tab row.
 */

export async function listTabs(): Promise<Tab[]> {
  return db().tabs.orderBy('order').toArray();
}

export async function getActiveTab(): Promise<Tab | null> {
  const t = await db().tabs.where('active').equals(1).first();
  return t ?? null;
}

/** Add a new tab pointing at noteId. Activates it. Returns the new row. */
export async function addTab(noteId: string): Promise<Tab> {
  // Position at the end of the current strip.
  const existing = await listTabs();
  const order = (existing[existing.length - 1]?.order ?? -1) + 1;
  const tab: Tab = {
    id: crypto.randomUUID(),
    order,
    noteId,
    active: 1,
  };
  await db().transaction('rw', db().tabs, async () => {
    // Deactivate any current active tab.
    await db().tabs.where('active').equals(1).modify({ active: 0 });
    await db().tabs.add(tab);
  });
  return tab;
}

/** Activate a tab by id. No-op if it's already active. */
export async function activateTab(tabId: string): Promise<void> {
  await db().transaction('rw', db().tabs, async () => {
    await db().tabs.where('active').equals(1).modify({ active: 0 });
    await db().tabs.update(tabId, { active: 1 });
  });
}

/**
 * Close a tab. If it was active, activates the previous tab in order
 * (or the next one if it was the leftmost). Returns the id of the tab
 * that should be activated next, or null if the strip is now empty.
 */
export async function closeTab(tabId: string): Promise<string | null> {
  const all = await listTabs();
  const idx = all.findIndex((t) => t.id === tabId);
  if (idx < 0) return all.find((t) => t.active === 1)?.id ?? null;

  const wasActive = all[idx]?.active === 1;
  await db().tabs.delete(tabId);

  if (!wasActive) {
    return all.find((t) => t.active === 1)?.id ?? null;
  }

  // Pick the previous tab (or the next if we removed the leftmost).
  const remaining = all.filter((t) => t.id !== tabId);
  if (remaining.length === 0) return null;
  const next = remaining[Math.max(0, idx - 1)] ?? remaining[0]!;
  await activateTab(next.id);
  return next.id;
}

/** Drop every tab (used by "open fresh session" path on boot). */
export async function clearAllTabs(): Promise<void> {
  await db().tabs.clear();
}

/** Reorder a tab to a new index (0-based). Reassigns `order` on every row. */
export async function reorderTab(tabId: string, newIndex: number): Promise<void> {
  const all = await listTabs();
  const moving = all.find((t) => t.id === tabId);
  if (!moving) return;
  const without = all.filter((t) => t.id !== tabId);
  const target = Math.max(0, Math.min(newIndex, without.length));
  without.splice(target, 0, moving);
  await db().transaction('rw', db().tabs, async () => {
    for (let i = 0; i < without.length; i++) {
      const t = without[i]!;
      await db().tabs.update(t.id, { order: i });
    }
  });
}
