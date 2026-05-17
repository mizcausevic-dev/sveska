/**
 * Client wrapper around the M4.T4.1 edge proxy at `/api/ai`.
 *
 * The proxy returns a Server-Sent Events stream of Anthropic message
 * delta events. We parse them incrementally and surface a plain
 * AsyncIterable of strings (only the text content of `content_block_delta`
 * events) so consumers don't have to know the wire format.
 *
 * Failure modes:
 *   - 503  → proxy isn't configured (no API key set in env). Surface as
 *     `AIError('unconfigured')` so the slash AI UI can show a friendly
 *     "AI offline" hint instead of crashing.
 *   - 429  → rate-limited. Surface as `AIError('rate_limited')`.
 *   - 502  → upstream Anthropic failure. Surface as `AIError('upstream')`.
 */

export type AIErrorKind = 'unconfigured' | 'rate_limited' | 'upstream' | 'network' | 'abort';

export class AIError extends Error {
  constructor(
    public kind: AIErrorKind,
    message?: string,
  ) {
    super(message ?? kind);
    this.name = 'AIError';
  }
}

export interface AIRunOpts {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  system?: string;
  model?: string;
  signal?: AbortSignal;
}

/**
 * Returns an async generator of token deltas. Consumer pattern:
 *
 *   for await (const chunk of runAI({ messages: [...] })) {
 *     setOutput((s) => s + chunk);
 *   }
 */
export async function* runAI(opts: AIRunOpts): AsyncGenerator<string, void, void> {
  let res: Response;
  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(opts),
      ...(opts.signal ? { signal: opts.signal } : {}),
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new AIError('abort');
    throw new AIError('network', (err as Error).message);
  }

  if (res.status === 503) throw new AIError('unconfigured');
  if (res.status === 429) throw new AIError('rate_limited');
  if (!res.ok || !res.body) throw new AIError('upstream', `status ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // SSE frames are separated by a blank line. Process each completed
      // frame and keep any trailing partial in the buffer.
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const chunk = extractTextDelta(frame);
        if (chunk) yield chunk;
      }
    }
    // Flush any final frame.
    if (buffer.trim()) {
      const chunk = extractTextDelta(buffer);
      if (chunk) yield chunk;
    }
  } finally {
    reader.releaseLock();
  }
}

/** Parse an Anthropic SSE frame and pull out a text delta (or null). */
function extractTextDelta(frame: string): string | null {
  // Each frame is `event: <name>\ndata: <json>` (possibly multiple `data:` lines).
  const dataLines = frame
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim());
  if (dataLines.length === 0) return null;
  const payload = dataLines.join('');
  if (payload === '[DONE]' || payload === '') return null;
  try {
    const obj = JSON.parse(payload) as {
      type?: string;
      delta?: { type?: string; text?: string };
    };
    if (obj.type === 'content_block_delta' && obj.delta?.type === 'text_delta') {
      return obj.delta.text ?? '';
    }
    return null;
  } catch {
    return null;
  }
}
