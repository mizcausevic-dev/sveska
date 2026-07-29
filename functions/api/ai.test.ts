import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from './ai';

const endpoint = 'https://sveska.studio/api/ai';
const validBody = JSON.stringify({
  messages: [{ role: 'user', content: 'Tighten this sentence.' }],
});

function context(request: Request): never {
  return {
    request,
    env: { ANTHROPIC_API_KEY: 'test-key' },
  } as never;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AI proxy request boundary', () => {
  it('rejects an attacker origin that merely contains the production hostname', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const request = new Request(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://sveska.studio.evil.example',
      },
      body: validBody,
    });

    const response = (await onRequestPost(context(request))) as Response;

    expect(response.status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('rejects requests without a browser origin', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const request = new Request(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: validBody,
    });

    const response = (await onRequestPost(context(request))) as Response;

    expect(response.status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('pins the model and clamps the token budget before calling upstream', async () => {
    const upstream = vi.fn().mockResolvedValue(
      new Response('data: [DONE]\n\n', {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      }),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new Request(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://sveska.studio',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Summarize this.' }],
        model: 'attacker-controlled-model',
        max_tokens: 999_999,
      }),
    });

    const response = (await onRequestPost(context(request))) as Response;
    const init = upstream.mock.calls[0]?.[1] as RequestInit;
    const upstreamBody = JSON.parse(String(init.body)) as {
      model: string;
      max_tokens: number;
    };

    expect(response.status).toBe(200);
    expect(upstreamBody.model).toBe('claude-haiku-4-5-20251001');
    expect(upstreamBody.max_tokens).toBe(2048);
  });

  it('rejects oversized request bodies before calling upstream', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const request = new Request(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://sveska.studio',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'x'.repeat(64_000) }],
      }),
    });

    const response = (await onRequestPost(context(request))) as Response;

    expect(response.status).toBe(413);
    expect(upstream).not.toHaveBeenCalled();
  });
});
