import { db, type Template } from './db';

/**
 * Templates (M3.T3.4) live in Dexie's existing `templates` table. We seed
 * a handful of built-ins on first boot (kind = 'builtin') so the user has
 * something to copy from on day one. User-created templates use kind =
 * 'user'; the IDs for built-ins are stable strings so re-seeding is
 * idempotent.
 *
 * The TemplatesModal lets the user create a new note from any template
 * (which fills body + carries seed tags via the title prefix convention).
 */

export type TemplateKind = 'builtin' | 'user';

interface BuiltinSeed {
  id: string;
  name: string;
  body: string;
}

const BUILTINS: BuiltinSeed[] = [
  {
    id: 'builtin.meeting',
    name: 'Meeting notes',
    body: [
      '# Meeting — <topic>',
      '_Date: <YYYY-MM-DD>_',
      '_Attendees:_',
      '',
      '## Agenda',
      '- ',
      '',
      '## Decisions',
      '- ',
      '',
      '## Action items',
      '- [ ] ',
      '',
      '## Open questions',
      '- ',
    ].join('\n'),
  },
  {
    id: 'builtin.daily',
    name: 'Daily log',
    body: [
      '# <YYYY-MM-DD> daily',
      '',
      '## What I shipped',
      '- ',
      '',
      '## What I learned',
      '- ',
      '',
      '## Tomorrow',
      '- [ ] ',
    ].join('\n'),
  },
  {
    id: 'builtin.retro',
    name: 'Retro (start/stop/continue)',
    body: [
      '# Retro — <cycle>',
      '',
      '## Start',
      '- ',
      '',
      '## Stop',
      '- ',
      '',
      '## Continue',
      '- ',
      '',
      '## Action items',
      '- [ ] ',
    ].join('\n'),
  },
  {
    id: 'builtin.standup',
    name: 'Standup update',
    body: [
      '# Standup — <YYYY-MM-DD>',
      '',
      '## Yesterday',
      '- ',
      '',
      '## Today',
      '- ',
      '',
      '## Blockers',
      '- ',
    ].join('\n'),
  },
  {
    id: 'builtin.brief',
    name: 'Project brief',
    body: [
      '# Project: <name>',
      '',
      '## Why',
      '',
      '## What ships',
      '',
      '## Non-goals',
      '',
      '## Risks',
      '- ',
      '',
      '## Milestones',
      '- [ ] ',
    ].join('\n'),
  },
];

/** Seed built-ins on first run. Idempotent — uses stable IDs. */
export async function seedBuiltinTemplates(): Promise<void> {
  for (const seed of BUILTINS) {
    const existing = await db().templates.get(seed.id);
    if (existing) continue;
    await db().templates.add({
      id: seed.id,
      name: seed.name,
      body: seed.body,
      kind: 'builtin',
    });
  }
}

export async function listTemplates(): Promise<Template[]> {
  const all = await db().templates.toArray();
  // Built-ins first, then user templates A→Z by name.
  return all.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'builtin' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getTemplate(id: string): Promise<Template | null> {
  return (await db().templates.get(id)) ?? null;
}

export async function createUserTemplate(name: string, body: string): Promise<Template> {
  const t: Template = {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled template',
    body,
    kind: 'user',
  };
  await db().templates.add(t);
  return t;
}

export async function deleteUserTemplate(id: string): Promise<void> {
  const t = await db().templates.get(id);
  if (!t || t.kind === 'builtin') return; // never delete built-ins
  await db().templates.delete(id);
}
