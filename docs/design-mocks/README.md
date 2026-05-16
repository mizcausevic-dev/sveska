# docs/design-mocks

Forward-looking design specs. **Not part of the M0 deliverable** — they describe milestone work to come and should not be linted, built, or imported by app code.

| File                | Components                                                                                                                                              | Spec for                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `app-shell.html`    | `<AppShell theme=dark\|light mode=default\|focus>` — 1440×900                                                                                           | M1 shell visuals (incl. M1.5 focus mode)                        |
| `ai-flows.html`     | `<PaletteEmpty>`, `<PaletteFiltered>`, `<PaletteContext>`, `<PaletteNoKey>`, `<SlashMenu>`, `<StreamHUD>`, `<DiffPanel>` (all wrapped in `<FlowFrame>`) | M3.1 command palette + M4 slash AI / streaming / diff           |
| `design-canvas.jsx` | `<DesignCanvas>`, `<DCSection>`, `<DCArtboard>`, `TOKENS`, `FONT`, `THEME`, `Icon`                                                                      | shared framework — loaded first by both harnesses               |
| `app-shell.jsx`     | `AppShell` + the editor primitives it composes                                                                                                          | reused by `ai-flows.html` as the background under `<FlowFrame>` |
| `ai-flows.jsx`      | the 7 AI components above                                                                                                                               | adds the palette / menu / HUD / diff overlays                   |

## Run locally

```bash
# from repo root
python -m http.server 9125 --directory docs/design-mocks
# then open
#   http://localhost:9125/app-shell.html
#   http://localhost:9125/ai-flows.html
```

A `.claude/launch.json` entry (`sveska-mocks`) is preconfigured for the harness.

## Design-doc shortcuts

These mockups load fonts from Google Fonts + Fontshare CDN and use Babel-in-browser. Both are **design-doc shortcuts**, not patterns for the app shell — production app fonts stay self-hosted under `public/brand/fonts/` to satisfy the `font-src 'self'` CSP gate.

The JSX files are loaded as plain scripts (`<script type="text/babel">`); top-level declarations become globals, which is how `app-shell.jsx` reaches `TOKENS`/`Icon` and `ai-flows.jsx` reaches `AppShell`. They are **not** intended to be imported into the actual app.
