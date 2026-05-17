import { useEffect } from 'react';
import { useCTA } from './ctaStore';
import { trackLead } from './leadgen';

interface Props {
  /** Stable id used for dismiss memory + analytics payload. */
  id: string;
  /** Where in the UI this slot lives — recorded with click/dismiss events. */
  slot: 'shell' | 'export-footer' | 'blog';
  label: string;
  href: string;
  /** Optional one-line lead-in shown above the button. */
  blurb?: string;
}

/**
 * Dismissable promo slot (M6.T6.3). The host (shell footer, blog, etc.)
 * mounts CTASlot with a stable `id`; once a user clicks Dismiss, the slot
 * stays hidden for that id forever (persisted in Dexie via `useCTA`).
 *
 * Click + dismiss both `trackLead` so the M6.4 funnel dashboard has
 * before/after numbers to graph.
 */
export function CTASlot({ id, slot, label, href, blurb }: Props): React.JSX.Element | null {
  const ready = useCTA((s) => s.ready);
  const dismissed = useCTA((s) => s.dismissed);
  const dismiss = useCTA((s) => s.dismiss);
  const bootstrap = useCTA((s) => s.bootstrap);

  useEffect(() => {
    if (!ready) void bootstrap();
  }, [ready, bootstrap]);

  if (!ready || dismissed.has(id)) return null;

  function onClick(): void {
    void trackLead('cta.click', { id, slot, href });
  }
  function onDismiss(): void {
    void trackLead('cta.dismiss', { id, slot });
    void dismiss(id);
  }

  return (
    <div className="cta-slot" data-testid={`cta-slot-${id}`}>
      <span className="cta-body">
        {blurb && <span className="cta-blurb">{blurb} </span>}
        <a className="cta-link" href={href} onClick={onClick} data-testid={`cta-link-${id}`}>
          {label} →
        </a>
      </span>
      <button
        type="button"
        className="cta-dismiss"
        onClick={onDismiss}
        aria-label={`Dismiss ${label}`}
        data-testid={`cta-dismiss-${id}`}
      >
        ×
      </button>
    </div>
  );
}
