import { create } from 'zustand';
import { type AIError, runAI } from './aiClient';
import { findAICommand, type AICommandId } from './prompts';

/**
 * Live AI-run state (M4.T4.2). Tracks at most ONE concurrent run; a new
 * run replaces the prior one and the old AbortController is fired.
 *
 * The pane reads from this store; the slash command + palette dispatch
 * `start(id, body)` and the pane updates as tokens arrive.
 */

export type RunStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface ToastMessage {
  kind: 'info' | 'warn' | 'error';
  text: string;
}

interface AIRunState {
  status: RunStatus;
  commandId: AICommandId | null;
  /** Accumulated streamed text. */
  result: string;
  /** Original body the run started against (so Apply can guard against drift). */
  sourceBody: string;
  error: AIError | null;
  toast: ToastMessage | null;
  _controller: AbortController | null;
  start: (id: AICommandId, body: string) => Promise<void>;
  cancel: () => void;
  reset: () => void;
  setToast: (t: ToastMessage | null) => void;
}

export const useAIRun = create<AIRunState>((set, get) => ({
  status: 'idle',
  commandId: null,
  result: '',
  sourceBody: '',
  error: null,
  toast: null,
  _controller: null,
  start: async (id, body) => {
    const spec = findAICommand(id);
    if (!spec) return;
    // Fire the prior run if any.
    get()._controller?.abort();
    const controller = new AbortController();
    set({
      status: 'streaming',
      commandId: id,
      result: '',
      sourceBody: body,
      error: null,
      toast: null,
      _controller: controller,
    });
    try {
      for await (const chunk of runAI({
        messages: [{ role: 'user', content: body || '(empty note)' }],
        system: spec.system,
        signal: controller.signal,
      })) {
        // If a newer run has started, bail.
        if (get()._controller !== controller) return;
        set((s) => ({ result: s.result + chunk }));
      }
      // Successful finish; copy-on-complete commands write to clipboard now.
      const final = get().result;
      if (spec.copyOnComplete && navigator.clipboard) {
        void navigator.clipboard.writeText(final);
        set({ toast: { kind: 'info', text: 'Copied to clipboard.' } });
      }
      set({ status: 'done', _controller: null });
    } catch (err) {
      const e = err as AIError;
      if (e.kind === 'abort') return;
      const text =
        e.kind === 'unconfigured'
          ? 'AI offline — proxy not configured. See src/ai/README.md for the secret-setup command.'
          : e.kind === 'rate_limited'
            ? 'Rate-limited. Try again in a moment.'
            : e.kind === 'upstream'
              ? 'AI upstream failed. Try again.'
              : 'Network error talking to the AI proxy.';
      set({
        status: 'error',
        error: e,
        toast: { kind: e.kind === 'unconfigured' ? 'warn' : 'error', text },
        _controller: null,
      });
    }
  },
  cancel: () => {
    get()._controller?.abort();
    set({ status: 'idle', _controller: null });
  },
  reset: () =>
    set({
      status: 'idle',
      commandId: null,
      result: '',
      sourceBody: '',
      error: null,
      _controller: null,
    }),
  setToast: (t) => set({ toast: t }),
}));
