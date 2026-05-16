# src/platform

Glossary engine, content surface, lead-gen, analytics + consent. M0 ships only:

- `analytics.ts` — provider interface + no-op default. No third-party scripts in the app shell.
- `consent.ts` + `ConsentBar.tsx` — consent state stored in Dexie prefs, gates analytics.
- `useSeo.ts` — per-route `<title>` / description / canonical / OG meta.

Real analytics vendor is decided at M6 (parking lot §9 row 4) and must be cookieless / self-host.
