import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { createNote, getNoteById, setNoteMode } from '@/notes/noteRepo';
import { renderMd } from '@/markdown/render';
import { astFromNote } from '@/markdown/ast';
import { exportAs } from '@/markdown/export';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

/** Force the bootstrapped note into md mode and sync the store. */
async function makeActiveNoteMarkdown(): Promise<void> {
  const id = useTabs.getState().activeNote!.id;
  await setNoteMode(id, 'md');
  await useTabs.getState().refreshActiveNote();
}

/** Read a Blob as text — jsdom's Blob lacks `.text()` and `.arrayBuffer()`. */
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = (): void => resolve(typeof fr.result === 'string' ? fr.result : '');
    fr.readAsText(blob);
  });
}

describe('M3.T3.2 — renderMd (pure)', () => {
  it('empty input → empty string', () => {
    expect(renderMd('')).toBe('');
    expect(renderMd('   ')).toBe('');
  });

  it('headings + paragraphs render expected tags', () => {
    const html = renderMd('# Title\n\nHello **world**.');
    expect(html).toContain('<h1>');
    expect(html).toContain('<strong>world</strong>');
  });

  it('strips raw <script> tags (XSS gate)', () => {
    const html = renderMd('safe text\n\n<script>alert(1)</script>\n\nmore');
    // markdown-it's html:false escapes the literal so the browser never
    // executes it. The literal "alert(1)" survives as text — that's harmless.
    expect(html).not.toContain('<script>');
    expect(html).not.toMatch(/<\/script>/i);
  });

  it('strips inline event handlers (XSS gate)', () => {
    const html = renderMd('[click](javascript:alert(1))');
    // DOMPurify must reject the javascript: protocol on anchor hrefs.
    expect(html).not.toMatch(/href="javascript:/i);
  });

  it('autolinks bare URLs', () => {
    const html = renderMd('Visit https://example.com today');
    expect(html).toContain('href="https://example.com"');
  });

  it('renders fenced code blocks', () => {
    const html = renderMd('```\nconst x = 1;\n```');
    expect(html).toContain('<pre>');
    expect(html).toContain('<code>const x = 1;');
  });
});

describe('M3.T3.2 — setNoteMode persistence', () => {
  it('writes the mode and touches updatedAt', async () => {
    const n = await createNote();
    const t0 = n.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    await setNoteMode(n.id, 'md');
    const fresh = await getNoteById(n.id);
    expect(fresh?.mode).toBe('md');
    expect((fresh?.updatedAt ?? 0) > t0).toBe(true);
  });
});

describe('M3.T3.2 — export uses Markdown renderer for md notes', () => {
  it('text-mode .html export wraps body in <pre> with escaped text', async () => {
    const note = await createNote({ body: '<b>hi</b>', mode: 'text' });
    const fresh = await getNoteById(note.id);
    const result = await exportAs(astFromNote(fresh!), 'html');
    const html = await readBlob(result.blob);
    expect(html).toContain('<pre class="note">');
    expect(html).toContain('&lt;b&gt;hi&lt;/b&gt;');
  });

  it('md-mode .html export renders Markdown into .prose', async () => {
    const note = await createNote({ body: '# Heading\n\n**bold** ok', mode: 'md' });
    const fresh = await getNoteById(note.id);
    const result = await exportAs(astFromNote(fresh!), 'html');
    const html = await readBlob(result.blob);
    expect(html).toContain('<div class="prose">');
    expect(html).toContain('<h1>Heading</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });
});

describe('M3.T3.2 — UI: mode toggle + live preview', () => {
  it('mode toggle flips TXT ↔ MD; preview pane appears for MD', async () => {
    await renderApp();
    expect(screen.queryByTestId('md-preview')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('mode-toggle'));
    await waitFor(() => expect(screen.getByTestId('md-preview')).toBeInTheDocument());
    expect(screen.getByTestId('mode-toggle')).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByTestId('mode-toggle'));
    await waitFor(() => expect(screen.queryByTestId('md-preview')).not.toBeInTheDocument());
  });

  it('typing in the textarea updates the preview pane', async () => {
    await renderApp();
    await makeActiveNoteMarkdown();
    await waitFor(() => expect(screen.getByTestId('md-preview')).toBeInTheDocument());

    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, '# Live{Enter}{Enter}body text');

    await waitFor(() => {
      const preview = screen.getByTestId('md-preview');
      expect(preview.querySelector('h1')?.textContent).toContain('Live');
      expect(preview.textContent).toContain('body text');
    });
  });

  it('preview-toggle hides + re-shows the preview pane', async () => {
    await renderApp();
    await makeActiveNoteMarkdown();
    await waitFor(() => expect(screen.getByTestId('md-preview')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('preview-toggle'));
    await waitFor(() => expect(screen.queryByTestId('md-preview')).not.toBeInTheDocument());

    await userEvent.click(screen.getByTestId('preview-toggle'));
    await waitFor(() => expect(screen.getByTestId('md-preview')).toBeInTheDocument());
  });

  it('Preview view hides the editor and uses the full preview surface', async () => {
    await renderApp();
    await makeActiveNoteMarkdown();
    await userEvent.click(screen.getByTestId('markdown-view-preview'));
    await waitFor(() => expect(screen.getByTestId('md-preview')).toBeInTheDocument());
    expect(screen.queryByTestId('editor-textarea')).not.toBeInTheDocument();
    expect(screen.getByTestId('md-preview').parentElement).toHaveClass(
      'editor-input-wrap--preview',
    );
  });
});
