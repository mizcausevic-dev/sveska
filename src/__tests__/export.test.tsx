import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { astFromNote } from '@/markdown/ast';
import { download, exportAs, filenameFor, type ExportFormat } from '@/markdown/export';
import { type Note } from '@/notes/db';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'n1',
    title: '',
    body: '',
    mode: 'text',
    tags: [],
    directoryId: null,
    pinned: 0,
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    ...overrides,
  };
}

async function blobText(b: Blob): Promise<string> {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = (): void => resolve(typeof fr.result === 'string' ? fr.result : '');
    fr.readAsText(b);
  });
}

describe('M1.T1.3 — export module', () => {
  describe('exportAs', () => {
    it('txt: body verbatim, MIME text/plain', async () => {
      const ast = astFromNote(makeNote({ body: 'hello\nworld' }));
      const r = await exportAs(ast, 'txt');
      expect(r.mime).toMatch(/^text\/plain/);
      expect(await blobText(r.blob)).toBe('hello\nworld');
    });

    it('md: body verbatim, MIME text/markdown, .md extension', async () => {
      const ast = astFromNote(makeNote({ body: '# heading\n\n- item' }));
      const r = await exportAs(ast, 'md');
      expect(r.mime).toMatch(/^text\/markdown/);
      expect(r.filename).toMatch(/\.md$/);
      expect(await blobText(r.blob)).toBe('# heading\n\n- item');
    });

    it('html: wraps body in a CSP-safe document with title + escaped body', async () => {
      const ast = astFromNote(makeNote({ title: 'Weekend', body: '<script>alert(1)</script>' }));
      const r = await exportAs(ast, 'html');
      const text = await blobText(r.blob);
      expect(text).toContain('<!doctype html>');
      expect(text).toContain('<title>Weekend — Sveska</title>');
      // <script> in body must be escaped
      expect(text).not.toContain('<script>alert(1)</script>');
      expect(text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      // No external CDN refs
      expect(text).not.toMatch(/https?:\/\/(fonts|cdn|api)\./i);
    });

    it('normalizes CRLF → LF on all formats', async () => {
      const ast = astFromNote(makeNote({ body: 'a\r\nb\r\nc' }));
      for (const format of ['txt', 'md', 'html'] satisfies ExportFormat[]) {
        const r = await exportAs(ast, format);
        const text = await blobText(r.blob);
        expect(text).not.toContain('\r\n');
      }
    });
  });

  describe('filenameFor', () => {
    it('slugifies the title + appends date stamp + extension', () => {
      const ast = astFromNote(makeNote({ title: 'Weekend Planning · DRAFT' }));
      const name = filenameFor(ast, 'txt');
      expect(name).toMatch(/^weekend-planning-draft-\d{4}-\d{2}-\d{2}-\d{4}\.txt$/);
    });

    it('falls back to "sveska-note" when title is empty', () => {
      const name = filenameFor(astFromNote(makeNote({ title: '' })), 'md');
      expect(name).toMatch(/^sveska-note-\d{4}-\d{2}-\d{2}-\d{4}\.md$/);
    });

    it('strips diacritics: "Najbolji početak" → "najbolji-pocetak"', () => {
      const name = filenameFor(astFromNote(makeNote({ title: 'Najbolji početak' })), 'html');
      expect(name).toMatch(/^najbolji-pocetak-\d{4}-\d{2}-\d{2}-\d{4}\.html$/);
    });

    it('caps slug at 64 chars', () => {
      const long = 'x'.repeat(200);
      const name = filenameFor(astFromNote(makeNote({ title: long })), 'txt');
      const slug = name.split('-').slice(0, -4).join('-');
      expect(slug.length).toBeLessThanOrEqual(64);
    });
  });

  describe('download (DOM side-effects)', () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let revokeObjectURL: ReturnType<typeof vi.fn>;
    let clicked = 0;

    beforeEach(() => {
      clicked = 0;
      createObjectURL = vi.fn((b: Blob) => `blob:test/${b.size}`);
      revokeObjectURL = vi.fn();
      // jsdom: URL constructor exists, but createObjectURL doesn't. Patch the
      // two static methods directly — DON'T replace the URL global (router needs `new URL`).
      Object.assign(URL, { createObjectURL, revokeObjectURL });
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        clicked += 1;
      });
    });

    afterEach(() => {
      // Remove the patches.
      delete (URL as unknown as Record<string, unknown>).createObjectURL;
      delete (URL as unknown as Record<string, unknown>).revokeObjectURL;
      vi.restoreAllMocks();
    });

    it('creates an object URL, clicks an anchor, and revokes the URL', async () => {
      const ast = astFromNote(makeNote({ title: 'x', body: 'y' }));
      download(await exportAs(ast, 'txt'));
      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(clicked).toBe(1);
      // revoke is scheduled via setTimeout(0) — flush the macrotask.
      await new Promise((r) => setTimeout(r, 5));
      expect(revokeObjectURL).toHaveBeenCalledOnce();
    });
  });
});

describe('M1.T1.3 — export UI integration', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:test/integration');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    delete (URL as unknown as Record<string, unknown>).createObjectURL;
    delete (URL as unknown as Record<string, unknown>).revokeObjectURL;
    vi.restoreAllMocks();
  });

  async function renderApp(): Promise<void> {
    await bootstrapTheme();
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  }

  it('three export buttons are present + enabled once the editor hydrates', async () => {
    await renderApp();
    await waitFor(() => expect(screen.getByTestId('export-txt')).toBeEnabled());
    expect(screen.getByTestId('export-md')).toBeEnabled();
    expect(screen.getByTestId('export-html')).toBeEnabled();
  });

  it('clicking .txt creates an object URL (triggers a download)', async () => {
    await renderApp();
    const textarea = screen.getByTestId('editor-textarea');
    await userEvent.type(textarea, 'hello export');
    await userEvent.click(screen.getByTestId('export-txt'));
    expect(createObjectURL).toHaveBeenCalled();
  });
});
