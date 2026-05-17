import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { bootstrapUI } from '@/notes/uiStore';
import { bootstrapEditorPrefs } from '@/notes/editorPrefs';
import { useTabs } from '@/notes/tabsStore';
import { db } from '@/notes/db';
import { createNote, listNotes } from '@/notes/noteRepo';
import { listTabs } from '@/notes/tabsRepo';
import { getPref, PREF_KEYS_UI, setPref } from '@/notes/prefs';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  await bootstrapUI();
  await bootstrapEditorPrefs();
  await useTabs.getState().bootstrap();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByTestId('tab-bar')).toBeInTheDocument());
}

describe('M2.T2.1 — multi-note tabs', () => {
  it('first boot: opens a fresh note + a single active tab', async () => {
    await renderApp();
    const tabs = await listTabs();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]?.active).toBe(1);
    const notes = await listNotes();
    expect(notes).toHaveLength(1);
  });

  it('+ button creates a new note and switches to it', async () => {
    await renderApp();
    const before = (await listTabs()).length;
    await userEvent.click(screen.getByTestId('tab-new'));
    await waitFor(async () => expect((await listTabs()).length).toBe(before + 1));
    const tabs = await listTabs();
    expect(tabs.filter((t) => t.active === 1)).toHaveLength(1);
  });

  it('clicking a tab activates it; body switches in the textarea', async () => {
    await renderApp();
    // Pre-populate two notes with distinct bodies.
    const a = await createNote({ body: 'note A body' });
    const b = await createNote({ body: 'note B body' });
    await useTabs.getState().openNote(a.id);
    await useTabs.getState().openNote(b.id);

    await waitFor(() => {
      const ta = screen.getByTestId('editor-textarea');
      expect((ta as HTMLTextAreaElement).value).toBe('note B body');
    });

    // Click note A's tab.
    const tabs = useTabs.getState().tabs;
    const tabA = tabs.find((t) => t.noteId === a.id);
    expect(tabA).toBeDefined();
    await userEvent.click(screen.getByTestId(`tab-${tabA!.id}`));
    await waitFor(() => {
      const ta = screen.getByTestId('editor-textarea');
      expect((ta as HTMLTextAreaElement).value).toBe('note A body');
    });
  });

  it('opening an already-open note re-activates its existing tab (no dup)', async () => {
    await renderApp();
    const a = await createNote({ body: 'a' });
    await useTabs.getState().openNote(a.id);
    const tabsCount = (await listTabs()).length;
    await useTabs.getState().openNote(a.id);
    expect((await listTabs()).length).toBe(tabsCount);
  });

  it('close: removes the tab; activates a neighbor; the strip never empties', async () => {
    await renderApp();
    // Use store directly so we can await the async newNote calls.
    await useTabs.getState().newNote();
    await useTabs.getState().newNote();
    await waitFor(() => expect(useTabs.getState().tabs.length).toBe(3));

    const lastTab = useTabs.getState().tabs[2];
    expect(lastTab).toBeDefined();
    await useTabs.getState().close(lastTab!.id);
    await waitFor(() => expect(useTabs.getState().tabs.length).toBe(2));

    // Close all → strip should auto-open a fresh note rather than stay empty.
    for (const t of [...useTabs.getState().tabs]) {
      await useTabs.getState().close(t.id);
    }
    expect(useTabs.getState().tabs.length).toBeGreaterThanOrEqual(1);
    expect(useTabs.getState().activeNote).not.toBeNull();
  });

  it('double-click → inline rename → Enter persists the title', async () => {
    await renderApp();
    const tab = useTabs.getState().tabs[0]!;
    const chip = screen.getByTestId(`tab-${tab.id}`);
    fireEvent.doubleClick(chip);
    const input = await waitFor(() => screen.getByTestId('tab-rename-input'));
    await userEvent.clear(input);
    await userEvent.type(input, 'weekend planning');
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(async () => {
      const n = await db().notes.get(tab.noteId);
      expect(n?.title).toBe('weekend planning');
    });
  });

  it('session restore = true (default): tabs survive a fresh bootstrap', async () => {
    await renderApp();
    const a = await createNote({ body: 'persisted' });
    await useTabs.getState().openNote(a.id);
    const before = (await listTabs()).map((t) => t.id);

    // Simulate a new session by re-bootstrapping the store.
    await useTabs.getState().bootstrap();
    const after = (await listTabs()).map((t) => t.id);
    expect(after).toEqual(before);
  });

  it('session restore = false: previous tabs are wiped on bootstrap, one fresh tab opens', async () => {
    await renderApp();
    const a = await createNote({ body: 'a' });
    await useTabs.getState().openNote(a.id);
    expect((await listTabs()).length).toBeGreaterThanOrEqual(2);

    await setPref(PREF_KEYS_UI.restoreSession, false);
    await useTabs.getState().bootstrap();
    expect((await listTabs()).length).toBe(1);
  });

  it('Open previous session toggle in PrefsModal persists', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: ',', ctrlKey: true });
    await waitFor(() => screen.getByRole('dialog'));
    const toggle = screen.getByTestId('pref-restore-session');
    expect((toggle as HTMLInputElement).checked).toBe(true);
    await userEvent.click(toggle);
    await waitFor(async () => {
      expect(await getPref<boolean>(PREF_KEYS_UI.restoreSession)).toBe(false);
    });
  });
});
