# docs/design-mocks

Forward-looking design specs. **Not part of the M0 deliverable** — they describe milestone work to come and should not be linted, built, or imported by app code.

| File             | Spec for                                 | Notes                                                                                                                                                                          |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app-shell.html` | M1 shell visuals (incl. M1.5 focus mode) | Three desktop artboards: `dark/default`, `light/default`, `focus-dark` (Alt+F).                                                                                                |
| `ai-flows.html`  | M3.1 command palette + M4 slash AI       | Eight artboards across `⌘K · Command palette` (empty / filtered / context picker / graceful no-key) and `AI in the editor` (slash menu / streaming HUD / diff · dark + light). |

Both HTML harnesses reference external Babel-in-browser JSX files (`design-canvas.jsx`, `app-shell.jsx`, `ai-flows.jsx`) that are pending — they will land here when sent. The current HTMLs alone won't render anything meaningful without the JSX.

Both mockups load fonts from Google Fonts + Fontshare CDN. That is a **design-doc shortcut**, not a pattern for the app shell — production app fonts stay self-hosted under `public/brand/fonts/` to satisfy the `font-src 'self'` CSP gate.
