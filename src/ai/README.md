# src/ai

Reserved for M4. `aiClient.run(command, context)` → `POST /api/ai`. The proxy lives in
`server/` and injects the key; the browser never sees one. Client degrades gracefully if
the proxy is unconfigured (401). Security gate: zero `VITE_*_API_KEY` in the client
bundle (enforced by `scripts/check-no-keys.mjs`).
