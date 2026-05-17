# docs/landing

Marketing-site pages for `sveska.studio`, authored by Claude Code Design. **Not part of the M0–M5 deliverable** — these are forward-looking content for **M6.2 (content surface)**.

| File                              | Purpose                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| `landing.html`                    | Marketing homepage (52 KB). The "Inked paper, Sarajevo night" pitch. |
| `about.html`                      | About / mission / Bosnian etymology / studio story                   |
| `changelog.html`                  | Public changelog template — keep in sync with git tags               |
| `field-note-the-folded-page.html` | First long-form essay — voice + brand reference                      |
| `glossary.html`                   | Glossary surface (auto-link target for M6.1 glossary engine)         |
| `press.html`                      | Press kit + brand assets                                             |
| `privacy.html`                    | Privacy policy (already-true: local-first, no trackers)              |
| `roadmap.html`                    | Public roadmap mirror of `plan.md`                                   |

## Wiring

These pages are **not** served by the app today. The app at `sveska.studio` is the editor PWA. When M6.2 lands, options are:

1. **Marketing at apex, app at `/app/*`** — serve `landing.html` at `/`, move the editor to `/app/*`. Requires router refactor.
2. **Marketing at a sibling subdomain** — `studio.sveska.studio` (or similar) hosts the marketing site as a separate Netlify project. App stays at apex.
3. **Marketing at a parent path** — `landing.html` becomes `/marketing/`, app stays at `/`. Apex serves app; `/marketing/` is the public surface.

Decision deferred to M6 kickoff. Until then these are reference docs.

## Don't

- Don't import these HTML files from `src/`. They use external font CDNs and Babel-in-browser — design-doc shortcuts that violate the app's CSP.
- Don't link to them from the app (they 404 on `sveska.studio` until M6).
