import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { getNoteById, setNoteMode } from '@/notes/noteRepo';
import { moveLine, parseChecklist, serializeChecklist, summarize, toggleAt } from '@/lib/checklist';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

/** Seed body via the textarea (so the Editor's local state catches it) and
 * flip the active note to checklist mode. The textarea path is what real
 * users hit; the Editor only re-syncs body from Dexie when the note ID
 * changes, so direct saveNoteBody seeds would never make it on screen. */
async function makeActiveChecklist(body: string): Promise<string> {
  const id = useTabs.getState().activeNote!.id;
  const textarea = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
  const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
  desc?.set?.call(textarea, body);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  await setNoteMode(id, 'checklist');
  await useTabs.getState().refreshActiveNote();
  return id;
}

describe('M3.T3.3 — parseChecklist (pure)', () => {
  it('recognises unchecked / checked rows + preserves indent', () => {
    const items = parseChecklist('- [ ] one\n  - [x] two indented');
    expect(items).toEqual([
      { kind: 'task', indent: '', done: false, text: 'one' },
      { kind: 'task', indent: '  ', done: true, text: 'two indented' },
    ]);
  });

  it('round-trips through serialize without drift', () => {
    const src = '- [ ] a\n- [x] b\n\n  - [ ] nested\n- [X] caps';
    const items = parseChecklist(src);
    // Capital X is normalised to lowercase x in serialize.
    expect(serializeChecklist(items)).toBe('- [ ] a\n- [x] b\n\n  - [ ] nested\n- [x] caps');
  });

  it('non-matching lines are kept as passthrough so prose survives reorder', () => {
    const items = parseChecklist('intro paragraph\n- [ ] task\nfooter');
    expect(items[0]).toEqual({ kind: 'passthrough', text: 'intro paragraph' });
    expect(items[2]).toEqual({ kind: 'passthrough', text: 'footer' });
  });

  it('toggleAt flips the done flag at the given index', () => {
    const items = parseChecklist('- [ ] one\n- [x] two');
    const next = toggleAt(items, 0);
    expect((next[0] as { done: boolean }).done).toBe(true);
    expect((next[1] as { done: boolean }).done).toBe(true); // untouched
  });

  it('moveLine shifts a row and preserves surrounding passthrough lines', () => {
    const items = parseChecklist('- [ ] a\n- [ ] b\n- [ ] c');
    // Move 'a' (idx 0) to where 'c' is (idx 2)
    const next = moveLine(items, 0, 2);
    expect(serializeChecklist(next)).toBe('- [ ] b\n- [ ] c\n- [ ] a');
  });

  it('summarize counts only tasks', () => {
    const items = parseChecklist('header\n- [ ] one\n- [x] two\n- [x] three\nfooter');
    expect(summarize(items)).toEqual({ total: 3, done: 2 });
  });
});

describe('M3.T3.3 — mode cycle TXT → MD → CHK → TXT', () => {
  it('clicking the toggle three times returns to text', async () => {
    await renderApp();
    const btn = screen.getByTestId('mode-toggle');
    expect(btn).toHaveTextContent('TXT');
    await userEvent.click(btn);
    await waitFor(() => expect(screen.getByTestId('mode-toggle')).toHaveTextContent('MD'));
    await userEvent.click(screen.getByTestId('mode-toggle'));
    await waitFor(() => expect(screen.getByTestId('mode-toggle')).toHaveTextContent('CHK'));
    await userEvent.click(screen.getByTestId('mode-toggle'));
    await waitFor(() => expect(screen.getByTestId('mode-toggle')).toHaveTextContent('TXT'));
  });
});

describe('M3.T3.3 — Checklist pane UI', () => {
  it('renders parsed tasks with checkboxes + summary', async () => {
    await renderApp();
    await makeActiveChecklist('- [ ] alpha\n- [x] beta');
    await waitFor(() => expect(screen.getByTestId('checklist-pane')).toBeInTheDocument());
    expect(screen.getByTestId('checklist-box-0')).not.toBeChecked();
    expect(screen.getByTestId('checklist-box-1')).toBeChecked();
    expect(screen.getByTestId('checklist-pane').textContent).toContain('1/2 done');
  });

  it('clicking a checkbox toggles the source line + autosaves the note', async () => {
    const id = await (async (): Promise<string> => {
      await renderApp();
      return makeActiveChecklist('- [ ] do thing');
    })();
    await waitFor(() => expect(screen.getByTestId('checklist-box-0')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('checklist-box-0'));
    await waitFor(() => expect(screen.getByTestId('checklist-box-0')).toBeChecked());
    // Autosave: wait for the textarea to show the new source text.
    await waitFor(() => {
      const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
      expect(ta.value).toBe('- [x] do thing');
    });
    // And Dexie should match after the debounced save settles.
    await waitFor(
      async () => {
        const fresh = await getNoteById(id);
        expect(fresh?.body).toBe('- [x] do thing');
      },
      { timeout: 2000 },
    );
  });

  it('Hide done filter hides checked rows from the pane', async () => {
    await renderApp();
    await makeActiveChecklist('- [ ] open\n- [x] closed');
    await waitFor(() => expect(screen.getByTestId('checklist-row-0')).toBeInTheDocument());
    expect(screen.getByTestId('checklist-row-1')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('checklist-filter-toggle'));
    await waitFor(() => expect(screen.queryByTestId('checklist-row-1')).not.toBeInTheDocument());
    expect(screen.getByTestId('checklist-row-0')).toBeInTheDocument();
  });

  it('empty-state hint shows when no tasks are present', async () => {
    await renderApp();
    await makeActiveChecklist('just prose, no checkboxes');
    await waitFor(() => expect(screen.getByTestId('checklist-empty')).toBeInTheDocument());
  });
});
