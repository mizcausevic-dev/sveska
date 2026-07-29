const RECOVERY_KEY = 'sveska:preload-recovery-at';
const RECOVERY_PARAM = 'sveska-reload';
const RECOVERY_WINDOW_MS = 60_000;

interface RecoveryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface PreloadRecoveryHooks {
  now: () => number;
  href: () => string;
  storage: RecoveryStorage | null;
  recover: (at: number) => Promise<void>;
}

function readStoredTimestamp(storage: RecoveryStorage | null): number {
  if (!storage) return 0;
  try {
    return Number(storage.getItem(RECOVERY_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeStoredTimestamp(storage: RecoveryStorage | null, at: number): void {
  if (!storage) return;
  try {
    storage.setItem(RECOVERY_KEY, String(at));
  } catch {
    // Recovery must still work when session storage is blocked.
  }
}

function getSessionStorage(): RecoveryStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function buildRecoveryUrl(href: string, at: number): string {
  const url = new URL(href);
  url.searchParams.set(RECOVERY_PARAM, String(at));
  return url.toString();
}

export function wasRecentlyRecovered(
  href: string,
  storage: RecoveryStorage | null,
  now: number,
): boolean {
  const queryTimestamp = Number(new URL(href).searchParams.get(RECOVERY_PARAM)) || 0;
  const lastAttempt = Math.max(queryTimestamp, readStoredTimestamp(storage));
  return lastAttempt > 0 && now - lastAttempt < RECOVERY_WINDOW_MS;
}

async function resetPreloadCachesAndReload(at: number): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      const precacheNames = cacheNames.filter((name) => name.startsWith('workbox-precache'));
      await Promise.all(precacheNames.map((name) => window.caches.delete(name)));
    }
  } finally {
    // This changes only the URL and browser asset caches. IndexedDB notes are
    // intentionally untouched.
    window.location.replace(buildRecoveryUrl(window.location.href, at));
  }
}

export function createPreloadErrorHandler(hooks: PreloadRecoveryHooks): (event: Event) => void {
  return (event: Event) => {
    const now = hooks.now();
    if (wasRecentlyRecovered(hooks.href(), hooks.storage, now)) return;

    // Vite throws the original import failure unless the event is cancelled.
    // Let a second failure inside the recovery window reach ErrorBoundary so
    // the user gets controls instead of an automatic reload loop.
    event.preventDefault();
    writeStoredTimestamp(hooks.storage, now);
    void hooks.recover(now);
  };
}

export function installPreloadErrorRecovery(): () => void {
  const handler = createPreloadErrorHandler({
    now: () => Date.now(),
    href: () => window.location.href,
    storage: getSessionStorage(),
    recover: resetPreloadCachesAndReload,
  });

  window.addEventListener('vite:preloadError', handler);
  return () => window.removeEventListener('vite:preloadError', handler);
}
