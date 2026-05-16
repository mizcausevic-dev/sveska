import { useEffect } from 'react';
import { useConsent } from './consent';

export function ConsentBar(): React.JSX.Element | null {
  const state = useConsent((s) => s.state);
  const hydrate = useConsent((s) => s.hydrate);
  const grant = useConsent((s) => s.grant);
  const deny = useConsent((s) => s.deny);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (state !== 'unset') return null;

  return (
    <div className="app-footer consent-bar" role="region" aria-label="Analytics consent">
      <span>
        Sveska runs without trackers by default. Opt in if you&rsquo;d like to share anonymous,
        cookieless usage data once a vendor is wired up.
      </span>
      <span style={{ display: 'inline-flex', gap: 8 }}>
        <button type="button" onClick={() => void deny()}>
          No thanks
        </button>
        <button type="button" className="primary" onClick={() => void grant()}>
          Allow
        </button>
      </span>
    </div>
  );
}
