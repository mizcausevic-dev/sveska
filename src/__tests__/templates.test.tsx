import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import {
  createUserTemplate,
  deleteUserTemplate,
  listTemplates,
  seedBuiltinTemplates,
} from '@/notes/templatesRepo';
import {
  createSnippet,
  findTriggerAt,
  listSnippets,
  seedBuiltinSnippets,
} from '@/notes/snippetsRepo';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M3.T3.4 — templates repo', () => {
  it('seedBuiltinTemplates is idempotent', async () => {
    await seedBuiltinTemplates();
    const first = await listTemplates();
    await seedBuiltinTemplates();
    const second = await listTemplates();
    expect(first.length).toBe(second.length);
    expect(first.length).toBeGreaterThanOrEqual(5); // 5 built-ins
  });

  it('createUserTemplate adds a row with kind=user', async () => {
    await seedBuiltinTemplates();
    const beforeCount = (await listTemplates()).length;
    const t = await createUserTemplate('My start', '# Hi\n\n');
    expect(t.kind).toBe('user');
    expect((await listTemplates()).length).toBe(beforeCount + 1);
  });

  it('deleteUserTemplate removes a user template but not a built-in', async () => {
    await seedBuiltinTemplates();
    const t = await createUserTemplate('Temp', '');
    await deleteUserTemplate(t.id);
    expect((await listTemplates()).find((x) => x.id === t.id)).toBeUndefined();
    // Try to delete a built-in — should be a no-op.
    const builtin = (await listTemplates()).find((x) => x.kind === 'builtin')!;
    await deleteUserTemplate(builtin.id);
    expect((await listTemplates()).find((x) => x.id === builtin.id)).toBeDefined();
  });
});

describe('M3.T3.4 — snippets repo', () => {
  it('seedBuiltinSnippets is idempotent', async () => {
    await seedBuiltinSnippets();
    const first = await listSnippets();
    await seedBuiltinSnippets();
    const second = await listSnippets();
    expect(first.length).toBe(second.length);
    expect(first.length).toBeGreaterThanOrEqual(3);
  });

  it('findTriggerAt matches longest trigger at end of prefix', async () => {
    await createSnippet(';ab', 'short');
    await createSnippet(';abc', 'long');
    expect((await findTriggerAt('hello ;abc'))?.trigger).toBe(';abc');
    expect((await findTriggerAt('hello ;ab'))?.trigger).toBe(';ab');
    expect(await findTriggerAt('plain text')).toBeNull();
  });
});

describe('M3.T3.4 — Templates modal UI', () => {
  it('Ctrl+T opens the templates modal with the Templates tab active', async () => {
    await renderApp();
    expect(screen.queryByTestId('templates-list')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}t{/Control}');
    await waitFor(() => expect(screen.getByTestId('templates-list')).toBeInTheDocument());
    expect(screen.getByTestId('templates-tab-templates')).toHaveAttribute('aria-selected', 'true');
  });

  it('New note from built-in template opens a fresh tab with the body', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>}t{/Control}');
    await waitFor(() => expect(screen.getByTestId('templates-list')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('template-apply-builtin.meeting'));
    await waitFor(() => expect(screen.queryByTestId('templates-list')).not.toBeInTheDocument());
    await waitFor(() => {
      const active = useTabs.getState().activeNote;
      expect(active?.title).toBe('Meeting notes');
      expect(active?.body).toContain('# Meeting');
    });
  });

  it('snippet typeahead expands the trigger in place', async () => {
    await renderApp();
    // Wait for built-in seed (;date) to land.
    await waitFor(async () => {
      const all = await listSnippets();
      expect(all.find((s) => s.trigger === ';date')).toBeDefined();
    });

    const textarea = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
    await userEvent.click(textarea);
    await userEvent.type(textarea, 'today is ;date');

    await waitFor(() => {
      const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
      expect(ta.value).toBe('today is <YYYY-MM-DD>');
    });
  });
});
