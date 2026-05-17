# AI layer (M4)

## Wire

- **Client**: `src/ai/aiClient.ts` — `runAI({ messages, system?, model?, signal? })`
  returns an async generator of text deltas. Throws `AIError(kind)` where
  `kind ∈ {unconfigured | rate_limited | upstream | network | abort}`.
- **Edge proxy**: `functions/api/ai.ts` — Cloudflare Pages Function at
  `/api/ai` (the directory layout under `functions/` maps directly to
  the URL path). Streams Anthropic `/v1/messages` SSE back to the
  browser unchanged.

## Secret

Set in the Cloudflare dashboard:

> **CF Pages → Project → Settings → Environment variables → Production →
> Add variable** · Name: `ANTHROPIC_API_KEY` · Type: **Secret** (encrypted)

Or via wrangler (after first deploy creates the project):

```
wrangler pages secret put ANTHROPIC_API_KEY --project-name=sveska
```

Without the secret, the proxy returns 503 and the client throws
`AIError('unconfigured')` — slash AI surfaces (T4.2) catch this and show
"AI offline" instead of crashing. Browser tests run without a key by
design (mocks `globalThis.fetch` directly).

## Threat model (re-read on every M4 change)

| Vector               | Mitigation                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Stolen API key       | Key never leaves CF Pages env (encrypted). `check-no-keys.mjs` scans `dist/` to fail the build if a key shape leaks into the SPA.    |
| Abuse / cost overrun | Per-IP token bucket (20 reqs, refill 1/3s). In-isolate memory — resets on cold start. Move to Workers KV if sustained abuse appears. |
| Prompt injection     | Proxy is content-blind by design; safety enforced upstream by Anthropic. Schema gate: refuse calls without a `messages[]` array.     |
| Replay / CSRF        | No cookies; same-origin only. Reject when `Origin` doesn't include `Host`.                                                           |
| PII leak via logs    | Body never logged. Errors log status + size only.                                                                                    |

## Why Cloudflare Pages (was Netlify Edge through M5)

- **Cost** — CF Pages free tier covers 500 builds/mo + unlimited
  bandwidth + 100k function invocations/day. Netlify free tier ran out
  of build minutes mid-M6 (forcing the migration). Pro plan would have
  been $19/mo, which wasn't justified for a side project.
- **Same architecture** — static + edge function at the same origin →
  CSP `default-src 'self'` stays clean, no new DNS or secret surface.
- **Workers runtime** — V8 isolate, fetch + Streams APIs identical to
  Deno. The port from `Deno.env.get(...)` → `env.ANTHROPIC_API_KEY` and
  `context.ip` → `request.headers.get('cf-connecting-ip')` was the only
  meaningful API delta.

Migration commit: see `git log -- functions/api/ai.ts`.

## Bundle impact

Zero in the initial bundle (aiClient is imported only by slash AI flows
that arrive in T4.2; until then the SPA doesn't pay for any of it).
