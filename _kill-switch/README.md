# Legacy sveska.studio kill-switch deploy

Static three-file payload to push to the **Netlify** project for `sveska.studio`,
one time only, to clear stale Service Workers that survived the
Netlify → Cloudflare Pages migration (2026-05-17).

## Why this exists

Visitors who used sveska.studio before the migration installed a
vite-plugin-pwa Service Worker via the Netlify deploy. That SW is
origin-scoped to `sveska.studio` and intercepts every fetch event for
that origin **before** DNS resolution — so the Hostinger 301 redirect
(now correctly pointing at sveska.pages.dev) never fires for those
users. They keep seeing the cached M5-era build.

Since the Netlify deploy is frozen (no further CI pushes — the credit
cap blocked the M7 deploy), the only way to clear the stale SW is to
push **one more** static deploy that contains a self-destructing SW.

## What it does

- `sw.js` — installs immediately (`skipWaiting`), activates immediately,
  clears every cache, unregisters itself, then navigates every open
  client to `https://sveska.pages.dev`.
- `index.html` — registers `sw.js`, ALSO directly unregisters any old
  SWs as a belt-and-suspenders measure, clears caches, then redirects
  to `sveska.pages.dev` preserving the URL path (so deep links survive).
- `_redirects` — Netlify SPA fallback so any path (`/glossary`,
  `/pricing`, etc.) hits the same `index.html` and gets redirected.
- `_headers` — `Cache-Control: no-store` on everything, plus
  `Service-Worker-Allowed: /` on `sw.js` so it can control the whole
  origin. Critical that these files are never themselves cached
  (would defeat the kill-switch purpose).

## How to deploy

Either:

**Option A — Netlify dashboard drag-and-drop (easiest, no CLI):**

1. Open https://app.netlify.com
2. Pick the `sveska` site
3. Click **Deploys** tab
4. Scroll down to the "Need to update your site? Drag and drop your
   site output folder here." dropzone
5. Drag the whole `_kill-switch/` folder onto it
6. Wait ~30 sec for deploy to finish

**Option B — Netlify CLI (if you've got `netlify-cli` set up):**

```bash
cd _kill-switch
netlify deploy --prod --dir=.
```

## After deploy

- Visit `https://sveska.studio` in a browser that has the stale build
  → see the "Sveska. moved to a new home" page for ~0.5s → auto-redirect
  to `sveska.pages.dev` with a clean state.
- Confirm in DevTools → Application → Service Workers that `sveska.studio`
  shows **no registered SW** anymore.
- After ~24 hours, all users with the old SW will have received the
  update on revisit and self-cleared.

This deploy folder is intentionally outside the normal build pipeline —
it never goes through `vite build`, never gets touched by CI, and once
it's served its purpose it can stay forever (it costs nothing on
Netlify's free tier even on a frozen account).
