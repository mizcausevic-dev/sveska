import { describe, expect, it } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';

/** Replace a textarea's value via the native setter so React + onChange fire. */
function setTextareaValue(el: HTMLTextAreaElement, value: string): void {
  const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
  desc?.set?.call(el, value);
  act(() => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

/** Save one snapshot via the UI flow, ending with `History` enabled. */
async function saveOneSnapshot(text: string): Promise<void> {
  const textarea = screen.getByTestId('editor-textarea');
  await userEvent.clear(textarea);
  await userEvent.type(textarea, text);
  // Save button only enables when body diverges from latest snapshot.
  await waitFor(() => expect(screen.getByTestId('snap-save')).toBeEnabled());
  await userEvent.click(screen.getByTestId('snap-save'));
  await waitFor(() => expect(screen.getByTestId('snap-history')).toBeEnabled());
}

describe('M2.T2.2 — version history + diff', () => {
  it('History button is disabled when no snapshots exist', async () => {
    await renderApp();
    await waitFor(() => expect(screen.getByTestId('snap-history')).toBeDisabled());
  });

  it('Opens the modal with a list of snapshots after one is saved', async () => {
    await renderApp();
    await saveOneSnapshot('first body');

    await userEvent.click(screen.getByTestId('snap-history'));
    await waitFor(() => expect(screen.getByTestId('versions-list')).toBeInTheDocument());
    expect(screen.getAllByTestId(/^version-/).length).toBeGreaterThanOrEqual(1);
  });

  it('Shows side-by-side diff between selected snapshot and live body', async () => {
    await renderApp();
    await saveOneSnapshot('first body');

    const textarea = screen.getByTestId('editor-textarea');
    setTextareaValue(textarea as HTMLTextAreaElement, 'live body content');

    await userEvent.click(screen.getByTestId('snap-history'));
    await waitFor(() => expect(screen.getByTestId('versions-diff-body')).toBeInTheDocument());
    const body = screen.getByTestId('versions-diff-body');
    expect(body.textContent).toContain('live body content');
    expect(body.textContent).toContain('first body');
  });

  it('Restore writes the snapshot body into the textarea + closes modal', async () => {
    await renderApp();
    await saveOneSnapshot('original snapshot');

    const textarea = screen.getByTestId('editor-textarea');
    setTextareaValue(textarea as HTMLTextAreaElement, 'unwanted edits');

    await userEvent.click(screen.getByTestId('snap-history'));
    await waitFor(() => expect(screen.getByTestId('versions-list')).toBeInTheDocument());

    // First item is the snapshot we just saved.
    const versionItems = screen.getAllByTestId(/^version-/);
    await userEvent.click(versionItems[0]!);

    await userEvent.click(screen.getByTestId('versions-restore'));
    await waitFor(() => expect(screen.queryByTestId('versions-list')).not.toBeInTheDocument());
    await waitFor(() => {
      const ta = screen.getByTestId('editor-textarea');
      expect((ta as HTMLTextAreaElement).value).toBe('original snapshot');
    });
  });

  it('Empty-state message when modal is force-opened with zero snapshots', async () => {
    await renderApp();
    const { openVersions } = await import('@/editor/versionsModalStore');
    openVersions();
    await waitFor(() => expect(screen.getByTestId('versions-empty')).toBeInTheDocument());
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('versions-empty')).not.toBeInTheDocument());
  });
});
