/**
 * Self-destruct Service Worker for the legacy sveska.studio origin.
 *
 * Background: the old vite-plugin-pwa SW that shipped with the Netlify
 * deploys is cached on user devices that visited sveska.studio before
 * the Cloudflare Pages migration. Because SWs intercept fetch events
 * client-side BEFORE DNS resolution, those users still see the old M5/M6
 * build even after Hostinger's 301 redirect is in place.
 *
 * This SW exists to commit suicide on its next update check:
 *   1. install — skipWaiting so we activate immediately, no waiting period
 *   2. activate — clear every cache this SW has, unregister the
 *      registration, then navigate every open client to the canonical
 *      origin (sveska.pages.dev). Force-reload so they don't see a flash
 *      of the cached page before the redirect kicks in.
 *   3. fetch — bypass to network for everything. We don't want to serve
 *      anything from cache anymore.
 *
 * Reaches existing users via the old SW's autoUpdate behavior: every ~24h
 * (or on user revisit) Workbox re-fetches /sw.js. Replacement happens
 * automatically; user just needs to revisit sveska.studio once for the
 * old SW to discover this new one.
 */

self.addEventListener('install', (event) => {
  // Activate immediately; don't wait for old SW to release control.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Wipe every cache this origin owns.
      try {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      } catch (e) {
        // ignored — best effort
      }

      // Unregister ourselves so the next request bypasses the SW entirely.
      try {
        await self.registration.unregister();
      } catch (e) {
        // ignored — best effort
      }

      // Kick every open client over to the canonical origin.
      try {
        const clients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
        for (const client of clients) {
          // Preserve the path + query + hash so deep links survive.
          const u = new URL(client.url);
          const target = 'https://sveska.pages.dev' + u.pathname + u.search + u.hash;
          try {
            await client.navigate(target);
          } catch (e) {
            // Some browsers refuse cross-origin client.navigate(); fall back to postMessage.
            client.postMessage({ type: 'sveska:moved', target });
          }
        }
      } catch (e) {
        // ignored
      }
    })(),
  );
});

// Pass-through everything; never serve from cache.
self.addEventListener('fetch', (event) => {
  // Do nothing — let the browser handle the request via the network.
});
