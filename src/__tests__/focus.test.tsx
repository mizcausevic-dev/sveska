import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { bootstrapUI, useUIStore } from '@/notes/uiStore';
import { getPref, PREF_KEYS_UI } from '@/notes/prefs';

describe('M1.T1.5 — focus mode', () => {
  async function renderApp(): Promise<void> {
    await bootstrapTheme();
    await bootstrapUI();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  }

  it('default state: focus = false, .app-shell--focus absent', async () => {
    await renderApp();
    const shell = screen.getByTestId('app-shell');
    expect(shell.className).not.toContain('app-shell--focus');
    expect(useUIStore.getState().focus).toBe(false);
  });

  it('Alt+F toggles focus mode on + off', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: 'F', altKey: true });
    await waitFor(() =>
      expect(screen.getByTestId('app-shell').className).toContain('app-shell--focus'),
    );
    expect(useUIStore.getState().focus).toBe(true);

    fireEvent.keyDown(window, { key: 'F', altKey: true });
    await waitFor(() =>
      expect(screen.getByTestId('app-shell').className).not.toContain('app-shell--focus'),
    );
    expect(useUIStore.getState().focus).toBe(false);
  });

  it('focus mode persists to Dexie prefs', async () => {
    await renderApp();
    await useUIStore.getState().setFocus(true);
    await waitFor(async () => {
      const stored = await getPref<boolean>(PREF_KEYS_UI.focus);
      expect(stored).toBe(true);
    });
  });

  it('exit chip appears in focus mode and toggles back to default on click', async () => {
    await renderApp();
    expect(screen.queryByTestId('focus-exit')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'F', altKey: true });
    await waitFor(() => expect(screen.getByTestId('focus-exit')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('focus-exit'));
    await waitFor(() => expect(screen.queryByTestId('focus-exit')).not.toBeInTheDocument());
    expect(useUIStore.getState().focus).toBe(false);
  });

  it('macOS Alt+F renders as ƒ — also toggles', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: 'ƒ', altKey: true });
    await waitFor(() => expect(useUIStore.getState().focus).toBe(true));
  });
});
