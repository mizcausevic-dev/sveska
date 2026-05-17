import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { useNotesRail } from '@/notes/notesRailStore';
import { useUIStore } from '@/notes/uiStore';
import { buildCommandCatalog } from '@/ui/commandCatalog';
import { getSlashContext } from '@/editor/slashContext';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M3.T3.1 — command catalog', () => {
  it('contains the major user-facing actions', () => {
    const ids = buildCommandCatalog().map((c) => c.id);
    expect(ids).toContain('open.search');
    expect(ids).toContain('open.inbox');
    expect(ids).toContain('new.note');
    expect(ids).toContain('export.txt');
    expect(ids).toContain('view.focus');
    expect(ids).toContain('app.prefs');
    expect(ids).toContain('note.pin.toggle');
  });
});

describe('M3.T3.1 — Command palette modal', () => {
  it('Ctrl+K opens the palette + Escape closes', async () => {
    await renderApp();
    expect(screen.queryByTestId('palette-input')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    await waitFor(() => expect(screen.getByTestId('palette-input')).toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByTestId('palette-input')).not.toBeInTheDocument());
  });

  it('typing filters rows', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'focus');
    await waitFor(() => expect(screen.getByTestId('palette-row-view.focus')).toBeInTheDocument());
    // Search row should not appear for a 'focus' query
    expect(screen.queryByTestId('palette-row-open.search')).toBeNull();
  });

  it('Enter runs the highlighted command — focus mode toggles via palette', async () => {
    await renderApp();
    expect(useUIStore.getState().focus).toBe(false);
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'focus');
    await waitFor(() => expect(screen.getByTestId('palette-row-view.focus')).toBeInTheDocument());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(useUIStore.getState().focus).toBe(true));
  });

  it('clicking a row runs it — toggling the rail via the palette', async () => {
    await renderApp();
    expect(useNotesRail.getState().open).toBe(true);
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'rail');
    await waitFor(() => expect(screen.getByTestId('palette-row-toggle.rail')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('palette-row-toggle.rail'));
    await waitFor(() => expect(useNotesRail.getState().open).toBe(false));
  });
});

describe('M3.T3.1 — getSlashContext (pure)', () => {
  it('returns null when not on a slash line', () => {
    expect(getSlashContext('hello world', 5)).toBeNull();
  });

  it('returns null when there is whitespace before the slash on the same line', () => {
    expect(getSlashContext('  /focus', 8)).toBeNull();
  });

  it('returns the query when cursor is past the slash on a slash-line', () => {
    const ctx = getSlashContext('/foc', 4);
    expect(ctx).not.toBeNull();
    expect(ctx?.query).toBe('foc');
    expect(ctx?.start).toBe(0);
    expect(ctx?.end).toBe(4);
  });

  it('works on a slash line after a newline', () => {
    const ctx = getSlashContext('first\n/exp', 10);
    expect(ctx?.query).toBe('exp');
    expect(ctx?.start).toBe(6);
  });

  it('dismisses on space inside the query', () => {
    expect(getSlashContext('/exp ort', 8)).toBeNull();
  });
});

describe('M3.T3.1 — slash command popover in editor', () => {
  it('typing /foc on a fresh line surfaces the focus command row', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.click(textarea);
    await userEvent.type(textarea, '/foc');
    await waitFor(() => expect(screen.getByTestId('slash-popover')).toBeInTheDocument());
    expect(screen.getByTestId('slash-row-view.focus')).toBeInTheDocument();
  });

  it('Enter runs the slash command + strips the /query from the body', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.click(textarea);
    await userEvent.type(textarea, '/foc');
    await waitFor(() => expect(screen.getByTestId('slash-popover')).toBeInTheDocument());
    expect(useUIStore.getState().focus).toBe(false);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(useUIStore.getState().focus).toBe(true));
    // Body should no longer contain the slash query.
    expect((textarea as HTMLTextAreaElement).value).not.toContain('/foc');
  });
});
