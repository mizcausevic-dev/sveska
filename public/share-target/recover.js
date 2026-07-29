/* global document, window, HTMLButtonElement */

const statusElement = document.querySelector('[data-repair-status]');
const repairButton = document.querySelector('[data-repair-button]');

function setStatus(message) {
  if (statusElement) statusElement.textContent = message;
}

function isGeneratedAssetCache(name) {
  return name.startsWith('workbox-precache');
}

async function repairSveska() {
  if (repairButton instanceof HTMLButtonElement) repairButton.disabled = true;
  setStatus('Removing the stale offline app shell. Your IndexedDB notes are not being touched.');

  try {
    let registrationsRemoved = 0;
    let cachesRemoved = 0;

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const sameOriginRegistrations = registrations.filter(
        (registration) => new URL(registration.scope).origin === window.location.origin,
      );
      const registrationResults = await Promise.all(
        sameOriginRegistrations.map((registration) => registration.unregister()),
      );
      registrationsRemoved = registrationResults.filter(Boolean).length;
    }

    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      const generatedAssetCaches = cacheNames.filter(isGeneratedAssetCache);
      const cacheResults = await Promise.all(
        generatedAssetCaches.map((name) => window.caches.delete(name)),
      );
      cachesRemoved = cacheResults.filter(Boolean).length;
    }

    try {
      window.sessionStorage.removeItem('sveska:preload-recovery-at');
    } catch {
      // The repair does not depend on session storage being available.
    }

    setStatus(
      `Repair complete. Refreshed ${registrationsRemoved} service worker registration(s) and ${cachesRemoved} generated asset cache(s). Reopening Sveska…`,
    );

    window.setTimeout(() => {
      const editorUrl = new URL('/', window.location.origin);
      editorUrl.searchParams.set('sveska-repaired', String(Date.now()));
      window.location.replace(editorUrl);
    }, 700);
  } catch (error) {
    console.error('[sveska] browser repair failed:', error);
    setStatus(
      'The automatic repair could not finish. Close every Sveska tab, reopen this page, and select “Repair and reopen”.',
    );
    if (repairButton instanceof HTMLButtonElement) repairButton.disabled = false;
  }
}

repairButton?.addEventListener('click', () => {
  void repairSveska();
});

void repairSveska();
