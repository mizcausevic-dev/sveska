import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Service-worker update prompt.
 *
 * Vite-plugin-pwa's `useRegisterSW` flags `needRefresh` when a new SW has
 * installed and is waiting. We surface that as a small bottom-center pill so
 * users on a stale precache get one click + a reload to the latest build —
 * no more "I shipped T1.4 but only T1.2 is rendering" mystery.
 *
 * Auto-checks the SW for updates every 60s while the tab is open.
 */
const POLL_MS = 60_000;

export function UpdateBanner(): React.JSX.Element | null {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const id = setInterval(() => {
        void registration.update();
      }, POLL_MS);
      return () => clearInterval(id);
    },
  });

  // Dev / non-PWA environments: needRefresh stays false forever, so the
  // banner never mounts — no need for an explicit env check.
  const [dismissed, setDismissed] = useState(false);

  // Reset dismiss whenever a new update lands.
  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  if (!needRefresh || dismissed) return null;

  return (
    <div className="update-banner" role="status" aria-live="polite" data-testid="update-banner">
      <span className="update-dot" aria-hidden="true" />
      <span className="update-label">New version ready</span>
      <button
        type="button"
        onClick={() => {
          void updateServiceWorker(true);
        }}
        data-testid="update-reload"
      >
        Reload
      </button>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          setNeedRefresh(false);
          setDismissed(true);
        }}
        aria-label="Dismiss update"
        data-testid="update-dismiss"
      >
        Later
      </button>
    </div>
  );
}
