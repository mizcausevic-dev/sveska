import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { buildMarkdownTable, insertMarkdownTable } from '@/editor/markdownTable';
import { getNoteById } from '@/notes/noteRepo';

describe('v0.9 — Markdown table insertion', () => {
  it('builds the requested row and column dimensions', () => {
    const table = buildMarkdownTable(2, 3);
    expect(table.split('\n')).toHaveLength(4);
    expect(table).toContain('| Column 1 | Column 2 | Column 3 |');
  });

  it('inserts at the cursor with safe surrounding whitespace', () => {
    const result = insertMarkdownTable('BeforeAfter', 6, 1, 2);
    expect(result.body).toContain('Before\n\n| Column 1 | Column 2 |');
    expect(result.body).toContain('\n\nAfter');
  });

  it('table modal inserts Markdown and switches the note to Markdown mode', async () => {
    await bootstrapTheme();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
    const noteId = useTabs.getState().activeNote!.id;

    await userEvent.click(screen.getByTestId('table-open'));
    fireEvent.change(screen.getByTestId('table-rows'), { target: { value: '2' } });
    fireEvent.change(screen.getByTestId('table-columns'), { target: { value: '4' } });
    await userEvent.click(screen.getByTestId('table-insert'));

    const textarea = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
    await waitFor(() =>
      expect(textarea.value).toContain('| Column 1 | Column 2 | Column 3 | Column 4 |'),
    );
    await waitFor(async () => expect((await getNoteById(noteId))?.mode).toBe('md'));
  });
});
