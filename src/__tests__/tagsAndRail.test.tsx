import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import {
  createNote,
  listPinnedNotes,
  normalizeTags,
  setNotePinned,
  updateNoteTags,
  getNoteById,
} from '@/notes/noteRepo';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M2.T2.4 — noteRepo tag + pin writers', () => {
  it('normalizeTags trims, lowercases, dedupes, drops empties', () => {
    expect(normalizeTags(['  Foo ', 'foo', 'BAR', '', '  ', 'baz'])).toEqual(['foo', 'bar', 'baz']);
  });

  it('updateNoteTags persists the normalized list', async () => {
    const n = await createNote();
    await updateNoteTags(n.id, ['  Project-Alpha ', 'PROJECT-ALPHA', 'oncall']);
    const fresh = await getNoteById(n.id);
    expect(fresh?.tags).toEqual(['project-alpha', 'oncall']);
  });

  it('setNotePinned writes 0/1 + touches updatedAt', async () => {
    const n = await createNote();
    const t0 = n.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    await setNotePinned(n.id, true);
    const after = await getNoteById(n.id);
    expect(after?.pinned).toBe(1);
    expect((after?.updatedAt ?? 0) > t0).toBe(true);
  });

  it('listPinnedNotes returns only pinned, newest-first', async () => {
    const a = await createNote({ title: 'A' });
    const b = await createNote({ title: 'B' });
    const c = await createNote({ title: 'C' });
    await setNotePinned(a.id, true);
    await new Promise((r) => setTimeout(r, 3));
    await setNotePinned(c.id, true);
    const pinned = await listPinnedNotes();
    expect(pinned.map((n) => n.id)).toEqual([c.id, a.id]);
    expect(pinned.find((n) => n.id === b.id)).toBeUndefined();
  });
});

describe('M2.T2.4 — TagsBar UI', () => {
  it('Enter adds a chip; × removes it', async () => {
    await renderApp();
    const input = screen.getByTestId('tag-input');
    await userEvent.type(input, 'oncall{Enter}');
    await waitFor(() => expect(screen.getByTestId('tag-chip-oncall')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('tag-remove-oncall'));
    await waitFor(() => expect(screen.queryByTestId('tag-chip-oncall')).not.toBeInTheDocument());
  });

  it('comma key also commits a tag', async () => {
    await renderApp();
    const input = screen.getByTestId('tag-input');
    await userEvent.type(input, 'urgent,');
    await waitFor(() => expect(screen.getByTestId('tag-chip-urgent')).toBeInTheDocument());
  });

  it('pin toggle reflects in Dexie + button state', async () => {
    await renderApp();
    const id = useTabs.getState().activeNote!.id;
    await userEvent.click(screen.getByTestId('pin-toggle'));
    await waitFor(async () => {
      const fresh = await getNoteById(id);
      expect(fresh?.pinned).toBe(1);
    });
    expect(screen.getByTestId('pin-toggle')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('M2.T2.4 — NotesRail', () => {
  it('shows the active note in the Recent section', async () => {
    await renderApp();
    const id = useTabs.getState().activeNote!.id;
    const rail = screen.getByTestId('notes-rail');
    await waitFor(() => expect(within(rail).getByTestId(`rail-item-${id}`)).toBeInTheDocument());
  });

  it('pinning moves the note from Recent to Pinned', async () => {
    await renderApp();
    const id = useTabs.getState().activeNote!.id;
    await userEvent.click(screen.getByTestId('pin-toggle'));
    await waitFor(() => expect(screen.getByTestId('rail-pinned')).toBeInTheDocument());
    expect(
      within(screen.getByTestId('rail-pinned')).getByTestId(`rail-item-${id}`),
    ).toBeInTheDocument();
  });

  it('Pinned filter hides unpinned notes', async () => {
    await renderApp();
    // Seed: one extra unpinned note so we have something to hide.
    const extra = await createNote({ title: 'Untouched' });
    // Force tabs to refresh the rail (rail subscribes to tab/activeNote mutations).
    await useTabs.getState().openNote(extra.id);
    await waitFor(() => expect(screen.getByTestId(`rail-item-${extra.id}`)).toBeInTheDocument());

    await userEvent.selectOptions(screen.getByTestId('rail-filter'), 'pinned');
    await waitFor(() =>
      expect(screen.queryByTestId(`rail-item-${extra.id}`)).not.toBeInTheDocument(),
    );
  });

  it('Tag filter narrows to notes carrying that tag', async () => {
    await renderApp();
    // Tag the bootstrapped note + create a second untagged note.
    await userEvent.type(screen.getByTestId('tag-input'), 'work{Enter}');
    const taggedId = useTabs.getState().activeNote!.id;
    const other = await createNote({ title: 'No tag' });
    await useTabs.getState().openNote(other.id);

    // Switch back to the tagged one (so the rail re-reads notes-by-id).
    await useTabs.getState().openNote(taggedId);
    await waitFor(() => expect(screen.getByTestId(`rail-item-${other.id}`)).toBeInTheDocument());

    await userEvent.selectOptions(screen.getByTestId('rail-filter'), 'tag:work');
    await waitFor(() =>
      expect(screen.queryByTestId(`rail-item-${other.id}`)).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId(`rail-item-${taggedId}`)).toBeInTheDocument();
  });

  it('rail-toggle collapses → re-expands', async () => {
    await renderApp();
    await userEvent.click(screen.getByTestId('rail-toggle'));
    await waitFor(() => expect(screen.getByTestId('notes-rail-collapsed')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('rail-toggle'));
    await waitFor(() => expect(screen.getByTestId('notes-rail')).toBeInTheDocument());
  });
});
