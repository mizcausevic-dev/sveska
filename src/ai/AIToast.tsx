import { useEffect } from 'react';
import { useAIRun } from './aiRunStore';

/**
 * Tiny global toast for AI status messages (M4.T4.2). Renders when
 * `useAIRun.toast` is set; auto-dismisses after 4 seconds. Uses
 * `aria-live="polite"` so screen readers pick it up.
 */
export function AIToast(): React.JSX.Element | null {
  const toast = useAIRun((s) => s.toast);
  const setToast = useAIRun((s) => s.setToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;
  return (
    <div
      className={`ai-toast ai-toast--${toast.kind}`}
      role="status"
      aria-live="polite"
      data-testid="ai-toast"
    >
      <span className="ai-toast-text">{toast.text}</span>
      <button
        type="button"
        className="ai-toast-close"
        onClick={() => setToast(null)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
