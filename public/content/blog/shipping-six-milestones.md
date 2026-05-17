Sveska went from empty repo to a multi-note PWA with streaming AI assistance and a canvas in 30 commits, spread across two days. Here's what made that possible.

## A spec that fits in one file

The single most important artefact in the repo is `CLAUDE.md` — a ~150-line spec written before any code was. It locks the stack (Vite + React + TS strict + Zustand + Dexie), the architecture principles (store-is-truth, debounced autosave, `CanvasProvider` seam, AI behind a proxy), the data model (eight Dexie tables), the security gates (no client-side keys, CSP `default-src 'self'`, sanitised Markdown), the performance budget (180 KB initial bundle), and the milestone-by-ticket build order.

When you have to make a decision and the answer is in `CLAUDE.md`, you don't decide — you just look it up. That eliminates 80% of the "what shape should this take" debates that normally slow shipping.

## Externalised state for context hygiene

A long-running project means long sessions and long context windows. The repo carries three files that I read at the start of every session, in order:

- `tasks.md` — current TODO + active ticket
- `plan.md` — per-ticket implementation plan (only the active one)
- `memory.md` — locked decisions, deployment topology, gotchas

90% of needed context lives in those three. `CLAUDE.md` itself is the authoritative spec but I only re-read it on architectural changes.

After every ticket I tick `tasks.md`, append to `memory.md` if I learned something durable, and suggest `/compact` if the conversation has grown past 100k tokens.

## Ticket-sized work, real CI for each one

Every ticket has an explicit acceptance criterion. A ticket is done when:

- AC met
- Tests pass
- No new lint or console warnings
- Bundle within budget (`scripts/check-bundle.mjs` enforces 180 KB initial gzip)
- Committed (Conventional Commits)
- `CLAUDE.md` ticket box ticked in the same commit

The push triggers a build that runs typecheck → lint → tests → key-leak scanner → bundle-budget gate → Netlify deploy. Six gates in series mean shipped code is shipped.

## The numbers, after M5

- **6 milestones** shipped (M0 → M5); 2 remaining (M6 platform, M7 hardening)
- **237 unit tests**, all green
- **Initial bundle 176.78 KB gzip** — under the 180 KB budget
- **Lazy chunks** that don't count against budget: jsPDF (~223 KB), Excalidraw (~2.6 MB)
- **Zero API keys in the client**, enforced by a regex scan of every build output

## The trade

If you want to ship features at velocity, write down the rules before you write the code. The cost is one focused planning day. The payoff is dozens of decisions you don't have to re-litigate later, and a CI pipeline that won't let you regress.

The map first. Then the territory.

— Miz, 2026-05-17

[Read the spec](https://github.com/mizcausevic-dev/sveska/blob/main/CLAUDE.md) · [Glossary](/glossary)
