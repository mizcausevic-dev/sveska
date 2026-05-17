import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { createNote, updateNoteTags } from '@/notes/noteRepo';
import { addInboxItem, countUnprocessed, listInbox, markProcessed } from '@/notes/inboxRepo';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M2.T2.5 — Search modal', () => {
  it('Ctrl+P opens the search modal; Escape closes', async () => {
    await renderApp();
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}p{/Control}');
    await waitFor(() => expect(screen.getByTestId('search-input')).toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByTestId('search-input')).not.toBeInTheDocument());
  });

  it('typing filters the result list', async () => {
    await renderApp();
    await createNote({ title: 'meeting notes' });
    await createNote({ title: 'shopping list' });
    await userEvent.keyboard('{Control>}p{/Control}');
    await waitFor(() => expect(screen.getByTestId('search-input')).toBeInTheDocument());

    await userEvent.type(screen.getByTestId('search-input'), 'meet');
    await waitFor(() => {
      const rows = screen.getAllByTestId(/^search-row-/);
      expect(rows.length).toBeGreaterThanOrEqual(1);
      // 'meeting notes' should be first
      expect(rows[0]?.textContent).toContain('meeting notes');
    });
  });

  it('Enter opens the highlighted note into a tab + closes the modal', async () => {
    await renderApp();
    const target = await createNote({ title: 'open me' });
    await userEvent.keyboard('{Control>}p{/Control}');
    await waitFor(() => expect(screen.getByTestId('search-input')).toBeInTheDocument());

    await userEvent.type(screen.getByTestId('search-input'), 'open');
    await waitFor(() => expect(screen.getByTestId(`search-row-${target.id}`)).toBeInTheDocument());

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByTestId('search-input')).not.toBeInTheDocument());
    await waitFor(() => expect(useTabs.getState().activeNote?.id).toBe(target.id));
  });

  it('matches against tags-bearing notes via body field too', async () => {
    await renderApp();
    const target = await createNote({ title: 'meta title', body: 'inside body keyword-xyz' });
    await updateNoteTags(target.id, ['work']);
    await userEvent.keyboard('{Control>}p{/Control}');
    await userEvent.type(screen.getByTestId('search-input'), 'keyword-xyz');
    await waitFor(() => expect(screen.getByTestId(`search-row-${target.id}`)).toBeInTheDocument());
  });
});

describe('M2.T2.5 — Inbox repo', () => {
  it('addInboxItem persists with processed=0 + trims the text', async () => {
    const item = await addInboxItem('  pick up milk  ');
    expect(item.text).toBe('pick up milk');
    expect(item.processed).toBe(0);
    expect((await listInbox()).length).toBe(1);
  });

  it('countUnprocessed reflects markProcessed', async () => {
    const a = await addInboxItem('a');
    await addInboxItem('b');
    expect(await countUnprocessed()).toBe(2);
    await markProcessed(a.id);
    expect(await countUnprocessed()).toBe(1);
  });
});

describe('M2.T2.5 — Inbox modal', () => {
  it('Ctrl+Shift+K opens the inbox + Enter captures a line', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>}{Shift>}k{/Shift}{/Control}');
    await waitFor(() => expect(screen.getByTestId('inbox-input')).toBeInTheDocument());

    await userEvent.type(screen.getByTestId('inbox-input'), 'finish T2.5{Enter}');
    await waitFor(() => {
      const rows = screen.getAllByTestId(/^inbox-row-/);
      expect(rows.length).toBe(1);
      expect(rows[0]?.textContent).toContain('finish T2.5');
    });
  });

  it('Promote → Note creates + opens a fresh note + clears the modal', async () => {
    await renderApp();
    const item = await addInboxItem('promotion test');
    await userEvent.keyboard('{Control>}{Shift>}k{/Shift}{/Control}');
    await waitFor(() => expect(screen.getByTestId(`inbox-row-${item.id}`)).toBeInTheDocument());

    await userEvent.click(screen.getByTestId(`inbox-promote-${item.id}`));
    await waitFor(() => expect(screen.queryByTestId('inbox-input')).not.toBeInTheDocument());
    await waitFor(() => expect(useTabs.getState().activeNote?.title).toContain('promotion test'));
  });

  it('rail badge shows the unprocessed count + clears on processed', async () => {
    await renderApp();
    await addInboxItem('first');
    await addInboxItem('second');
    // Open + close inbox to trigger badge refresh.
    await userEvent.keyboard('{Control>}{Shift>}k{/Shift}{/Control}');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByTestId('inbox-badge')).toHaveTextContent('2'));

    // Mark one processed via the repo, then re-open / close to refresh badge.
    const items = await listInbox();
    await markProcessed(items[0]!.id);
    await userEvent.keyboard('{Control>}{Shift>}k{/Shift}{/Control}');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByTestId('inbox-badge')).toHaveTextContent('1'));
  });
});
