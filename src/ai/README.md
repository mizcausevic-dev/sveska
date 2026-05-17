# AI layer (M4)

## Wire

- **Client**: `src/ai/aiClient.ts` — `runAI({ messages, system?, model?, signal? })`
  returns an async generator of text deltas. Throws `AIError(kind)` where
  `kind ∈ {unconfigured | rate_limited | upstream | network | abort}`.
- **Edge proxy**: `netlify/edge-functions/ai.ts` — Deno function at
  `/api/ai`, declared in `netlify.toml [[edge_functions]]`. Streams
  Anthropic `/v1/messages` SSE back to the browser unchanged.

## Secret

```
netlify env:set ANTHROPIC_API_KEY <your-key> --context production
```

Without the secret, the proxy returns 503 and the client throws
`AIError('unconfigured')` — slash AI surfaces (T4.2) catch this and
show "AI offline" instead of crashing. Browser tests run without a key
by design (mocks `globalThis.fetch` directly).

## Threat model (re-read on every M4 change)

| Vector               | Mitigation                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Stolen API key       | Key never leaves `Deno.env`. `check-no-keys.mjs` scans `dist/` to fail the build if a key shape leaks into the SPA.                     |
| Abuse / cost overrun | Per-IP token bucket (20 reqs, refill 1/3s). In-isolate memory — resets on cold start. Move to Netlify Blobs if sustained abuse appears. |
| Prompt injection     | Proxy is content-blind by design; safety enforced upstream by Anthropic. Schema gate: refuse calls without a `messages[]` array.        |
| Replay / CSRF        | No cookies; same-origin only. Reject when `Origin` doesn't include `Host`.                                                              |
| PII leak via logs    | Body never logged. Errors log status + size only.                                                                                       |

## Why Netlify Edge (not Cloudflare Workers / Vercel Edge)

- Same origin → CSP `default-src 'self'` stays clean.
- One deploy pipeline (already wired via `NETLIFY_AUTH_TOKEN`).
- No new DNS / secret / monitoring surface.
- Deno runtime; ~50 ms cold start is fine for streaming AI.

Decision row in `CLAUDE.md` §9 parking lot.

## Bundle impact

Zero in the initial bundle (aiClient is imported only by slash AI flows
that arrive in T4.2; until then the SPA doesn't pay for any of it).
