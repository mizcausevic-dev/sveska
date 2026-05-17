import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { importFiles } from '@/lib/importFiles';
import { packShareHash, parseShareHash } from '@/lib/hashShare';
import { listInbox } from '@/notes/inboxRepo';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

function fakeFile(name: string, content: string): File {
  return new File([content], name, { type: 'text/plain' });
}

describe('M3.T3.7 — importFiles (pure)', () => {
  it('creates a note per .txt / .md file + skips unknown extensions', async () => {
    const files: File[] = [
      fakeFile('a.txt', 'plain content'),
      fakeFile('b.md', '# Markdown'),
      fakeFile('photo.jpg', '<binary>'),
    ];
    const { notes, skipped } = await importFiles(files);
    expect(notes.length).toBe(2);
    expect(skipped).toEqual(['photo.jpg']);
    expect(notes[0]?.mode).toBe('text');
    expect(notes[1]?.mode).toBe('md');
    expect(notes[1]?.body).toBe('# Markdown');
  });

  it('strips the extension from the title', async () => {
    const { notes } = await importFiles([fakeFile('meeting-2026-05-17.md', '# note')]);
    expect(notes[0]?.title).toBe('meeting-2026-05-17');
  });
});

describe('M3.T3.7 — hash share (pure)', () => {
  it('packShareHash round-trips through parseShareHash', () => {
    const note = { title: 'Hello', body: '# world\n\nbody text', mode: 'md' as const };
    const hash = packShareHash(note);
    expect(hash.startsWith('#note=')).toBe(true);
    expect(parseShareHash(hash)).toEqual(note);
  });

  it('parseShareHash rejects non-share fragments', () => {
    expect(parseShareHash('')).toBeNull();
    expect(parseShareHash('#section')).toBeNull();
    expect(parseShareHash('#note=xxxnotbase64xxx!')).toBeNull();
  });

  it('handles unicode bodies (Bosnian diacritics)', () => {
    const note = { title: 'Sveska', body: 'Najbolji početak — žđšćč.', mode: 'text' as const };
    expect(parseShareHash(packShareHash(note))?.body).toBe(note.body);
  });
});

describe('M3.T3.7 — rail import UI', () => {
  it('Import file input creates a note + opens it as the active tab', async () => {
    await renderApp();
    const input = screen.getByTestId<HTMLInputElement>('rail-import-input');
    const file = fakeFile('imported.md', '# imported body');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(useTabs.getState().activeNote?.title).toBe('imported'));
    expect(useTabs.getState().activeNote?.mode).toBe('md');
  });
});

describe('M3.T3.7 — Share Target inbox capture', () => {
  it('navigating to /share-target?text=… drops the text into the inbox', async () => {
    // Navigate before rendering so the route mounts with the params.
    window.history.replaceState(
      {},
      '',
      '/share-target?text=hello%20from%20share&url=https://example.com',
    );
    await bootstrapTheme();
    render(<App />);
    await waitFor(async () => {
      const items = await listInbox();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]?.text).toContain('hello from share');
    });
    // Restore for downstream tests.
    window.history.replaceState({}, '', '/');
  });
});

describe('M3.T3.7 — Copy share link command', () => {
  it('clicking the palette command writes a #note=... URL to the clipboard', async () => {
    // Stub navigator.clipboard since jsdom doesn't provide it.
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (s: string) => {
          copied = s;
          return Promise.resolve();
        },
      },
    });

    await renderApp();
    // Seed body so the link has substance.
    const textarea = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
    await userEvent.click(textarea);
    await userEvent.type(textarea, 'share me');

    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'share link');
    await waitFor(() =>
      expect(screen.getByTestId('palette-row-note.copy.share.link')).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTestId('palette-row-note.copy.share.link'));
    await waitFor(() => expect(copied).toContain('#note='));
    expect(parseShareHash('#' + copied.split('#')[1])).not.toBeNull();
  });
});
