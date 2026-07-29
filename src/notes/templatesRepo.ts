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
  {
    id: 'builtin.directory-listing',
    name: 'Directory listing',
    body: [
      '# <Business or provider name>',
      '',
      '## Listing facts',
      '| Field | Value | Source |',
      '| --- | --- | --- |',
      '| Category |  |  |',
      '| Service area |  |  |',
      '| Website |  |  |',
      '| Last verified |  |  |',
      '',
      '## Buyer fit',
      '',
      '## Services',
      '- ',
      '',
      '## Evidence and provenance',
      '- ',
      '',
      '## Review checklist',
      '- [ ] Claims are source-backed',
      '- [ ] Contact details are current',
      '- [ ] Schema fields are complete',
    ].join('\n'),
  },
  {
    id: 'builtin.technical-spec',
    name: 'Technical spec sheet',
    body: [
      '# Technical spec: <system>',
      '',
      '## Objective',
      '',
      '## Requirements',
      '| ID | Requirement | Priority | Acceptance test |',
      '| --- | --- | --- | --- |',
      '| R-01 |  | Must |  |',
      '',
      '## Architecture',
      '',
      '## Data model',
      '',
      '## Security and privacy',
      '- ',
      '',
      '## Failure modes',
      '- ',
      '',
      '## Release gates',
      '- [ ] Typecheck',
      '- [ ] Tests',
      '- [ ] Build',
      '- [ ] Browser QA',
    ].join('\n'),
  },
  {
    id: 'builtin.product-launch',
    name: 'Product launch plan',
    body: [
      '# Launch: <product>',
      '',
      '## Buyer, problem, offer',
      '',
      '## Launch goal',
      '| KPI | Baseline | Target | Measurement |',
      '| --- | --- | --- | --- |',
      '|  |  |  |  |',
      '',
      '## Positioning and proof',
      '- ',
      '',
      '## Distribution',
      '- [ ] Search and GEO/AEO',
      '- [ ] Owned audience',
      '- [ ] Partnerships and outreach',
      '- [ ] Paid media',
      '',
      '## Launch sequence',
      '- [ ] Pre-launch',
      '- [ ] Launch day',
      '- [ ] Follow-up',
      '',
      '## Risks and kill criteria',
      '- ',
    ].join('\n'),
  },
];

/**
 * Seed built-ins on first run.
 *
 * `put` keeps this safe when two app shells mount close together, such as a
 * restored browser tab racing a fresh one. A check-then-add sequence can let
 * both callers observe a missing stable ID and make one transaction fail with
 * ConstraintError.
 */
export async function seedBuiltinTemplates(): Promise<void> {
  for (const seed of BUILTINS) {
    await db().templates.put({
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
