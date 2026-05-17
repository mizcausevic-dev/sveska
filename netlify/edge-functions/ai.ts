/**
 * Sveska AI proxy — Netlify Edge Function (M4.T4.1).
 *
 * The browser MUST NOT carry an Anthropic API key — that's a M0
 * non-negotiable (CLAUDE.md §5). This function holds the key in env,
 * validates the request, applies a per-IP token-bucket rate limit, and
 * pipes the upstream SSE stream back to the browser unchanged.
 *
 * Threat model (kept terse so we re-read it):
 *  - **Stolen key**: the key never leaves env. Even if this proxy is
 *    compromised, the bound `x-api-key` header is set server-side.
 *  - **Abuse / overrun**: per-IP token bucket caps cost. The bucket lives
 *    in module scope — fine for an isolate, gets reset on cold start.
 *    If sustained abuse hits we move to Netlify Blobs.
 *  - **Prompt injection**: the proxy is content-blind by design. We pass
 *    the user's message through verbatim; safety is enforced upstream by
 *    Anthropic. We DO refuse calls without a `messages` array (basic
 *    schema gate so callers can't repurpose the proxy).
 *  - **Replay / CSRF**: no cookies; same-origin only (CORS reject
 *    cross-origin POSTs). The client only fetches from sveska.studio.
 *  - **PII leak via logs**: we never log the user message body. Errors
 *    log status + size only.
 *
 * Wire-up:
 *  - Route is `/api/ai` (declared in `netlify.toml [[edge_functions]]`).
 *  - Secret: `ANTHROPIC_API_KEY` set via `netlify env:set`.
 *  - Model: `claude-haiku-4-5-20251001` by default (cheap + fast for
 *    short editor flows). Caller can override via `model` field.
 */

import type { Context } from 'https://edge.netlify.com';

interface IncomingBody {
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  system?: string;
  model?: string;
  max_tokens?: number;
}

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Per-IP token bucket. 20 tokens, refilled at 1/3s (≈20 reqs/min steady).
const RATE_LIMIT: Map<string, { tokens: number; updatedAt: number }> = new Map();
const RATE_REFILL_PER_SEC = 1 / 3;
const RATE_BUCKET_MAX = 20;

function take(ip: string): boolean {
  const now = Date.now();
  const cur = RATE_LIMIT.get(ip);
  if (!cur) {
    RATE_LIMIT.set(ip, { tokens: RATE_BUCKET_MAX - 1, updatedAt: now });
    return true;
  }
  const refilled = Math.min(
    RATE_BUCKET_MAX,
    cur.tokens + ((now - cur.updatedAt) / 1000) * RATE_REFILL_PER_SEC,
  );
  if (refilled < 1) {
    RATE_LIMIT.set(ip, { tokens: refilled, updatedAt: now });
    return false;
  }
  RATE_LIMIT.set(ip, { tokens: refilled - 1, updatedAt: now });
  return true;
}

export default async (request: Request, context: Context): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Same-origin guard: reject cross-origin POSTs even though CSP already
  // blocks them in the browser. Belt + suspenders.
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') ?? '';
  if (origin && !origin.includes(host)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Rate limit by IP (Netlify provides `context.ip`).
  const ip = context.ip ?? 'unknown';
  if (!take(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'unconfigured' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: IncomingBody;
  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response('messages[] required', { status: 400 });
  }

  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: body.model ?? DEFAULT_MODEL,
      max_tokens: body.max_tokens ?? 1024,
      stream: true,
      messages: body.messages,
      ...(body.system ? { system: body.system } : {}),
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const status = upstream.status;
    console.warn('[ai] upstream not ok', { status });
    return new Response(JSON.stringify({ error: 'upstream', status }), {
      status: status === 401 ? 503 : 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  });
};

export const config = { path: '/api/ai' };
