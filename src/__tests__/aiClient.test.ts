import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AIError, runAI } from '@/ai/aiClient';

/**
 * Build a fake Response whose body streams the given SSE frames one at a
 * time, with the blank-line separator the spec requires.
 */
function sseResponse(status: number, frames: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      for (const f of frames) controller.enqueue(enc.encode(f + '\n\n'));
      controller.close();
    },
  });
  return new Response(body, { status, headers: { 'content-type': 'text/event-stream' } });
}

function plainResponse(status: number): Response {
  return new Response('nope', { status });
}

describe('M4.T4.1 — runAI (SSE consumer)', () => {
  let originalFetch: typeof fetch;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('yields text deltas from content_block_delta events', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        sseResponse(200, [
          'event: message_start\ndata: {"type":"message_start"}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"hello "}}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"world"}}',
          'event: message_stop\ndata: {"type":"message_stop"}',
        ]),
      ),
    );
    const chunks: string[] = [];
    for await (const c of runAI({ messages: [{ role: 'user', content: 'hi' }] })) chunks.push(c);
    expect(chunks.join('')).toBe('hello world');
  });

  it('ignores non-delta events (message_start, ping)', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        sseResponse(200, [
          'event: message_start\ndata: {"type":"message_start"}',
          'event: ping\ndata: {"type":"ping"}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"x"}}',
        ]),
      ),
    );
    const chunks: string[] = [];
    for await (const c of runAI({ messages: [{ role: 'user', content: 'hi' }] })) chunks.push(c);
    expect(chunks).toEqual(['x']);
  });

  it('maps 503 to AIError("unconfigured")', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve(plainResponse(503)));
    await expect(async () => {
      for await (const _ of runAI({ messages: [{ role: 'user', content: 'hi' }] })) {
        void _;
      }
    }).rejects.toBeInstanceOf(AIError);
    globalThis.fetch = vi.fn(() => Promise.resolve(plainResponse(503)));
    try {
      for await (const _ of runAI({ messages: [{ role: 'user', content: 'hi' }] })) {
        void _;
      }
    } catch (err) {
      expect((err as AIError).kind).toBe('unconfigured');
    }
  });

  it('maps 429 to AIError("rate_limited")', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve(plainResponse(429)));
    try {
      for await (const _ of runAI({ messages: [{ role: 'user', content: 'hi' }] })) {
        void _;
      }
      throw new Error('should have thrown');
    } catch (err) {
      expect((err as AIError).kind).toBe('rate_limited');
    }
  });

  it('maps abort to AIError("abort")', async () => {
    globalThis.fetch = vi.fn(() => {
      const e: Error = new Error('aborted');
      e.name = 'AbortError';
      return Promise.reject(e);
    });
    try {
      for await (const _ of runAI({ messages: [{ role: 'user', content: 'hi' }] })) {
        void _;
      }
      throw new Error('should have thrown');
    } catch (err) {
      expect((err as AIError).kind).toBe('abort');
    }
  });

  it('handles delta split across multiple TCP reads (buffer joins frames)', async () => {
    // Two frames concatenated in a single chunk would also work, but here we
    // verify the split-frame path: one frame across two enqueues.
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(
          enc.encode(
            'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"split"}}',
          ),
        );
        // Half-frame: send the delimiter in a separate read.
        setTimeout(() => {
          controller.enqueue(
            enc.encode(
              '\n\nevent: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":" ok"}}\n\n',
            ),
          );
          controller.close();
        }, 5);
      },
    });
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } }),
      ),
    );
    const chunks: string[] = [];
    for await (const c of runAI({ messages: [{ role: 'user', content: 'hi' }] })) chunks.push(c);
    expect(chunks.join('')).toBe('split ok');
  });
});
