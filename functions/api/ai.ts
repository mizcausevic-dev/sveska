/**
 * Sveska AI proxy — Cloudflare Pages Function (M4.T4.1, ported from
 * Netlify Edge at the M7+ migration).
 *
 * The browser MUST NOT carry an Anthropic API key — that's a M0
 * non-negotiable (CLAUDE.md §5). This function holds the key in env,
 * validates the request, applies a per-IP token-bucket rate limit, and
 * pipes the upstream SSE stream back to the browser unchanged.
 *
 * Routing: CF Pages turns `functions/api/ai.ts` into `POST /api/ai`
 * automatically. `onRequestPost` only matches POST; other methods 405.
 *
 * Threat model (kept terse so we re-read it):
 *  - **Stolen key**: the key never leaves env. Even if this proxy is
 *    compromised, the `x-api-key` header is set server-side.
 *  - **Abuse / overrun**: per-IP token bucket caps cost. The bucket lives
 *    in module scope — fine for an isolate, resets on cold start.
 *    If sustained abuse hits we move to Workers KV.
 *  - **Prompt injection**: the proxy is content-blind by design. We pass
 *    the user's message through verbatim; safety is enforced upstream.
 *    We DO refuse calls without a `messages` array (basic schema gate).
 *  - **Replay / CSRF**: no cookies; same-origin only.
 *  - **PII leak via logs**: we never log the user message body.
 *
 * Wire-up:
 *  - Secret: `ANTHROPIC_API_KEY` set via CF Pages → Settings → Environment
 *    variables (production scope). Without it the function 503s and the
 *    client degrades silently.
 *  - Model: `claude-haiku-4-5-20251001`. The client cannot override it.
 */

interface Env {
  ANTHROPIC_API_KEY?: string;
}

interface IncomingBody {
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  system?: string;
  max_tokens?: number;
}

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_REQUEST_CHARS = 64_000;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 20_000;
const MAX_SYSTEM_CHARS = 10_000;
const MAX_TOKENS = 2_048;

// Per-IP token bucket. 20 tokens, refilled at 1/3s (≈20 reqs/min steady).
// Module-scope state lives for the lifetime of the Worker isolate.
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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Require an exact same-origin match. Substring matching would accept an
  // attacker-controlled origin such as https://sveska.studio.evil.example.
  const origin = request.headers.get('origin');
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return new Response('Bad request URL', { status: 400 });
  }
  if (!origin || origin !== requestOrigin) {
    return new Response('Forbidden', { status: 403 });
  }

  // CF puts the real client IP in cf-connecting-ip (vs Netlify's context.ip).
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (!take(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'unconfigured' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: IncomingBody;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_CHARS) {
      return new Response('Request too large', { status: 413 });
    }
    body = JSON.parse(rawBody) as IncomingBody;
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  if (
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    body.messages.length > MAX_MESSAGES ||
    body.messages.some(
      (message) =>
        (message.role !== 'user' && message.role !== 'assistant') ||
        typeof message.content !== 'string' ||
        message.content.length === 0 ||
        message.content.length > MAX_MESSAGE_CHARS,
    ) ||
    (body.system !== undefined &&
      (typeof body.system !== 'string' || body.system.length > MAX_SYSTEM_CHARS))
  ) {
    return new Response('messages[] required', { status: 400 });
  }
  const maxTokens =
    typeof body.max_tokens === 'number' && Number.isInteger(body.max_tokens)
      ? Math.min(Math.max(body.max_tokens, 1), MAX_TOKENS)
      : 1024;

  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
      accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens,
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

// Explicit 405 for non-POST so callers see a clear error instead of a
// 404 from CF Pages' static fallback.
export const onRequest: PagesFunction = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
