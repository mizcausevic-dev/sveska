import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { bootstrapUI } from '@/notes/uiStore';
import { bootstrapEditorPrefs, DEFAULT_EDITOR_PREFS, useEditorPrefs } from '@/notes/editorPrefs';
import { getPref, PREF_KEYS_EDITOR } from '@/notes/prefs';

describe('M1.T1.6 — editor prefs (store + persistence)', () => {
  it('defaults match BRAND.md spec (17 / 1.7 / mono / spellcheck on / tab 2)', () => {
    expect(DEFAULT_EDITOR_PREFS).toEqual({
      fontSize: 17,
      lineHeight: 1.7,
      fontFamily: 'mono',
      spellcheck: true,
      tabSize: 2,
    });
  });

  it('setFontSize persists to Dexie + updates store', async () => {
    await useEditorPrefs.getState().setFontSize(20);
    expect(useEditorPrefs.getState().fontSize).toBe(20);
    await waitFor(async () => {
      expect(await getPref<number>(PREF_KEYS_EDITOR.fontSize)).toBe(20);
    });
  });

  it('setFontFamily persists', async () => {
    await useEditorPrefs.getState().setFontFamily('serif');
    expect(useEditorPrefs.getState().fontFamily).toBe('serif');
    await waitFor(async () => {
      expect(await getPref<string>(PREF_KEYS_EDITOR.fontFamily)).toBe('serif');
    });
  });

  it('setSpellcheck persists boolean', async () => {
    await useEditorPrefs.getState().setSpellcheck(false);
    expect(useEditorPrefs.getState().spellcheck).toBe(false);
    await waitFor(async () => {
      expect(await getPref<boolean>(PREF_KEYS_EDITOR.spellcheck)).toBe(false);
    });
  });

  it('bootstrapEditorPrefs hydrates persisted values', async () => {
    await useEditorPrefs.getState().setFontSize(22);
    await useEditorPrefs.getState().setTabSize(4);

    // Simulate a fresh boot: reset the store in memory, then bootstrap.
    useEditorPrefs.setState(DEFAULT_EDITOR_PREFS);
    expect(useEditorPrefs.getState().fontSize).toBe(17);
    await bootstrapEditorPrefs();
    expect(useEditorPrefs.getState().fontSize).toBe(22);
    expect(useEditorPrefs.getState().tabSize).toBe(4);
  });

  it('reset returns every pref to defaults + persists', async () => {
    await useEditorPrefs.getState().setFontSize(22);
    await useEditorPrefs.getState().setLineHeight(2);
    await useEditorPrefs.getState().setFontFamily('serif');
    await useEditorPrefs.getState().reset();
    expect(useEditorPrefs.getState()).toMatchObject(DEFAULT_EDITOR_PREFS);
    await waitFor(async () => {
      expect(await getPref<number>(PREF_KEYS_EDITOR.fontSize)).toBe(17);
      expect(await getPref<string>(PREF_KEYS_EDITOR.fontFamily)).toBe('mono');
    });
  });
});

describe('M1.T1.6 — prefs modal + editor wiring', () => {
  async function renderApp(): Promise<void> {
    await bootstrapTheme();
    await bootstrapUI();
    await bootstrapEditorPrefs();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  }

  it('changing font family in the modal applies it to the textarea inline style', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: ',', ctrlKey: true });
    await waitFor(() => screen.getByRole('dialog'));
    await userEvent.click(screen.getByTestId('pref-family-serif'));
    const textarea = screen.getByTestId('editor-textarea');
    await waitFor(() =>
      expect((textarea as HTMLTextAreaElement).style.fontFamily).toContain('--font-serif'),
    );
  });

  it('font size slider updates the inline fontSize', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: ',', ctrlKey: true });
    await waitFor(() => screen.getByRole('dialog'));
    const slider = screen.getByTestId('pref-font-size');
    fireEvent.change(slider, { target: { value: '22' } });
    const textarea = screen.getByTestId('editor-textarea');
    await waitFor(() => expect((textarea as HTMLTextAreaElement).style.fontSize).toBe('22px'));
  });

  it('spellcheck toggle flips the textarea attribute', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: ',', ctrlKey: true });
    await waitFor(() => screen.getByRole('dialog'));
    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveAttribute('spellcheck', 'true');
    await userEvent.click(screen.getByTestId('pref-spellcheck'));
    await waitFor(() => expect(textarea).toHaveAttribute('spellcheck', 'false'));
  });

  it('Tab key inserts a tab character and advances the caret', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    (textarea as HTMLTextAreaElement).focus();
    await userEvent.type(textarea, 'abc');
    // userEvent.tab() shifts focus; use fireEvent so onKeyDown fires our handler.
    (textarea as HTMLTextAreaElement).focus();
    fireEvent.keyDown(textarea, { key: 'Tab' });
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toContain('\t'));
  });

  it('reset button restores defaults', async () => {
    await renderApp();
    await useEditorPrefs.getState().setFontSize(22);
    await useEditorPrefs.getState().setFontFamily('serif');
    fireEvent.keyDown(window, { key: ',', ctrlKey: true });
    await waitFor(() => screen.getByRole('dialog'));
    await userEvent.click(screen.getByTestId('pref-reset'));
    await waitFor(() => expect(useEditorPrefs.getState().fontSize).toBe(17));
    expect(useEditorPrefs.getState().fontFamily).toBe('mono');
  });
});
