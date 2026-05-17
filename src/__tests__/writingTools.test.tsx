import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { useEditorPrefs } from '@/notes/editorPrefs';
import { countWords, formatTimer, useWritingTimer } from '@/editor/writingTimerStore';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M3.T3.6 — writing timer helpers (pure)', () => {
  it('countWords ignores whitespace runs', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('one two three')).toBe(3);
    expect(countWords('  hello\n\nworld  ')).toBe(2);
  });

  it('formatTimer shows m:ss under one hour and h:mm:ss past it', () => {
    expect(formatTimer(0)).toBe('0:00');
    expect(formatTimer(5_000)).toBe('0:05');
    expect(formatTimer(65_000)).toBe('1:05');
    expect(formatTimer(3_725_000)).toBe('1:02:05');
  });

  it('registerInput starts the timer + bumps lastInputAt', () => {
    useWritingTimer.setState({ running: false, elapsedMs: 0, lastInputAt: 0 });
    useWritingTimer.getState().registerInput();
    const s = useWritingTimer.getState();
    expect(s.running).toBe(true);
    expect(s.lastInputAt).toBeGreaterThan(0);
  });
});

describe('M3.T3.6 — editor pref additions (paper + wordGoal)', () => {
  it('setPaper persists the choice', async () => {
    await useEditorPrefs.getState().setPaper('graph');
    expect(useEditorPrefs.getState().paper).toBe('graph');
  });

  it('setWordGoal floors negatives to 0', async () => {
    await useEditorPrefs.getState().setWordGoal(-100);
    expect(useEditorPrefs.getState().wordGoal).toBe(0);
    await useEditorPrefs.getState().setWordGoal(500);
    expect(useEditorPrefs.getState().wordGoal).toBe(500);
  });
});

describe('M3.T3.6 — Paper class applied to textarea', () => {
  it('default mounts as plain', async () => {
    await useEditorPrefs.getState().setPaper('plain');
    await renderApp();
    const ta = screen.getByTestId('editor-textarea');
    expect(ta.className).toContain('editor-input--paper-plain');
  });

  it('switching paper via the store updates the textarea class', async () => {
    await renderApp();
    await useEditorPrefs.getState().setPaper('dotted');
    await waitFor(() =>
      expect(screen.getByTestId('editor-textarea').className).toContain(
        'editor-input--paper-dotted',
      ),
    );
  });
});

describe('M3.T3.6 — Word goal progress bar', () => {
  it('hides when goal is 0', async () => {
    await useEditorPrefs.getState().setWordGoal(0);
    await renderApp();
    expect(screen.queryByTestId('word-goal')).not.toBeInTheDocument();
  });

  it('shows current/goal once a goal is set', async () => {
    await renderApp();
    await useEditorPrefs.getState().setWordGoal(10);
    const ta = screen.getByTestId('editor-textarea');
    await userEvent.click(ta);
    await userEvent.type(ta, 'one two three');
    await waitFor(() => {
      const goal = screen.getByTestId('word-goal');
      expect(goal.textContent).toContain('3/10');
    });
  });
});

describe('M3.T3.6 — Find & Replace bar', () => {
  it('Ctrl+F opens; Escape closes', async () => {
    await renderApp();
    expect(screen.queryByTestId('find-bar')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}f{/Control}');
    await waitFor(() => expect(screen.getByTestId('find-bar')).toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByTestId('find-bar')).not.toBeInTheDocument());
  });

  it('Replace All swaps every match in the body', async () => {
    await renderApp();
    const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
    await userEvent.click(ta);
    await userEvent.type(ta, 'foo bar foo baz foo');

    await userEvent.keyboard('{Control>}f{/Control}');
    await userEvent.type(screen.getByTestId('find-input'), 'foo');
    await userEvent.type(screen.getByTestId('replace-input'), 'XYZ');
    await userEvent.click(screen.getByTestId('find-replace-all'));
    await waitFor(() => expect(ta.value).toBe('XYZ bar XYZ baz XYZ'));
  });

  it('match counter reflects case-insensitive search by default', async () => {
    await renderApp();
    const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
    await userEvent.click(ta);
    await userEvent.type(ta, 'Foo foo FOO');
    await userEvent.keyboard('{Control>}f{/Control}');
    await userEvent.type(screen.getByTestId('find-input'), 'foo');
    await waitFor(() =>
      expect(screen.getByTestId('find-count').textContent).toContain('3 matches'),
    );
  });
});
