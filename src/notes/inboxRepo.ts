import { db, type InboxItem } from './db';

/**
 * Quick-capture inbox (M2.T2.5). Single-line drops the user wants to keep
 * out of the active note. Each row carries a `processed` flag (0/1) — the
 * rail badge shows the unprocessed count, and the inbox modal lets the user
 * promote a row into a real note or mark it done.
 */

export async function addInboxItem(text: string): Promise<InboxItem> {
  const item: InboxItem = {
    id: crypto.randomUUID(),
    text: text.trim(),
    capturedAt: Date.now(),
    processed: 0,
  };
  await db().inbox.add(item);
  return item;
}

export async function listInbox(opts: { onlyUnprocessed?: boolean } = {}): Promise<InboxItem[]> {
  const all = await db().inbox.orderBy('capturedAt').reverse().toArray();
  if (opts.onlyUnprocessed) return all.filter((i) => i.processed === 0);
  return all;
}

export async function countUnprocessed(): Promise<number> {
  return db().inbox.where('processed').equals(0).count();
}

export async function markProcessed(id: string): Promise<void> {
  await db().inbox.update(id, { processed: 1 });
}

export async function markUnprocessed(id: string): Promise<void> {
  await db().inbox.update(id, { processed: 0 });
}

export async function deleteInboxItem(id: string): Promise<void> {
  await db().inbox.delete(id);
}
