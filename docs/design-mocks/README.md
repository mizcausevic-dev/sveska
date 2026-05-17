# docs/design-mocks

Forward-looking design specs from Claude Code Design. **Not part of the M0 deliverable** — they describe milestone work to come and should not be linted, built, or imported by app code.

## Harnesses (HTML)

| File                    | Components                                                                                                                                      | Spec for                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `app-shell.html`        | `<AppShell theme=dark\|light mode=default\|focus>` — 1440×900                                                                                   | M1 shell visuals (incl. M1.5 focus mode)              |
| `ai-flows.html`         | `<PaletteEmpty>`, `<PaletteFiltered>`, `<PaletteContext>`, `<PaletteNoKey>`, `<SlashMenu>`, `<StreamHUD>`, `<DiffPanel>` (all in `<FlowFrame>`) | M3.1 command palette + M4 slash AI / streaming / diff |
| `firstnote-motion.html` | `<Stage>` + `<AnimatedScene>` + `<Keyframe>` (14s loop)                                                                                         | M0/M1 onboarding motion — empty → first snapshot      |
| `mobile-pwa.html`       | `<MobilePWA>` inside iOS + Android device frames                                                                                                | M1 mobile layout                                      |
| `multinote.html`        | `<MultiNoteChrome>` + `<MultiNoteScreens>`                                                                                                      | M2 multi-note tabs · session restore · diff           |
| `settings.html`         | `<Settings>`                                                                                                                                    | M1.6 preferences full design                          |

## Modules (JSX)

| File                                             | Provides                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `design-canvas.jsx`                              | `<DesignCanvas>` + `<DCSection>` + `<DCArtboard>` — pan/zoom/reorder/inline-edit framework with sidecar state persistence |
| `app-shell.jsx`                                  | `<AppShell>` + shell primitives — window bar, tab strip, sidebar, editor body, statusbar                                  |
| `ai-flows.jsx`                                   | the 7 AI components above                                                                                                 |
| `animations.jsx`                                 | `<Stage>` timeline + `<Keyframe>` static renderer (motion harness)                                                        |
| `firstnote-scene.jsx`                            | `<AnimatedScene>` — empty notebook → first snapshot 14s scene                                                             |
| `settings.jsx`                                   | `<Settings>` panel — full M1.6 preferences spec                                                                           |
| `mobile.jsx`                                     | `<MobilePWA>` — mobile composition                                                                                        |
| `ios-frame.jsx` / `android-frame.jsx`            | device chrome wrappers (status bar, notch, home indicator)                                                                |
| `multinote-chrome.jsx` / `multinote-screens.jsx` | M2 multi-note variations                                                                                                  |

The DesignCanvas wrapper supports interactive reordering / inline editing / fullscreen focus mode (←/→/Esc). State persists to a `.design-canvas.state.json` sidecar via the host's `window.omelette` runtime when present; when served as plain static files (`python -m http.server`), edits don't persist but artboards still render.

## Run locally

```bash
# from repo root
python -m http.server 9125 --directory docs/design-mocks
# then open any harness:
#   http://localhost:9125/app-shell.html
#   http://localhost:9125/ai-flows.html
#   http://localhost:9125/firstnote-motion.html
#   http://localhost:9125/mobile-pwa.html
#   http://localhost:9125/multinote.html
#   http://localhost:9125/settings.html
```

A `.claude/launch.json` entry (`sveska-mocks`) is preconfigured.

## Design-doc shortcuts

The harnesses load fonts from Google Fonts + Fontshare CDN and use Babel-in-browser. Both are **design-doc shortcuts**, not patterns for the app shell — production app fonts stay self-hosted under `public/brand/fonts/` to satisfy the `font-src 'self'` CSP gate. The JSX files are loaded as plain scripts so top-level declarations become globals; they are **not** intended to be imported into the actual app.
