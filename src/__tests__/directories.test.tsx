import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { createDirectory, deleteDirectoryTree, flattenDirectories } from '@/notes/directoryRepo';
import { useDirectories } from '@/notes/directoryStore';
import { createNote, getNoteById, setNoteDirectory } from '@/notes/noteRepo';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('v0.9 — local-first directories', () => {
  it('flattens nested directories in parent-first depth order', async () => {
    const root = await createDirectory('Clients');
    const child = await createDirectory('Acme', root.id);
    const rows = flattenDirectories(useDirectories.getState().directories);
    expect(rows).toHaveLength(0);

    await useDirectories.getState().refresh();
    const fresh = flattenDirectories(useDirectories.getState().directories);
    expect(fresh.map((row) => [row.name, row.depth])).toEqual([
      ['Clients', 0],
      ['Acme', 1],
    ]);
    expect(child.parentId).toBe(root.id);
  });

  it('deleting a directory tree preserves notes and moves them to Unfiled', async () => {
    const root = await createDirectory('Work');
    const child = await createDirectory('Research', root.id);
    const note = await createNote({ title: 'Keep me', directoryId: child.id });

    await deleteDirectoryTree(root.id);

    const fresh = await getNoteById(note.id);
    expect(fresh?.directoryId).toBeNull();
  });

  it('creates a directory in the rail and moves the active note into it', async () => {
    await renderApp();
    await userEvent.click(screen.getByTestId('directory-new-root'));
    await userEvent.type(screen.getByTestId('directory-name-input'), 'Client work');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(useDirectories.getState().directories).toHaveLength(1));
    const directory = useDirectories.getState().directories[0]!;
    const noteId = useTabs.getState().activeNote!.id;

    await userEvent.selectOptions(screen.getByTestId('note-directory'), directory.id);
    await waitFor(async () => {
      expect((await getNoteById(noteId))?.directoryId).toBe(directory.id);
    });
  });

  it('directory selection filters notes while All notes restores the full rail', async () => {
    const directory = await createDirectory('Filed');
    const filed = await createNote({ title: 'Filed note' });
    await setNoteDirectory(filed.id, directory.id);
    const unfiled = await createNote({ title: 'Loose note' });
    await useTabs.getState().openNote(filed.id);
    await useTabs.getState().openNote(unfiled.id);

    await renderApp();
    await useDirectories.getState().refresh();
    await userEvent.click(screen.getByTestId(`directory-${directory.id}`));
    await waitFor(() => expect(screen.getByTestId(`rail-item-${filed.id}`)).toBeInTheDocument());
    expect(screen.queryByTestId(`rail-item-${unfiled.id}`)).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('directory-all'));
    await waitFor(() => expect(screen.getByTestId(`rail-item-${unfiled.id}`)).toBeInTheDocument());
  });
});
