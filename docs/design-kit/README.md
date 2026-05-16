# docs/design-kit

Self-contained brand-kit documentation stylesheet from the v2 brand drop.

- `tokens.css` — same tokens as `src/styles/tokens.css` (mirrored here so the kit is portable).
- `system.css` — editorial card-grid stylesheet for **brand-kit documentation pages** (topbar / grid / card primitives / paper-cream variants). **NOT for the app shell** — the app uses `src/styles/global.css` directly on top of tokens.
- `fonts/` — Bricolage Grotesque 700 + JetBrains Mono 600 (same as `public/brand/fonts/`, duplicated so this folder works without app context).

Use this when authoring a brand-kit doc page (similar in spirit to the
`Sveska Design System - Sign-off.html`). Do not import `system.css` from
`src/`.
