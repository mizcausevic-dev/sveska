import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { db } from '@/notes/db';
import {
  clearSnapshots,
  createSnapshot,
  getLatestSnapshot,
  listSnapshots,
  restoreSnapshot,
} from '@/notes/snapshotRepo';

describe('M1.T1.2 — snapshot repo', () => {
  it('creates a snapshot and persists it to versions', async () => {
    const v = await createSnapshot('n1', 'first draft', 'morning');
    expect(v.noteId).toBe('n1');
    expect(v.body).toBe('first draft');
    expect(v.label).toBe('morning');
    const all = await db().versions.toArray();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(v.id);
  });

  it('lists snapshots newest-first', async () => {
    await createSnapshot('n1', 'a');
    await new Promise((r) => setTimeout(r, 5));
    await createSnapshot('n1', 'b');
    await new Promise((r) => setTimeout(r, 5));
    await createSnapshot('n1', 'c');
    const list = await listSnapshots('n1');
    expect(list.map((v) => v.body)).toEqual(['c', 'b', 'a']);
    const latest = await getLatestSnapshot('n1');
    expect(latest?.body).toBe('c');
  });

  it('restores a snapshot by writing its body back to the note', async () => {
    await db().notes.add({
      id: 'n1',
      title: '',
      body: 'current body',
      mode: 'text',
      tags: [],
      pinned: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    });
    const v = await createSnapshot('n1', 'snapshot body');
    const result = await restoreSnapshot(v.id);
    expect(result).toEqual({ noteId: 'n1', body: 'snapshot body' });
    const note = await db().notes.get('n1');
    expect(note?.body).toBe('snapshot body');
  });

  it('clearSnapshots removes every version for the note (others untouched)', async () => {
    await createSnapshot('n1', 'a');
    await createSnapshot('n1', 'b');
    await createSnapshot('n2', 'c');
    const removed = await clearSnapshots('n1');
    expect(removed).toBe(2);
    const remaining = await db().versions.toArray();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.noteId).toBe('n2');
  });
});

describe('M1.T1.2 — snapshot UI integration', () => {
  async function renderApp(): Promise<void> {
    await bootstrapTheme();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  }

  it('snap-dot starts in idle state with no snapshot + empty body', async () => {
    await renderApp();
    const dot = screen.getByTestId('snap-dot');
    expect(dot).toHaveClass('snap-dot--idle');
    expect(screen.getByTestId('snap-save')).toBeDisabled();
    expect(screen.getByTestId('snap-restore')).toBeDisabled();
    expect(screen.getByTestId('snap-clear')).toBeDisabled();
  });

  it('typing toggles snap-dot to pending (body diverges from latest)', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'unsaved');
    await waitFor(() => expect(screen.getByTestId('snap-dot')).toHaveClass('snap-dot--pending'));
    expect(screen.getByTestId('snap-save')).toBeEnabled();
  });

  it('save flow: pending → saved + count increments + restore enabled', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'v1');
    await userEvent.click(screen.getByTestId('snap-save'));
    await waitFor(() => expect(screen.getByTestId('snap-dot')).toHaveClass('snap-dot--saved'));
    expect(screen.getByTestId('snap-restore')).toBeEnabled();
    expect(screen.getByTestId('snap-clear')).toBeEnabled();
    expect(screen.getByTestId('snap-clear')).toHaveTextContent(/\(1\)/);
  });

  it('restore last replaces the textarea content with the snapshot body', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'original');
    await userEvent.click(screen.getByTestId('snap-save'));
    await waitFor(() => expect(screen.getByTestId('snap-dot')).toHaveClass('snap-dot--saved'));

    await userEvent.type(textarea, ' + edits');
    expect((textarea as HTMLTextAreaElement).value).toBe('original + edits');

    await userEvent.click(screen.getByTestId('snap-restore'));
    await waitFor(() => {
      const t = screen.getByTestId('editor-textarea');
      expect((t as HTMLTextAreaElement).value).toBe('original');
    });
  });

  it('clear all wipes snapshots; dot returns to pending (body remains)', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'something');
    await userEvent.click(screen.getByTestId('snap-save'));
    await waitFor(() => expect(screen.getByTestId('snap-dot')).toHaveClass('snap-dot--saved'));

    await userEvent.click(screen.getByTestId('snap-clear'));
    await waitFor(() => expect(screen.getByTestId('snap-clear')).toBeDisabled());
    expect(screen.getByTestId('snap-dot')).toHaveClass('snap-dot--pending');
  });
});
