# docs/design-mocks

Forward-looking design specs from Claude Code Design. **Not part of the M0/M1 deliverable** — they describe milestone work to come and should not be linted, built, or imported by app code.

## Harnesses (HTML)

| File                       | Spec for                                                    |
| -------------------------- | ----------------------------------------------------------- |
| `app-shell.html`           | M1 shell visuals (incl. M1.5 focus mode)                    |
| `ai-flows.html`            | M3.1 command palette + M4 slash AI / streaming / diff       |
| `firstnote-motion.html`    | M0/M1 onboarding motion — empty → first snapshot (14s loop) |
| `mobile-pwa.html`          | M1 mobile layout — iOS + Android device frames              |
| `multinote.html`           | M2 multi-note tabs · session restore · diff                 |
| `settings.html`            | M1.6 preferences full design                                |
| `onboarding.html`          | first-run flow + privacy-respecting tutorial                |
| `canvas.html`              | M5 canvas mock (Excalidraw seam)                            |
| `templates-snippets.html`  | M3.4 templates + snippet manager                            |
| `inbox.html`               | M2.5 quick-capture inbox                                    |
| `keyboard-cheatsheet.html` | M1.7 shortcuts overlay                                      |
| `notifications.html`       | toast + banner UX patterns                                  |
| `error-empty-states.html`  | error / empty / loading reference                           |
| `web-share-target.html`    | M3.7 Web Share target capture flow                          |
| `print-export.html`        | M3.7 print/PDF visual reference                             |
| `migration.html`           | notepad.js.org → Sveska migration scene                     |
| `motion-spec.html`         | animation timing/easing/reduced-motion reference            |
| `brand-collateral.html`    | brand assets sheet (logos, marks, type, palette swatches)   |
| `a11y-audit.html`          | WCAG audit checklist + Sveska-specific a11y rules           |

## Modules (JSX)

| File                                             | Provides                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `design-canvas.jsx`                              | `<DesignCanvas>` + `<DCSection>` + `<DCArtboard>` — pan/zoom/reorder/inline-edit framework with sidecar state persistence |
| `app-shell.jsx`                                  | `<AppShell>` + shell primitives — window bar, tab strip, sidebar, editor body, statusbar                                  |
| `ai-flows.jsx`                                   | palette + slash menu + streaming HUD + diff panel                                                                         |
| `animations.jsx`                                 | `<Stage>` timeline + `<Keyframe>` static renderer                                                                         |
| `firstnote-scene.jsx`                            | `<AnimatedScene>` — 14s onboarding scene                                                                                  |
| `settings.jsx`                                   | full M1.6 preferences panel design                                                                                        |
| `mobile.jsx`                                     | `<MobilePWA>` mobile composition                                                                                          |
| `ios-frame.jsx` / `android-frame.jsx`            | device chrome wrappers                                                                                                    |
| `multinote-chrome.jsx` / `multinote-screens.jsx` | M2 multi-note variations                                                                                                  |
| `canvas.jsx`                                     | M5 canvas mock (Excalidraw seam visualization)                                                                            |
| `onboarding.jsx`                                 | first-run scenes (paired with `onboarding.html`)                                                                          |
| `templates.jsx`                                  | M3.4 templates UI                                                                                                         |

The `DesignCanvas` wrapper supports interactive reordering / inline editing / fullscreen focus (←/→/Esc). State persists to a `.design-canvas.state.json` sidecar via the host's `window.omelette` runtime; with plain static serving (`python -m http.server`), edits don't persist but artboards still render.

## Run locally

```bash
# from repo root
python -m http.server 9125 --directory docs/design-mocks
# then open any harness, e.g.:
#   http://localhost:9125/app-shell.html
#   http://localhost:9125/onboarding.html
#   http://localhost:9125/keyboard-cheatsheet.html
```

A `.claude/launch.json` entry (`sveska-mocks`) is preconfigured.

## Design-doc shortcuts

The harnesses load fonts from Google Fonts + Fontshare CDN and use Babel-in-browser. Both are **design-doc shortcuts**, not patterns for the app shell — production app fonts stay self-hosted under `public/brand/fonts/` to satisfy the `font-src 'self'` CSP gate. JSX files are loaded as plain scripts so top-level declarations become globals; **not** intended to be imported into the actual app.
