import { db, type Snippet } from './db';

/**
 * Snippets (M3.T3.4) live in Dexie's existing `snippets` table. Each row
 * is { id, trigger, body }. The trigger is a short string the user types
 * in the editor (e.g. `;sig`, `:::date`, `--hr`); when matched at the
 * caret it expands into the body in place.
 *
 * We seed a couple of small examples on first run so the snippet typeahead
 * has something to demo with; the user can edit / delete / add more in
 * the Snippets panel of the Templates modal.
 */

interface SnippetSeed {
  trigger: string;
  body: string;
}

const SEEDS: SnippetSeed[] = [
  { trigger: ';date', body: '<YYYY-MM-DD>' },
  { trigger: ';todo', body: '- [ ] ' },
  { trigger: ';hr', body: '\n---\n' },
];

export async function seedBuiltinSnippets(): Promise<void> {
  for (const s of SEEDS) {
    const existing = await db().snippets.where('trigger').equals(s.trigger).first();
    if (existing) continue;
    await db().snippets.add({ id: crypto.randomUUID(), trigger: s.trigger, body: s.body });
  }
}

export async function listSnippets(): Promise<Snippet[]> {
  const all = await db().snippets.toArray();
  return all.sort((a, b) => a.trigger.localeCompare(b.trigger));
}

export async function createSnippet(trigger: string, body: string): Promise<Snippet> {
  const t = trigger.trim();
  if (!t) throw new Error('snippet trigger required');
  const s: Snippet = { id: crypto.randomUUID(), trigger: t, body };
  await db().snippets.add(s);
  return s;
}

export async function deleteSnippet(id: string): Promise<void> {
  await db().snippets.delete(id);
}

/** Find a snippet whose trigger sits at the end of `prefix`. Used by the
 *  in-editor typeahead — caller passes everything to the left of the
 *  caret, we return the longest matching trigger if any. */
export async function findTriggerAt(prefix: string): Promise<Snippet | null> {
  if (!prefix) return null;
  const all = await listSnippets();
  let best: Snippet | null = null;
  for (const s of all) {
    if (prefix.endsWith(s.trigger)) {
      if (!best || s.trigger.length > best.trigger.length) best = s;
    }
  }
  return best;
}
