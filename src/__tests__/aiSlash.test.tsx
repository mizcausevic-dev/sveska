import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { useAIRun } from '@/ai/aiRunStore';
import { AI_COMMANDS } from '@/ai/prompts';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

function sseStream(frames: string[], status = 200): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      for (const f of frames) controller.enqueue(enc.encode(f + '\n\n'));
      controller.close();
    },
  });
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/event-stream' },
  });
}

describe('M4.T4.2 — prompts catalog', () => {
  it('declares all 5 commands with unique triggers', () => {
    expect(AI_COMMANDS).toHaveLength(5);
    const triggers = AI_COMMANDS.map((c) => c.trigger);
    expect(new Set(triggers).size).toBe(triggers.length);
    expect(triggers).toEqual(
      expect.arrayContaining(['improve', 'summarize', 'continue', 'rewrite', 'linkedin']),
    );
  });

  it('replaceBody is opt-in (only improve + rewrite default to it)', () => {
    const byId = Object.fromEntries(AI_COMMANDS.map((c) => [c.id, c]));
    expect(byId['ai.improve']?.replaceBody).toBe(true);
    expect(byId['ai.rewrite']?.replaceBody).toBe(true);
    expect(byId['ai.summarize']?.replaceBody).toBeUndefined();
    expect(byId['ai.continue']?.replaceBody).toBeUndefined();
    expect(byId['ai.linkedin']?.replaceBody).toBeUndefined();
    expect(byId['ai.linkedin']?.copyOnComplete).toBe(true);
  });
});

describe('M4.T4.2 — aiRunStore', () => {
  let originalFetch: typeof fetch;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('streams tokens into `result` and ends at status=done', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        sseStream([
          'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"alpha "}}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"beta"}}',
          'event: message_stop\ndata: {"type":"message_stop"}',
        ]),
      ),
    );
    await useAIRun.getState().start('ai.summarize', 'body');
    expect(useAIRun.getState().status).toBe('done');
    expect(useAIRun.getState().result).toBe('alpha beta');
  });

  it('503 surfaces as a toast with kind=warn (proxy unconfigured)', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response('', { status: 503 })));
    await useAIRun.getState().start('ai.improve', 'body');
    expect(useAIRun.getState().status).toBe('error');
    expect(useAIRun.getState().toast?.kind).toBe('warn');
    expect(useAIRun.getState().toast?.text).toContain('AI offline');
    expect(useAIRun.getState().toast?.text).toContain('README');
  });

  it('429 surfaces as error toast', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response('', { status: 429 })));
    await useAIRun.getState().start('ai.improve', 'body');
    expect(useAIRun.getState().toast?.kind).toBe('error');
    expect(useAIRun.getState().toast?.text).toContain('Rate-limited');
  });

  it('copyOnComplete writes the final result to clipboard', async () => {
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (s: string) => {
          copied = s;
          return Promise.resolve();
        },
      },
    });
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        sseStream([
          'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"linkedin post body"}}',
          'event: message_stop\ndata: {"type":"message_stop"}',
        ]),
      ),
    );
    await useAIRun.getState().start('ai.linkedin', 'note');
    expect(copied).toBe('linkedin post body');
    expect(useAIRun.getState().toast?.text).toContain('Copied');
  });
});

describe('M4.T4.2 — palette wires AI commands', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        sseStream([
          'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"improved body"}}',
          'event: message_stop\ndata: {"type":"message_stop"}',
        ]),
      ),
    );
  });

  it('Ctrl+K → "improve" → row appears + Enter triggers a run', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'improve');
    await waitFor(() => expect(screen.getByTestId('palette-row-ai.improve')).toBeInTheDocument());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(useAIRun.getState().status).toBe('done'));
    expect(useAIRun.getState().result).toBe('improved body');
    // Pane should now show the result + Apply button (replaceBody=true).
    await waitFor(() => expect(screen.getByTestId('ai-pane')).toBeInTheDocument());
    expect(screen.getByTestId('ai-apply')).toBeInTheDocument();
  });

  it('Apply swaps the textarea body with the AI result', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'improve');
    await waitFor(() => expect(screen.getByTestId('palette-row-ai.improve')).toBeInTheDocument());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByTestId('ai-apply')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('ai-apply'));
    await waitFor(() => {
      const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
      expect(ta.value).toBe('improved body');
    });
  });
});
