import { describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { clearDraft, readDraft, writeDraft } from '@/notes/draftRepo';
import { saveNoteBody } from '@/notes/noteRepo';
import { useDraftRecovery } from '@/editor/draftRecoveryStore';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M2.T2.3 — draftRepo (pure)', () => {
  it('writeDraft → readDraft round-trips body + savedAt', async () => {
    await writeDraft('n1', 'half-typed');
    const shadow = await readDraft('n1');
    expect(shadow?.body).toBe('half-typed');
    expect(typeof shadow?.savedAt).toBe('number');
  });

  it('readDraft returns null when no shadow exists', async () => {
    const shadow = await readDraft('nope');
    expect(shadow).toBeNull();
  });

  it('clearDraft removes the shadow', async () => {
    await writeDraft('n1', 'oops');
    await clearDraft('n1');
    expect(await readDraft('n1')).toBeNull();
  });

  it('two notes have independent shadows', async () => {
    await writeDraft('a', 'A body');
    await writeDraft('b', 'B body');
    expect((await readDraft('a'))?.body).toBe('A body');
    expect((await readDraft('b'))?.body).toBe('B body');
    await clearDraft('a');
    expect(await readDraft('a')).toBeNull();
    expect((await readDraft('b'))?.body).toBe('B body');
  });
});

describe('M2.T2.3 — autosave writes the shadow on every keystroke', () => {
  it('shadow is updated immediately, not waiting for debounce', async () => {
    await renderApp();
    const id = useTabs.getState().activeNote!.id;

    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'abc');

    // Don't wait the 400ms debounce — check the shadow right away.
    await waitFor(async () => {
      const shadow = await readDraft(id);
      expect(shadow?.body).toBe('abc');
    });
  });

  it('shadow is cleared once the debounced save completes', async () => {
    await renderApp();
    const id = useTabs.getState().activeNote!.id;

    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'final');

    // Wait long enough for the 400ms debounce to flush + the clear to settle.
    await waitFor(
      async () => {
        const shadow = await readDraft(id);
        expect(shadow).toBeNull();
      },
      { timeout: 2000 },
    );
  });
});

/** Seed the active note's saved body + sync the store so the Editor sees it. */
async function seedActiveNote(body: string): Promise<string> {
  const id = useTabs.getState().activeNote!.id;
  await saveNoteBody(id, body);
  await useTabs.getState().refreshActiveNote();
  return id;
}

describe('M2.T2.3 — recovery banner appears for stale shadows', () => {
  it('banner shows when shadow.savedAt > note.updatedAt and bodies differ', async () => {
    const id = await seedActiveNote('saved body');
    // Wait a tick so the shadow's Date.now() is strictly greater than updatedAt.
    await new Promise((r) => setTimeout(r, 5));
    await writeDraft(id, 'unsaved tail');

    await renderApp();
    await waitFor(() => expect(screen.getByTestId('draft-recovery-banner')).toBeInTheDocument());
  });

  it('Keep adopts the shadow into the textarea + note + clears shadow', async () => {
    const id = await seedActiveNote('old body');
    await new Promise((r) => setTimeout(r, 5));
    await writeDraft(id, 'kept body');

    await renderApp();
    await waitFor(() => expect(screen.getByTestId('draft-recovery-banner')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('draft-keep'));

    await waitFor(() =>
      expect(screen.queryByTestId('draft-recovery-banner')).not.toBeInTheDocument(),
    );
    await waitFor(() => {
      const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
      expect(ta.value).toBe('kept body');
    });
    await waitFor(async () => expect(await readDraft(id)).toBeNull());
  });

  it('Discard clears shadow + leaves the textarea on note.body', async () => {
    const id = await seedActiveNote('kept saved');
    await new Promise((r) => setTimeout(r, 5));
    await writeDraft(id, 'unwanted draft');

    await renderApp();
    await waitFor(() => expect(screen.getByTestId('draft-recovery-banner')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('draft-discard'));

    await waitFor(() =>
      expect(screen.queryByTestId('draft-recovery-banner')).not.toBeInTheDocument(),
    );
    const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
    expect(ta.value).toBe('kept saved');
    await waitFor(async () => expect(await readDraft(id)).toBeNull());
  });

  it('does NOT show banner when shadow body matches note body', async () => {
    const id = await seedActiveNote('identical');
    await writeDraft(id, 'identical');

    await renderApp();
    // Give the detection effect a chance to run.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(useDraftRecovery.getState().pending).toBeNull();
    expect(screen.queryByTestId('draft-recovery-banner')).not.toBeInTheDocument();
  });
});
