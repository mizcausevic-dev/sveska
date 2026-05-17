# Security review — Sveska (M7)

Walkthrough of every clause in `CLAUDE.md §5` against shipped code.
Date: 2026-05-17 · Reviewer: maintainer · Pass = ✅, Watch = ⚠️, Fail = ❌.

> Companion to [`threat-model.md`](./threat-model.md). The threat model lists
> _what we are defending_; this doc records _whether the defenses hold_.

---

## §5.1 — "AI key only in edge function env. Client has no key, ever."

| Check                                                    | Status | Evidence                                                                                                                                            |
| -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI key reads from CF Pages env, never a `VITE_*` var     | ✅     | [`functions/api/ai.ts`](../functions/api/ai.ts) — `env.ANTHROPIC_API_KEY` (Workers runtime; encrypted at rest)                                      |
| Client bundle scanned for key-shaped strings every build | ✅     | [`scripts/check-no-keys.mjs`](../scripts/check-no-keys.mjs) — runs in `pnpm build`; fails the build on any `VITE_*_API_KEY`, `sk-ant-*`, `Bearer …` |
| AI client only POSTs to `/api/ai` (same-origin)          | ✅     | [`src/ai/aiClient.ts`](../src/ai/aiClient.ts) — no other origin                                                                                     |
| Graceful degradation if proxy missing (503/401)          | ✅     | Edge function 503s when key unset; client surfaces a single-line warning and disables AI commands                                                   |

**Verdict:** Pass. The grep gate is the load-bearing control — keep its
allowlist empty.

---

## §5.2 — "CSP header: `default-src 'self'`; allow only the AI proxy origin + self."

| Check                                        | Status | Evidence                                                                                                                                                                |
| -------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSP meta in `index.html`                     | ✅     | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; …; connect-src 'self'; frame-ancestors 'none'`                                                |
| CSP header in `public/_headers` (CF Pages)   | ✅     | Mirrors the meta exactly                                                                                                                                                |
| AI proxy origin allowlisted in `connect-src` | ✅     | Proxy is same-origin (`/api/ai`) so `'self'` already covers it. No third-party origin needed — same-origin was the whole point of picking an edge host (parking-lot #2) |
| `frame-ancestors 'none'` (anti-clickjack)    | ✅     | Both meta + header                                                                                                                                                      |
| `object-src 'none'` (anti-Flash/plugin)      | ✅     | Both                                                                                                                                                                    |
| `style-src` allows `'unsafe-inline'`         | ⚠️     | Required for `tokens.css` runtime theme switching (CSS vars on `:root`). Acceptable risk; no inline `<script>` allowed                                                  |

**Verdict:** Pass with one tracked exception (`style-src 'unsafe-inline'`).
The exception does not enable script injection.

---

## §5.3 — "DOMPurify on all rendered Markdown/HTML import."

| Surface                  | Status | Evidence                                                                                                                                                  |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Note preview (MD mode)   | ✅     | [`src/markdown/render.ts`](../src/markdown/render.ts) — `DOMPurify.sanitize(md.render(src))`                                                              |
| HTML export              | ✅     | [`src/markdown/export.ts`](../src/markdown/export.ts) — same pipeline + glossary autolink run on already-sanitized HTML                                   |
| Changelog page           | ✅     | [`src/routes/Changelog.tsx`](../src/routes/Changelog.tsx) — content from `public/content/*.md`, rendered via the same sanitizer                           |
| Blog page                | ✅     | [`src/routes/BlogPost.tsx`](../src/routes/BlogPost.tsx) — same pipeline                                                                                   |
| Imported `.txt` / `.md`  | ✅     | [`src/lib/importFiles.ts`](../src/lib/importFiles.ts) — file content is treated as text (not rendered) on import; preview path goes through the sanitizer |
| Glossary autolink output | ✅     | [`src/platform/glossary.ts`](../src/platform/glossary.ts) — walks the already-sanitized DOM with DOMParser, wraps with `<a class>` only, no user HTML     |

**Verdict:** Pass. Every render path passes user-controllable text through
`DOMPurify` before `dangerouslySetInnerHTML`.

---

## §5.4 — "Hash-share encodes note in URL fragment (`#`) only — never sent to a server."

| Check                                     | Status | Evidence                                                                               |
| ----------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| Encoder writes to `location.hash` only    | ✅     | [`src/lib/hashShare.ts`](../src/lib/hashShare.ts) — `location.hash = '#sv1=' + base64` |
| Decoder reads `location.hash` only        | ✅     | Same file — `parseHashShare(location.hash)`                                            |
| No `fetch` / `XHR` of the encoded payload | ✅     | Grep `hash-share` / `hashShare`: no network call site                                  |
| User warned the link is plaintext         | ✅     | Share modal includes "Anyone with this link can read the note" copy + copy-link button |
| Browser DOES NOT send `#` to servers      | ✅     | Standard HTTP behavior — documented for the reviewer's sake, not enforced by us        |

**Verdict:** Pass. Note bodies never leave the browser via the hash-share path.

---

## §5.5 — "Optional sync (post-M6) must be E2E-encrypted or not shipped."

| Check                                                       | Status    | Evidence                                                                                          |
| ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| Sync feature shipped?                                       | ❌ (none) | No sync code exists. Parking-lot row 3 keeps the decision deferred                                |
| Pro tier on `/pricing` references sync as "coming soon"     | ✅        | [`src/routes/Pricing.tsx`](../src/routes/Pricing.tsx) — Pro tier shows waitlist, not a buy button |
| If sync ships later, gate is: payload is ciphertext at rest | ⏸ planned | Tracked in parking-lot row 3                                                                      |

**Verdict:** Pass (vacuously — nothing to encrypt yet). Re-review at sync ship.

---

## §5.6 — "No third-party trackers in the app shell. Analytics = privacy-respecting, self-host or cookieless, behind consent."

| Check                                                                 | Status | Evidence                                                                                                 |
| --------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `index.html` includes no third-party `<script>`                       | ✅     | Grep `<script src=` in `index.html`: only the Vite entry                                                 |
| Analytics seam is no-op until vendor lands                            | ✅     | [`src/platform/analytics.ts`](../src/platform/analytics.ts) — consent-gated; writes locally only         |
| Lead-gen events stored locally, not POSTed                            | ✅     | [`src/platform/leadgen.ts`](../src/platform/leadgen.ts) — `trackLead` writes to Dexie `prefs.leadEvents` |
| CSP `connect-src 'self'` would block a tracker even if one slipped in | ✅     | Defense in depth                                                                                         |

**Verdict:** Pass. Vendor decision still open (parking-lot row 4); when it
lands, re-verify CSP `connect-src`, no cookies, and consent UI.

---

## Additional hardening landed in M7

| Item                           | Status | Evidence                                                                                                                                                                      |
| ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top-level React error boundary | ✅     | [`src/app/ErrorBoundary.tsx`](../src/app/ErrorBoundary.tsx) — wraps `<App />` in `main.tsx`                                                                                   |
| Accessibility sweep (axe)      | ✅     | [`src/__tests__/a11y.test.tsx`](../src/__tests__/a11y.test.tsx) — App shell + /glossary + /pricing pass `vitest-axe` (color-contrast + region rules skipped per file comment) |
| Bundle budget gate             | ✅     | `pnpm build` runs [`scripts/check-bundle.mjs`](../scripts/check-bundle.mjs) and [`scripts/check-no-keys.mjs`](../scripts/check-no-keys.mjs)                                   |
| Tab-bar a11y refactor          | ✅     | `role="toolbar"` instead of nested `role="tab" > button` (a11y test caught the original violation)                                                                            |

---

## Known accepted risks

| Risk                                                        | Why accepted                                                                                                                              | Mitigation                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Local malware can read IndexedDB                            | Out of scope for a browser app; would require a native sandbox                                                                            | Document in user-facing privacy page; E2E-sync option when it ships       |
| Browser extensions can read DOM (steal note content)        | Same reasoning                                                                                                                            | Same                                                                      |
| Hash-share link in clipboard / browser history is plaintext | The whole point of hash-share is portability; encrypting would require a passphrase exchange that defeats one-click sharing               | UI warns the user explicitly before generating the link                   |
| `style-src 'unsafe-inline'`                                 | Theme switching uses CSS variables on `:root`; lifting to nonces would require server-rendered HTML, which would break the local-first SW | `script-src` stays strict; inline style cannot exfiltrate data on its own |

---

## Review cadence

- This document refreshes at every milestone close.
- Next mandatory review: at sync ship (post-M6, gated by §5.5).
- Add a row whenever a new network egress, a new render path, or a new
  third-party dependency lands.
