import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Top-level error boundary (M7.T7.1). Catches any uncaught render error
 * in a route or modal and shows a recovery screen instead of a blank
 * page. The user's data is never at risk — Dexie writes already
 * happened on prior keystrokes — but the UI thread can still crash.
 *
 * Three recovery affordances:
 *   - Reload — re-runs the SPA bootstrap; recovers from most transient
 *     issues (stale lazy chunk after a deploy, transient memory blip).
 *   - Copy details — copies a short error report to the clipboard so
 *     the user can paste it into a bug report.
 *   - Open the editor — same-origin link back to / so the user can
 *     keep writing in a fresh shell while we file the bug.
 */

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ info });
    // Console log is the closest we have to a logger; an analytics
    // vendor (post-M6) could subscribe here too.
    console.error('[sveska] uncaught render error:', error, info);
  }

  reset = (): void => {
    this.setState({ error: null, info: null });
  };

  reload = (): void => {
    window.location.reload();
  };

  copy = (): void => {
    const { error, info } = this.state;
    if (!error || !navigator.clipboard) return;
    const text = [
      'Sveska crash report',
      `When: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `Message: ${error.message}`,
      `Name: ${error.name}`,
      '',
      'Stack:',
      error.stack ?? '(none)',
      '',
      'Component stack:',
      info?.componentStack ?? '(none)',
    ].join('\n');
    void navigator.clipboard.writeText(text);
  };

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    const msg = this.state.error.message;
    return (
      <main className="crash" data-testid="error-boundary">
        <article>
          <h1>Something went wrong.</h1>
          <p className="lead">
            The editor hit an unexpected error. Your notes are still safe — they live in your
            browser's IndexedDB, written before this crash.
          </p>
          <pre className="crash-msg" data-testid="error-boundary-msg">
            {msg}
          </pre>
          <div className="crash-actions">
            <button
              type="button"
              className="snap-btn snap-btn--primary"
              onClick={this.reload}
              data-testid="error-boundary-reload"
            >
              Reload
            </button>
            <button
              type="button"
              className="snap-btn"
              onClick={this.copy}
              data-testid="error-boundary-copy"
            >
              Copy details
            </button>
            <a className="snap-btn" href="/" onClick={this.reset}>
              Open the editor
            </a>
          </div>
          <p className="crash-meta mono">
            If this keeps happening, paste the copied report into a new issue at{' '}
            <a href="https://github.com/mizcausevic-dev/sveska/issues">
              github.com/mizcausevic-dev/sveska/issues
            </a>
            .
          </p>
        </article>
      </main>
    );
  }
}
