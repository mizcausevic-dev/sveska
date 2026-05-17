import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { App } from '@/app/App';
import { bootstrapTheme, useThemeStore } from '@/notes/themeStore';
import { getPref, PREF_KEYS } from '@/notes/prefs';

describe('M0 smoke', () => {
  it('renders the brand wordmark and the editor on /', async () => {
    await bootstrapTheme();
    render(<App />);
    expect(screen.getByLabelText('Sveska home')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  });

  it('opens the prefs modal via Ctrl+,', async () => {
    await bootstrapTheme();
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: ',', ctrlKey: true });
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: /Preferences/ })).toBeInTheDocument();
  });

  it('persists theme choice to Dexie prefs and applies data-theme', async () => {
    await bootstrapTheme();
    render(<App />);

    const user = userEvent.setup();
    fireEvent.keyDown(window, { key: ',', ctrlKey: true });
    await waitFor(() => screen.getByRole('dialog'));

    // The modal renders its own ThemeSwitch; find Light within it.
    const dialog = screen.getByRole('dialog');
    const lightBtn = within(dialog, 'Light');
    await user.click(lightBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(useThemeStore.getState().choice).toBe('light');

    await waitFor(async () => {
      const stored = await getPref<string>(PREF_KEYS.theme);
      expect(stored).toBe('light');
    });
  });
});

function within(scope: HTMLElement, text: string): HTMLButtonElement {
  const buttons = scope.querySelectorAll('button');
  for (const b of buttons) {
    if (b.textContent?.trim() === text) return b;
  }
  throw new Error(`No button labeled "${text}" inside scope`);
}
