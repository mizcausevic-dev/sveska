import { findAICommand } from './prompts';
import { useAIRun } from './aiRunStore';

interface Props {
  /** Editor passes its setBody so Apply can swap the textarea value. */
  onApply: (next: string) => void;
}

/**
 * Side pane that streams the live AI result (M4.T4.2). Mounts only when a
 * run is active (or has a result waiting for Apply / Discard). Shows the
 * command label + a Cancel button while streaming, then Apply (for
 * body-replacing commands) / Copy / Discard once done.
 */
export function AIResultPane({ onApply }: Props): React.JSX.Element | null {
  const status = useAIRun((s) => s.status);
  const commandId = useAIRun((s) => s.commandId);
  const result = useAIRun((s) => s.result);
  const cancel = useAIRun((s) => s.cancel);
  const reset = useAIRun((s) => s.reset);
  const setToast = useAIRun((s) => s.setToast);

  if (status === 'idle') return null;
  const spec = commandId ? findAICommand(commandId) : null;
  if (!spec) return null;

  function onCopy(): void {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(result);
    setToast({ kind: 'info', text: 'Copied AI result.' });
  }

  function onApplyClick(): void {
    onApply(result);
    reset();
  }

  return (
    <aside className="ai-pane" aria-live="polite" data-testid="ai-pane">
      <header className="ai-pane-head">
        <span className="ai-pane-label mono">{spec.label}</span>
        <span className="ai-pane-status mono" data-testid="ai-pane-status">
          {status === 'streaming' && '· streaming…'}
          {status === 'done' && '· done'}
          {status === 'error' && '· failed'}
        </span>
        <span className="ai-pane-spacer" />
        {status === 'streaming' ? (
          <button
            type="button"
            className="snap-btn snap-btn--danger"
            onClick={cancel}
            data-testid="ai-cancel"
          >
            Cancel
          </button>
        ) : (
          <>
            {spec.replaceBody && status === 'done' && (
              <button
                type="button"
                className="snap-btn snap-btn--primary"
                onClick={onApplyClick}
                data-testid="ai-apply"
              >
                Apply
              </button>
            )}
            <button type="button" className="snap-btn" onClick={onCopy} data-testid="ai-copy">
              Copy
            </button>
            <button
              type="button"
              className="snap-btn snap-btn--danger"
              onClick={reset}
              data-testid="ai-discard"
            >
              Discard
            </button>
          </>
        )}
      </header>
      <pre className="ai-pane-body" data-testid="ai-pane-body">
        {result || (status === 'streaming' ? 'Thinking…' : '')}
      </pre>
    </aside>
  );
}
