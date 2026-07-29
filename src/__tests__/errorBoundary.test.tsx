import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/app/ErrorBoundary';

function Boom({ when }: { when: boolean }): React.JSX.Element {
  if (when) throw new Error('synthetic boom');
  return <div data-testid="children-ok">ok</div>;
}

describe('M7.T7.1 — ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <Boom when={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('children-ok')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  it('catches a render error + shows the crash screen + the error message', () => {
    // React logs the error to console.error during catch; silence it so the
    // test output stays clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Boom when={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary-msg').textContent).toContain('synthetic boom');
    // Recovery affordances are present.
    expect(screen.getByTestId('error-boundary-reload')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary-copy')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary-repair')).toHaveAttribute(
      'href',
      '/share-target/recover.html',
    );
    spy.mockRestore();
  });

  it('Copy details button writes a structured report to the clipboard', () => {
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
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Boom when={true} />
      </ErrorBoundary>,
    );
    screen.getByTestId('error-boundary-copy').click();
    expect(copied).toContain('Sveska crash report');
    expect(copied).toContain('synthetic boom');
    expect(copied).toContain('When:');
    spy.mockRestore();
  });
});
