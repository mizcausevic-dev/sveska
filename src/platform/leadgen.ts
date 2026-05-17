import { db } from '@/notes/db';

/**
 * Lead-gen seam (M6.T6.3).
 *
 * Until an ESP vendor is picked (Mailchimp / Brevo / ConvertKit / etc.),
 * every captured lead + CTA event lands as an entry on a single Dexie
 * prefs row keyed `leadEvents`. The MRR funnel dashboard (T6.4) reads
 * the same row. Swapping in a vendor later = replacing the body of
 * `trackLead()` with a fetch + keeping local mirroring as backup.
 *
 * Privacy posture: the consent gate (ConsentBar from M0) governs
 * analytics opt-in. Lead-gen events are CAPTURE actions taken by the
 * user explicitly (typed an email, clicked a CTA) and are recorded
 * regardless of analytics consent — because the user supplied the
 * data on purpose. We never silently track passive page views here.
 */

export type LeadEventKind = 'email.capture' | 'cta.click' | 'cta.dismiss' | 'export.share';

export interface LeadEvent {
  kind: LeadEventKind;
  /** Free-form context (slot name, surface, payload) — kept small. */
  payload?: Record<string, string>;
  capturedAt: number;
}

const KEY = 'leadEvents';

interface LeadRow {
  events: LeadEvent[];
}

async function readRow(): Promise<LeadRow> {
  const row = await db().prefs.get(KEY);
  if (!row) return { events: [] };
  const v = row.value as LeadRow | undefined;
  if (!v || !Array.isArray(v.events)) return { events: [] };
  return v;
}

export async function trackLead(
  kind: LeadEventKind,
  payload?: Record<string, string>,
): Promise<void> {
  const evt: LeadEvent = { kind, capturedAt: Date.now(), ...(payload ? { payload } : {}) };
  try {
    const row = await readRow();
    row.events.push(evt);
    // Cap at 500 events to keep the row from growing unboundedly.
    if (row.events.length > 500) row.events = row.events.slice(-500);
    await db().prefs.put({ key: KEY, value: row });
  } catch (err) {
    console.warn('[leadgen] persist failed', err);
  }
  // Console mirror so dev + manual QA can verify; analytics vendors can
  // be added behind the consent gate post-M6.4.
  console.warn('[leadgen]', kind, payload ?? {});
}

export async function listLeadEvents(): Promise<LeadEvent[]> {
  const row = await readRow();
  return row.events;
}

export async function countLeadEvents(kind?: LeadEventKind): Promise<number> {
  const events = await listLeadEvents();
  if (!kind) return events.length;
  return events.filter((e) => e.kind === kind).length;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(s: string): boolean {
  return EMAIL_RE.test(s.trim());
}
