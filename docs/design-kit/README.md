# docs/design-kit

Self-contained brand-kit documentation from the v2 brand drop.

- `tokens.css` — same tokens as `src/styles/tokens.css` (mirrored here so the kit is portable).
- `system.css` — editorial card-grid stylesheet for **brand-kit documentation pages** (topbar / grid / card primitives / paper-cream variants). **NOT for the app shell** — the app uses `src/styles/global.css` directly on top of tokens.
- `design-system.html` — full brand-kit doc page (the 61 KB v0.2 walkthrough: voice, tokens, type scale, components, motion, dos/donts).
- `design-system-signoff.html` — earlier v0.1 sign-off page (kept for reference).
- `fonts/` — Bricolage Grotesque 700 + JetBrains Mono 600 (mirrored from `public/brand/fonts/` so this folder works without app context).

Use this when authoring a brand-kit doc page. Do not import `system.css` from `src/`.

```bash
# preview locally
python -m http.server 9126 --directory docs/design-kit
# then open:
#   http://localhost:9126/design-system.html
#   http://localhost:9126/design-system-signoff.html
```
