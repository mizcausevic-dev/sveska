# Sveska

> **Sveska** /ˈsvɛska/ — _Bosnian: notebook, exercise book._
> A studio-grade, **local-first, offline-first** notepad PWA at [sveska.studio](https://sveska.studio).

[![PWA](https://img.shields.io/badge/PWA-installable-F2B544?style=flat-square)](https://sveska.studio)
[![License](https://img.shields.io/badge/license-MIT-0C0C0E?style=flat-square)](LICENSE)

Notes, Markdown, canvas, AI — all local. No account, no telemetry until you opt in, no
cloud dependency. The reference behaviour is `notepad.js.org` (Amit Merchant, MIT).
Sveska re-implements it as a typed, modular PWA with a platform surface from day one.

## Stack (locked at M0)

| Concern     | Choice                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Build       | Vite + React 18 + TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| State       | Zustand                                                                                         |
| Storage     | Dexie (IndexedDB)                                                                               |
| PWA         | `vite-plugin-pwa` (Workbox, `registerType: 'autoUpdate'`)                                       |
| Router      | `react-router-dom` v6                                                                           |
| Tests       | Vitest + Testing Library + `fake-indexeddb`                                                     |
| Lint/format | ESLint 9 (flat config, typed) + Prettier 3                                                      |
| Pre-commit  | Husky 9 + lint-staged                                                                           |
| Edge (M4)   | TBD: Cloudflare Workers or Vercel Edge                                                          |
| Canvas (M5) | Excalidraw (MIT), vendored, lazy-loaded behind `CanvasProvider`                                 |

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:5173
pnpm build          # builds, generates sitemap, runs key-leak + bundle-budget gates
pnpm preview        # serves the built bundle
pnpm test           # Vitest + Testing Library
pnpm typecheck
pnpm lint
```

Requires Node ≥ 20 and pnpm 10. Husky installs a pre-commit hook on `pnpm install` that
runs `lint-staged` (ESLint + Prettier on touched files) plus `pnpm typecheck`.

## Security gate

CLAUDE.md §5. Hard, enforced now (not deferred):

1. **No API keys in the client.** `scripts/check-no-keys.mjs` runs at the end of every build
   and fails on any `VITE_*_API_KEY` / `ANTHROPIC_API_KEY` / `sk-…` / bearer-shaped string.
2. **CSP `default-src 'self'`.** Declared as both an HTML meta tag (runtime) and a Netlify
   header (defence-in-depth). The AI proxy origin is appended to `connect-src` at M4.
3. **No third-party trackers** in the app shell. Analytics is a seam with a no-op default and
   a consent gate (`ConsentBar`). Real vendor is decided at M6 and must be cookieless.
4. **Self-hosted fonts.** Bricolage Grotesque 700 + JetBrains Mono 600 ship as TTFs in
   `public/brand/fonts/`; Satoshi and Newsreader fall back to `system-ui` / Georgia until
   vendored.

## Milestone status

|        | Ticket                                    | Done | Notes                        |
| ------ | ----------------------------------------- | ---- | ---------------------------- |
| **M0** | Scaffold & platform skeleton              | ✅   | see `CLAUDE.md` ticket boxes |
| M1     | Core editor (notepad.js.org parity)       | ☐    | next                         |
| M2     | Multi-note + persistence depth            | ☐    |                              |
| M3     | Power UX                                  | ☐    |                              |
| M4     | AI layer (secure)                         | ☐    |                              |
| M5     | Canvas (Excalidraw only — tldraw dropped) | ☐    |                              |
| M6     | Platform & monetisation                   | ☐    |                              |
| M7     | Hardening                                 | ☐    |                              |

## Repo map

```
sveska/
  index.html
  /public        manifest (generated), /brand (icons, fonts, logos), robots, sitemap
  /scripts       check-no-keys · check-bundle · generate-sitemap
  /src
    /app         router, providers, theme, layout, key bindings
    /editor      M1 — textarea/CM, autosave, focus/typewriter
    /notes       Dexie schema (8 tables), prefs CRUD, theme store
    /markdown    M1/M3 — markdown-it + DOMPurify
    /canvas      CanvasProvider seam (Excalidraw vendored at M5)
    /ai          M4 — client → /api/ai proxy
    /platform    glossary · content · lead-gen · analytics + consent
    /ui          Modal · PrefsModal · ThemeSwitch (more to come)
    /lib         debounce (more to come)
    /routes      Home · Glossary · ShareTarget · NotFound
    /styles      tokens.css · fonts.css · global.css
  /server        M4 — edge function /api/ai (key vault)
  /docs          architecture.svg · threat-model.md
```

## License

MIT — see [LICENSE](LICENSE). Brand kit is © Kinetic Gain; use within the app is granted by
the repo licence, redistribution of brand assets outside Sveska is not.
