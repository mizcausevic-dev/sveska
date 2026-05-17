<!-- memory.md — project-local knowledge. Persistent across sessions. Append, don't overwrite. -->

# Memory · Sveska

> **Project-local decisions, gotchas, infra facts.** Distinct from agent-level memory (`~/.claude/projects/.../memory/`) which is cross-project user context. This file is for things specific to building Sveska.

## Locked decisions (do not re-litigate)

- **Stack**: Vite 5 + React 18 + TS strict + Zustand + Dexie + vite-plugin-pwa + react-router-dom v6. Frozen per CLAUDE.md §1.
- **Canvas**: Excalidraw vendored at M5 only. tldraw is **permanently dropped** — no licence exposure.
- **Storage**: Dexie (IndexedDB) is primary. `localStorage` only for the one-time legacy import (notepad.js.org compat). Theme + all prefs go through Dexie `prefs` table.
- **Security gates** enforced from M0: CSP `default-src 'self'`, key-leak scanner in build, 180 KB JS gzip budget. Never weaken.
- **Editor**: native `<textarea>` for M1. CodeMirror 6 only when M3.2 (Markdown mode) needs it.
- **Pre-commit**: `prettier + pnpm typecheck` only. Type-aware ESLint per-file gets killed on Windows; full `pnpm lint` runs in CI instead.
- **Tests**: real timers (fake timers fight Dexie async writes). `test-setup.ts` must call `_resetDbForTests()` which closes the connection AND `Dexie.delete('sveska')` — nulling the singleton alone doesn't drop data.

## Deployment topology

- **GitHub**: [mizcausevic-dev/sveska](https://github.com/mizcausevic-dev/sveska), `main` = production, branch protection not yet enabled.
- **CI/CD**: `.github/workflows/deploy.yml` — push to main → typecheck → lint → test → build → Netlify deploy. Requires `NETLIFY_AUTH_TOKEN` secret (set 2026-05-16).
- **Netlify**: project ID `0f0d7b94-c208-4af6-a321-df2623367629`, slug `sveska`, owner `causevic.miz@gmail.com`, team `fknmiz`.
- **Canonical**: `https://sveska.studio` (Hostinger registrar, DNS at Hostinger).
- **Aliases** all 301 → canonical via `netlify.toml`:
  - `www.sveska.studio` (CNAME → sveska.netlify.app)
  - `sveska.netlify.app` (Netlify's default)
  - `sveska.kineticgain.com` (ALIAS — type ALIAS not CNAME!)
  - `notepad.kineticgain.com` (CNAME → sveska.netlify.app)
- **DNS via Hostinger API**: `~/ftpkred.txt` holds the token (rotated 2026-05-16 after the original leaked in conversation logs). Token has DNS + portfolio scope. Endpoint: `https://developers.hostinger.com/api/dns/v1/zones/{domain}`. Auth: `Bearer`.
- **SSL**: Let's Encrypt via Netlify, single cert with SAN covering all 4 hostnames. Provisions automatically once DNS resolves.

## Gotchas

- **Hostinger DNS record types differ across siblings**: don't blindly PUT CNAME — read existing type first. `sveska.kineticgain.com` is `ALIAS`; `notepad.kineticgain.com` is `CNAME`. Mixing types triggers HTTP 422 conflict.
- **Hostinger DNS PUT with `overwrite=true`** only replaces records matching name+type. Other siblings are untouched. Verified safe for kineticgain.com (22 subdomains).
- **DNS TTL**: was 3600s on the previous CNAMEs; browsers cache up to 1 hr after a flip. If user reports SSL warning post-DNS-change, it's a stale local cache, not a server problem. Fix: `ipconfig /flushdns` + restart browser, or incognito.
- **Husky pre-commit**: dropped per-file ESLint with type-aware rules — it got killed on Windows (memory/timeout). Pre-commit = `prettier + typecheck`. Full lint runs in CI.
- **Vitest fake timers**: don't combine with Dexie. Fake `setTimeout` blocks the IDB request callbacks. Use real timers + generous `waitFor` timeouts.
- **`fake-indexeddb/auto`**: doesn't reset between tests on its own. Need to `db.close()` + `Dexie.delete('sveska')` + null the singleton each `afterEach`.
- **Windows case-insensitive paths**: `Sveska/` (reference bundle) and `sveska/` (app) collide. App lives at `C:\Users\chaus\Downloads\sveska-app\` to avoid this.
- **NS delegation drift (2026-05-17)**: `sveska.studio` started delegating to `dns1.p07.nsone.net` / `dns2.p07.nsone.net` (NS1 / Netlify-DNS nameservers) — but **no zone existed there**, so public resolvers got `SERVFAIL` and browsers showed `DNS_PROBE_FINISHED_NXDOMAIN`. The Hostinger zone records were intact. Fix: `PUT /api/domains/v1/portfolio/{domain}/nameservers` setting `ns1=athena.dns-parking.com, ns2=apollo.dns-parking.com`. Likely cause: Netlify dashboard's "Use Netlify DNS" or a similar one-click that flips the registered NS at the registrar level. **If you ever see SERVFAIL on a Hostinger-registered domain, check `gh api … /portfolio/{domain}` for the `name_servers` field first.**
- **Workbox `autoUpdate` doesn't always pick up new SW within a session**: after shipping multiple builds, some users get stuck on a stale precache. M1.7 polish added an `<UpdateBanner />` that polls `registration.update()` every 60s and surfaces a "Reload" pill when `needRefresh` flips.
- **Don't force-redirect the alias hostnames**: keeping `sveska.netlify.app` (and `*.kineticgain.com`) reachable means we have a live backup when the canonical breaks (e.g. NS drift above). Canonical is enforced via `<link rel="canonical">` in `index.html`, not via 301. Only `www.sveska.studio` is force-redirected (apex preference).

## File map (where things live)

- **App source**: `src/{app,editor,notes,markdown,canvas,ai,platform,ui,lib,routes,styles}/`
- **Design specs** (read-only, M1+): `docs/design-mocks/*.{html,jsx}` — 17 HTML harnesses + 13 JSX modules from Claude Code Design.
- **Brand kit doc**: `docs/design-kit/` — `system.css`, full design-system HTML, fonts.
- **sveska.studio marketing pages** (planned M6): `docs/landing/*.html` — 8 pages (landing, about, changelog, glossary, privacy, roadmap, press, field-note).
- **CI workflows**: `.github/workflows/deploy.yml` (auto on push) + `netlify-domain.yml` (one-shot domain ops).
- **Brand assets in app**: `public/brand/` — favicon, icons (48–512 + maskable), logos, fonts, manifest.json mirror.

## Performance snapshot (rolling)

| Date                 | Tests | JS gzip  | CSS gzip | Notes         |
| -------------------- | ----- | -------- | -------- | ------------- |
| M0 ship (2026-05-16) | 3     | 89.81 KB | 2.53 KB  | scaffold only |
| T1.1 (2026-05-16)    | 8     | 90.67 KB | 2.81 KB  | +editor       |
| T1.2 (2026-05-16)    | 17    | 91.29 KB | 3.15 KB  | +snapshots    |
| T1.3 (2026-05-17)    | 28    | 93.21 KB | 3.15 KB  | +export       |
| T1.4 (2026-05-17)    | 40    | 93.84 KB | 3.15 KB  | +stats modal  |
| T1.5 (2026-05-17)    | 45    | 94.10 KB | 3.15 KB  | +focus mode   |

Budget: 180 KB JS gzip pre-canvas/AI.

## Open decisions (parking lot)

- **Edge host** (M4): Cloudflare Workers vs Vercel Edge. Both connectors available. Decide before M4 starts.
- **Analytics vendor** (M6.3): cookieless / self-host. Consent gate already wired.
- **OpenDyslexic font** (M1.6): need to vendor. Currently not in `public/brand/fonts/`.
- **Lighthouse PWA score** on prod: not yet validated (CLI doesn't run Lighthouse). User to verify in Chrome DevTools.
- **`kinetic-gain-protocol-suite` topic** on the repo: currently omitted (Sveska reads as standalone product). Add if Suite signaling matters.

## Workflow preferences (user)

- **Externalized state**: 90%+ of context lives in `CLAUDE.md` / `tasks.md` / `plan.md` / `memory.md`. New sessions read these 4 files, ignore conversation history older than current session.
- **Phased work**: Plan → ticket → verify → commit → checkpoint (suggest `/compact`) → next ticket.
- **Subagents**: Use for parallel file exploration to avoid bloating the main context. Don't grep yourself if a subagent can do it.
- **Critical-info-at-edges**: front of the conversation = mission; end of the conversation = current ticket. Middle decays.
