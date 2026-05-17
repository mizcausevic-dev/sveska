import { useEffect, useMemo, useState } from 'react';
import { useSeo } from '@/platform/useSeo';
import { listLeadEvents, type LeadEvent } from '@/platform/leadgen';

/**
 * Internal MRR funnel dashboard (M6.T6.4). Reads lead events that landed
 * in Dexie's `prefs.leadEvents` row and graphs them across funnel
 * stages. Until an ESP vendor wires real upstream data, this is a
 * local-only view of the events captured in THIS browser — useful for
 * sanity-checking that the CTAs and capture forms actually fire.
 *
 * Hidden from the primary nav by design (you have to know the URL).
 */

const PRO_PRICE = 10;
const TARGET_MRR = 15_000;

interface FunnelStage {
  id: string;
  label: string;
  count: number;
  hint: string;
}

export function Funnel(): React.JSX.Element {
  useSeo({
    title: 'Funnel — Sveska',
    description: 'Internal MRR funnel dashboard for Sveska.',
    canonical: 'https://sveska.studio/funnel',
    robots: 'noindex',
  });

  const [events, setEvents] = useState<LeadEvent[]>([]);

  useEffect(() => {
    void listLeadEvents().then(setEvents);
  }, []);

  const stages = useMemo<FunnelStage[]>(() => {
    const emails = events.filter((e) => e.kind === 'email.capture');
    const ctaClicks = events.filter((e) => e.kind === 'cta.click');
    const ctaDismisses = events.filter((e) => e.kind === 'cta.dismiss');
    const proInterest = ctaClicks.filter((e) => e.payload?.id === 'pricing.pro.waitlist');
    return [
      {
        id: 'visit',
        label: 'Visited (local proxy)',
        count: events.length,
        hint: 'Every lead event recorded in this browser counts as a visitor proxy.',
      },
      {
        id: 'email',
        label: 'Captured email',
        count: emails.length,
        hint: 'Subscribed via blog footer or Pro waitlist.',
      },
      {
        id: 'pro',
        label: 'Pro intent',
        count: proInterest.length,
        hint: 'Clicked the "I\'d pay $10/mo" button on /pricing.',
      },
      {
        id: 'cta-clicks',
        label: 'All CTA clicks',
        count: ctaClicks.length,
        hint: 'Promo slots, blog CTAs, pricing CTAs combined.',
      },
      {
        id: 'cta-dismiss',
        label: 'CTA dismissals',
        count: ctaDismisses.length,
        hint: 'Promo slots the user explicitly closed.',
      },
    ];
  }, [events]);

  const max = Math.max(1, ...stages.map((s) => s.count));
  const proCount = stages.find((s) => s.id === 'pro')?.count ?? 0;
  const projectedMrr = proCount * PRO_PRICE;
  const targetPaying = Math.ceil(TARGET_MRR / PRO_PRICE);
  const pctToTarget = Math.min(100, Math.round((proCount / targetPaying) * 100));

  return (
    <article className="funnel-page" data-testid="funnel-page">
      <header className="funnel-head">
        <h1>Funnel</h1>
        <p className="lead">
          Local-browser view of lead events. Useful for verifying that capture forms + CTAs are
          firing. Real cohort/MRR graphs land when the ESP vendor is picked.
        </p>
      </header>

      <section className="funnel-target" data-testid="funnel-target">
        <h2>Path to ${TARGET_MRR.toLocaleString()}/mo</h2>
        <p className="funnel-target-line">
          Pro @ ${PRO_PRICE}/mo × <strong>{targetPaying.toLocaleString()}</strong> paying
          subscribers = ${TARGET_MRR.toLocaleString()} MRR.
        </p>
        <div className="funnel-target-bar" aria-label="Progress to MRR target">
          <span style={{ width: `${pctToTarget}%` }} />
        </div>
        <p className="funnel-target-meta mono">
          Today (local browser only): {proCount} Pro intent · projected ${projectedMrr}/mo (
          {pctToTarget}% of target)
        </p>
      </section>

      <section className="funnel-stages">
        <h2>Stages</h2>
        <ul className="funnel-list">
          {stages.map((s) => (
            <li key={s.id} className="funnel-row" data-testid={`funnel-row-${s.id}`}>
              <span className="funnel-label">{s.label}</span>
              <span className="funnel-bar" aria-hidden="true">
                <span style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
              </span>
              <span className="funnel-count mono">{s.count}</span>
            </li>
          ))}
        </ul>
        {events.length === 0 && (
          <p className="funnel-empty" data-testid="funnel-empty">
            No lead events captured yet on this device. Subscribe to the blog, click a CTA, or visit{' '}
            <a href="/pricing">/pricing</a> to populate.
          </p>
        )}
      </section>

      <section className="funnel-recent">
        <h2>Recent events</h2>
        <ul className="funnel-events">
          {events
            .slice()
            .reverse()
            .slice(0, 12)
            .map((e, i) => (
              <li key={i} className="mono">
                <time>{new Date(e.capturedAt).toLocaleTimeString()}</time> · {e.kind}{' '}
                {e.payload && <span className="funnel-payload">{JSON.stringify(e.payload)}</span>}
              </li>
            ))}
        </ul>
      </section>
    </article>
  );
}
