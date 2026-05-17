# Threat model — Sveska

Tracked against CLAUDE.md §5. Items marked **[gated]** are enforced now; **[planned]** land with the related milestone.

## Assets

- User notes (sensitive: may contain PII, credentials, IP).
- User identity (currently none — no account required; revisit if Pro tier ships at M6).
- AI proxy API key (server-side env only).

## Trust boundary

The browser is **untrusted** for secrets. Everything inside the SW is local-only. The single network egress is the AI proxy at `https://api.sveska.studio` (subdomain TBD).

## Controls

| #   | Control                                       | Status                | Where                                               |
| --- | --------------------------------------------- | --------------------- | --------------------------------------------------- |
| 1   | No `VITE_*_API_KEY` in client bundle          | **[gated]**           | `scripts/check-no-keys.mjs` runs in `pnpm build`    |
| 2   | CSP `default-src 'self'`                      | **[gated]**           | `index.html` meta + `public/_headers` (CF Pages)    |
| 3   | DOMPurify on rendered HTML/MD                 | **[planned M3]**      | `src/markdown/`                                     |
| 4   | Hash-share = URL fragment only                | **[planned M3]**      | `src/lib/hash-share.ts`                             |
| 5   | Edge proxy rate-limit + key vault             | **[planned M4]**      | `server/`                                           |
| 6   | Optional sync is E2E-encrypted or not shipped | **[planned post-M6]** | parking lot §9 row 3                                |
| 7   | No third-party trackers in app shell          | **[gated]**           | analytics seam is no-op until consent + vendor land |

## Out-of-scope risks

- Local malware reading IndexedDB. Mitigation: encourage Pro-tier E2E sync once it lands; document threat in user-facing privacy page.
- Browser extensions reading DOM. Same posture.

## Review cadence

- Every milestone close reviews this doc against `scripts/check-no-keys.mjs` output.
- Full security review at M7 (T7.1).
