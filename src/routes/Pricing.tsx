import { useSeo } from '@/platform/useSeo';
import { EmailCapture } from '@/platform/EmailCapture';
import { trackLead } from '@/platform/leadgen';

/**
 * Pricing scaffold (M6.T6.4). Two tiers — Free (everything that ships
 * today) and Pro (sync + AI usage at cost). Pro is "join waitlist" until
 * the sync work post-M6 lands; both tiers feed the same lead-event
 * stream so the funnel dashboard can graph conversion later.
 */
export function Pricing(): React.JSX.Element {
  useSeo({
    title: 'Pricing — Sveska',
    description:
      'Sveska is free, local-first, and offline. Pro adds end-to-end-encrypted sync and AI usage at cost.',
    canonical: 'https://sveska.studio/pricing',
  });

  function onProInterest(): void {
    void trackLead('cta.click', { id: 'pricing.pro.waitlist', slot: 'pricing-card' });
  }
  function onTeamInterest(): void {
    void trackLead('cta.click', { id: 'pricing.team.interest', slot: 'pricing-card' });
  }

  return (
    <article className="pricing-page" data-testid="pricing-page">
      <header className="pricing-head">
        <h1>Pricing</h1>
        <p className="lead">
          Sveska is free, local-first, and offline. Pro adds end-to-end-encrypted sync and AI usage
          at cost. No dark patterns; cancel by closing the tab.
        </p>
      </header>

      <div className="pricing-grid">
        <section className="pricing-card" data-testid="pricing-card-free">
          <header>
            <h2>Free</h2>
            <p className="pricing-amount mono">$0 forever</p>
          </header>
          <p className="pricing-summary">
            The full local-first app. Everything you see on sveska.studio today.
          </p>
          <ul className="pricing-list">
            <li>Unlimited notes (your device, your storage)</li>
            <li>Multi-note tabs · version history · tags · fuzzy search</li>
            <li>Markdown + checklist modes · canvas (Excalidraw)</li>
            <li>Command palette · slash commands · templates · snippets</li>
            <li>Import / export (.txt / .md / .html / .pdf)</li>
            <li>Web Share target · OG-card image render</li>
          </ul>
          <a
            className="snap-btn snap-btn--primary pricing-cta"
            href="/"
            data-testid="pricing-cta-free"
          >
            Open the notebook
          </a>
        </section>

        <section className="pricing-card pricing-card--pro" data-testid="pricing-card-pro">
          <header>
            <h2>Pro</h2>
            <p className="pricing-amount mono">$10/mo · waitlist</p>
          </header>
          <p className="pricing-summary">
            Everything in Free, plus the things only a small server can provide.
          </p>
          <ul className="pricing-list">
            <li>End-to-end-encrypted sync across devices</li>
            <li>Streaming AI usage (Anthropic) included, at cost</li>
            <li>Larger canvas docs (no local-storage ceiling)</li>
            <li>Email support; ship priority on user-requested features</li>
            <li>Built on the same local-first core — Pro never holds your data hostage</li>
          </ul>
          <EmailCapture
            source="footer"
            className="pricing-leadgen"
            heading="Join the Pro waitlist"
          />
          <button
            type="button"
            className="snap-btn pricing-cta-secondary"
            onClick={onProInterest}
            data-testid="pricing-cta-pro-interest"
          >
            I'd pay $10/mo for this
          </button>
        </section>

        <section className="pricing-card" data-testid="pricing-card-team">
          <header>
            <h2>Team</h2>
            <p className="pricing-amount mono">Talk to us</p>
          </header>
          <p className="pricing-summary">
            Self-host or single-tenant deploy for orgs that want Sveska on their own infra.
          </p>
          <ul className="pricing-list">
            <li>Single-tenant deploy (Netlify, CF Pages, or your VPC)</li>
            <li>SSO + audit logs (when shipped)</li>
            <li>Custom branding + glossary terms</li>
            <li>Source-available license; no vendor lock-in</li>
          </ul>
          <button
            type="button"
            className="snap-btn pricing-cta-secondary"
            onClick={onTeamInterest}
            data-testid="pricing-cta-team"
          >
            Get in touch
          </button>
        </section>
      </div>

      <footer className="pricing-footnote">
        <p>
          <strong>Privacy posture:</strong> Pro sync uses E2E encryption — Sveska holds ciphertext
          only. AI requests pass through our edge proxy; we never train on, store, or log your note
          content. Cancel any time, take your data with you.
        </p>
      </footer>
    </article>
  );
}
