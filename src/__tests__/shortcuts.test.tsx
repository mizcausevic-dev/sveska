import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { bootstrapUI, useUIStore } from '@/notes/uiStore';
import { bootstrapEditorPrefs } from '@/notes/editorPrefs';
import { db } from '@/notes/db';
import { useShortcutsModal } from '@/ui/shortcutsModalStore';
import { useEditorCommands } from '@/editor/editorCommands';

describe('M1.T1.7 — keyboard shortcuts + cheatsheet', () => {
  async function renderApp(): Promise<void> {
    await bootstrapTheme();
    await bootstrapUI();
    await bootstrapEditorPrefs();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
    // Wait until note hydration completes (export-txt becomes enabled, which
    // means `note` state is set + the editor commands have been registered
    // with the live note in scope).
    await waitFor(() => expect(screen.getByTestId('export-txt')).toBeEnabled());
  }

  it('Ctrl+? opens the shortcuts cheatsheet and lists every binding', async () => {
    await renderApp();
    // Diagnostic: dispatch the keydown and immediately inspect store state.
    fireEvent.keyDown(window, { key: '?', ctrlKey: true });
    console.warn('after Ctrl+?: open=', useShortcutsModal.getState().open);
    console.warn('registered commands:', Object.keys(useEditorCommands.getState().commands));
    await waitFor(() => expect(screen.getByTestId('shortcuts-list')).toBeInTheDocument());
    const list = screen.getByTestId('shortcuts-list');
    expect(list.textContent).toMatch(/Preferences/);
    expect(list.textContent).toMatch(/Statistics/);
    expect(list.textContent).toMatch(/Save \/ export as .txt/);
    expect(list.textContent).toMatch(/Copy whole note to clipboard/);
    expect(list.textContent).toMatch(/Clear note/);
    expect(list.textContent).toMatch(/Toggle focus mode/);
  });

  it("Alt+F still toggles focus mode (regression — wasn't broken by new bindings)", async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: 'F', altKey: true });
    await waitFor(() => expect(useUIStore.getState().focus).toBe(true));
  });

  describe('Ctrl+S triggers .txt export', () => {
    let createObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURL = vi.fn(() => 'blob:test/ctrl-s');
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    });
    afterEach(() => {
      delete (URL as unknown as Record<string, unknown>).createObjectURL;
      delete (URL as unknown as Record<string, unknown>).revokeObjectURL;
      vi.restoreAllMocks();
    });

    it('exports the current body as a .txt download', async () => {
      await renderApp();
      const textarea = screen.getByTestId('editor-textarea');
      await userEvent.type(textarea, 'shortcut export');
      fireEvent.keyDown(window, { key: 's', ctrlKey: true });
      await waitFor(() => expect(createObjectURL).toHaveBeenCalled());
    });
  });

  describe('Alt+C copies body to clipboard', () => {
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeText = vi.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
    });

    it('writes the textarea body to the clipboard', async () => {
      await renderApp();
      const textarea = screen.getByTestId('editor-textarea');
      await userEvent.type(textarea, 'copy me');
      fireEvent.keyDown(window, { key: 'c', altKey: true });
      await waitFor(() => expect(writeText).toHaveBeenCalledWith('copy me'));
    });
  });

  describe('Ctrl+Del clears body via confirm modal', () => {
    it('Ctrl+Del shows confirm; cancel keeps body; accept clears + persists', async () => {
      await renderApp();
      const textarea = screen.getByTestId('editor-textarea');
      await userEvent.type(textarea, 'to be cleared');

      // Press Ctrl+Del → confirm dialog
      fireEvent.keyDown(window, { key: 'Delete', ctrlKey: true });
      await waitFor(() => expect(screen.getByTestId('clear-cancel')).toBeInTheDocument());

      // Cancel — body untouched
      await userEvent.click(screen.getByTestId('clear-cancel'));
      await waitFor(() => expect(screen.queryByTestId('clear-cancel')).not.toBeInTheDocument());
      const taAfterCancel = screen.getByTestId('editor-textarea');
      expect((taAfterCancel as HTMLTextAreaElement).value).toBe('to be cleared');

      // Press again, accept this time
      fireEvent.keyDown(window, { key: 'Delete', ctrlKey: true });
      await waitFor(() => expect(screen.getByTestId('clear-confirm')).toBeInTheDocument());
      await userEvent.click(screen.getByTestId('clear-confirm'));

      await waitFor(() => {
        const ta = screen.getByTestId('editor-textarea');
        expect((ta as HTMLTextAreaElement).value).toBe('');
      });
      // Body persisted to Dexie
      await waitFor(async () => {
        const notes = await db().notes.toArray();
        expect(notes[0]?.body).toBe('');
      });
    });
  });
});
