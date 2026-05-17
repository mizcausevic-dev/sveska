import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { DEFAULT_EDITOR_PREFS, useEditorPrefs } from '@/notes/editorPrefs';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M3.T3.5 — editor prefs additions', () => {
  it('setTypewriter persists + updates the store', async () => {
    expect(useEditorPrefs.getState().typewriter).toBe(false);
    await useEditorPrefs.getState().setTypewriter(true);
    expect(useEditorPrefs.getState().typewriter).toBe(true);
  });

  it('setSoundVolume clamps to [0, 1]', async () => {
    await useEditorPrefs.getState().setSoundVolume(1.5);
    expect(useEditorPrefs.getState().soundVolume).toBe(1);
    await useEditorPrefs.getState().setSoundVolume(-0.3);
    expect(useEditorPrefs.getState().soundVolume).toBe(0);
    await useEditorPrefs.getState().setSoundVolume(0.6);
    expect(useEditorPrefs.getState().soundVolume).toBeCloseTo(0.6);
  });

  it('reset restores typewriter + sounds to defaults', async () => {
    await useEditorPrefs.getState().setTypewriter(true);
    await useEditorPrefs.getState().setSounds(true);
    await useEditorPrefs.getState().setSoundVolume(0.9);
    await useEditorPrefs.getState().reset();
    expect(useEditorPrefs.getState().typewriter).toBe(DEFAULT_EDITOR_PREFS.typewriter);
    expect(useEditorPrefs.getState().sounds).toBe(DEFAULT_EDITOR_PREFS.sounds);
    expect(useEditorPrefs.getState().soundVolume).toBe(DEFAULT_EDITOR_PREFS.soundVolume);
  });
});

describe('M3.T3.5 — Prefs UI rows', () => {
  it('typewriter toggle reflects + flips state', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>},{/Control}'); // open Prefs
    await waitFor(() => expect(screen.getByTestId('pref-typewriter')).toBeInTheDocument());
    expect(screen.getByTestId('pref-typewriter')).not.toBeChecked();
    await userEvent.click(screen.getByTestId('pref-typewriter'));
    await waitFor(() => expect(useEditorPrefs.getState().typewriter).toBe(true));
  });

  it('volume slider appears only when sounds is on', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>},{/Control}');
    await waitFor(() => expect(screen.getByTestId('pref-sounds')).toBeInTheDocument());
    expect(screen.queryByTestId('pref-sound-volume')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('pref-sounds'));
    await waitFor(() => expect(screen.getByTestId('pref-sound-volume')).toBeInTheDocument());
  });
});

describe('M3.T3.5 — typewriter scroll', () => {
  it('typewriter on + typing many lines triggers a scrollTop adjustment', async () => {
    await useEditorPrefs.getState().setTypewriter(true);
    await renderApp();
    const textarea = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
    // jsdom doesn't lay out, but the hook still sets scrollTop based on
    // lineHeight math. Stub clientHeight so the math produces a non-zero
    // desired top.
    Object.defineProperty(textarea, 'clientHeight', { value: 200, configurable: true });
    // Force a long body so lineIdx > 0.
    const lines = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n');
    const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    desc?.set?.call(textarea, lines);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    // Bump cursor to the end via a real interaction so React's onChange syncs.
    await userEvent.click(textarea);
    await userEvent.type(textarea, ' x');
    await waitFor(() => expect(textarea.scrollTop).toBeGreaterThan(0));
  });
});
