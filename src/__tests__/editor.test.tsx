import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { db } from '@/notes/db';
import { getOrCreateActiveNote } from '@/notes/noteRepo';

describe('M1.T1.1 — editor + autosave', () => {
  async function renderApp(): Promise<void> {
    await bootstrapTheme();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  }

  it('hydrates an empty note and shows the editor', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    expect((textarea as HTMLTextAreaElement).value).toBe('');
    expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('Prazna sveska'));
  });

  it('autosaves to Dexie ~400ms after the last keystroke', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'hello world');

    await waitFor(
      async () => {
        const after = await db().notes.toArray();
        expect(after[0]?.body).toBe('hello world');
      },
      { timeout: 2000 },
    );
  });

  it('flushes immediately on blur (does not wait the full 400ms debounce)', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'flush me');
    window.dispatchEvent(new Event('blur'));

    await waitFor(
      async () => {
        const after = await db().notes.toArray();
        expect(after[0]?.body).toBe('flush me');
      },
      { timeout: 250 },
    );
  });

  it('flushes on visibilitychange when the tab is hidden', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'tab away');

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(
      async () => {
        const after = await db().notes.toArray();
        expect(after[0]?.body).toBe('tab away');
      },
      { timeout: 250 },
    );

    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  });

  it('survives refresh: getOrCreateActiveNote returns the saved body', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'persisted across reload');
    window.dispatchEvent(new Event('blur'));

    await waitFor(
      async () => {
        const note = await getOrCreateActiveNote();
        expect(note.body).toBe('persisted across reload');
      },
      { timeout: 2000 },
    );
  });
});
