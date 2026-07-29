import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import {
  attachmentRef,
  blobToDataUri,
  deleteAttachment,
  extractAttachmentIds,
  getAttachment,
  listAttachmentsForNote,
  putAttachment,
  resolveAttachmentDataUris,
} from '@/notes/attachmentRepo';
import { renderMd } from '@/markdown/render';
import { exportAs } from '@/markdown/export';
import { astFromNote } from '@/markdown/ast';
import { type Note } from '@/notes/db';

function pngBlob(bytes = 'fake-png-bytes'): Blob {
  return new Blob([bytes], { type: 'image/png' });
}

function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = (): void => resolve(typeof fr.result === 'string' ? fr.result : '');
    fr.readAsText(blob);
  });
}

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('v2 — image paste: attachmentRepo', () => {
  it('put → get round-trips the blob + metadata', async () => {
    const id = await putAttachment('note-1', pngBlob(), 'image/png', 'shot.png');
    const att = await getAttachment(id);
    expect(att).toBeDefined();
    expect(att!.noteId).toBe('note-1');
    expect(att!.mime).toBe('image/png');
    expect(att!.name).toBe('shot.png');
    // Note: we don't FileReader the round-tripped blob here — fake-indexeddb's
    // structured-clone returns a Blob jsdom's FileReader rejects (same quirk
    // documented in canvas.test.tsx). The blob field surviving is the contract;
    // real-browser data-URI reads are covered by the renderMd/export resolver
    // tests below + the browser-preview verification.
    expect(att!.blob).toBeDefined();
  });

  it('listAttachmentsForNote returns only that note, sorted by createdAt', async () => {
    await putAttachment('note-A', pngBlob('a1'), 'image/png', 'a1.png');
    await putAttachment('note-B', pngBlob('b1'), 'image/png', 'b1.png');
    await putAttachment('note-A', pngBlob('a2'), 'image/png', 'a2.png');
    const a = await listAttachmentsForNote('note-A');
    expect(a).toHaveLength(2);
    expect(a.map((x) => x.name)).toEqual(['a1.png', 'a2.png']);
  });

  it('deleteAttachment removes it', async () => {
    const id = await putAttachment('note-1', pngBlob(), 'image/png', 'x.png');
    await deleteAttachment(id);
    expect(await getAttachment(id)).toBeUndefined();
  });

  it('extractAttachmentIds pulls deduped ids in order', () => {
    const body = `intro
![one](sveska-img:aaa-111)
middle ![two](sveska-img:bbb-222) and again ![dup](sveska-img:aaa-111)`;
    expect(extractAttachmentIds(body)).toEqual(['aaa-111', 'bbb-222']);
  });

  it('blobToDataUri produces a data:image/png URI (fresh blob)', async () => {
    const uri = await blobToDataUri(pngBlob());
    expect(uri.startsWith('data:image/png')).toBe(true);
    expect(uri).toContain('base64,');
  });

  it('resolveAttachmentDataUris returns a Map and never throws on missing ids', async () => {
    const id = await putAttachment('note-1', pngBlob(), 'image/png', 'x.png');
    // Round-tripped blob can't be FileReader'd in jsdom (see note above), so we
    // assert the shape contract: a Map back, missing ids absent, no throw. The
    // real data-URI resolution is exercised in the browser-preview check.
    const map = await resolveAttachmentDataUris([id, 'does-not-exist']);
    expect(map).toBeInstanceOf(Map);
    expect(map.has('does-not-exist')).toBe(false);
  });

  it('attachmentRef builds the sveska-img: reference', () => {
    expect(attachmentRef('abc')).toBe('sveska-img:abc');
  });
});

describe('v2 — image paste: renderMd resolution', () => {
  it('replaces sveska-img refs with the resolved data URI in <img src>', () => {
    const html = renderMd('![shot](sveska-img:xyz)', (id) =>
      id === 'xyz' ? 'data:image/png;base64,AAAA' : undefined,
    );
    expect(html).toContain('<img');
    expect(html).toContain('src="data:image/png;base64,AAAA"');
    expect(html).not.toContain('sveska-img:');
  });

  it('leaves unresolved refs as-is (no crash, no broken img src)', () => {
    const html = renderMd('![shot](sveska-img:missing)', () => undefined);
    // markdown-it still emits an <img>, but DOMPurify strips the unknown
    // sveska-img: scheme from src — the key point is it does not throw and
    // does not leak a usable bad URL.
    expect(html).not.toContain('src="data:');
  });

  it('data: image survives DOMPurify (blob: would be stripped — why we use data:)', () => {
    const html = renderMd('![x](sveska-img:id1)', () => 'data:image/png;base64,ZZZ');
    expect(html).toContain('src="data:image/png;base64,ZZZ"');
  });
});

describe('v2 — image paste: HTML export embedding', () => {
  it('embeds the data URI in md-mode HTML export when a resolver is given', async () => {
    const note: Note = {
      id: 'n1',
      title: 'With image',
      body: 'before\n\n![shot](sveska-img:emb1)\n\nafter',
      mode: 'md',
      tags: [],
      directoryId: null,
      pinned: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };
    const ast = astFromNote(note);
    const result = await exportAs(ast, 'html', (id) =>
      id === 'emb1' ? 'data:image/png;base64,EMBED' : undefined,
    );
    return readBlobText(result.blob).then((html) => {
      expect(html).toContain('src="data:image/png;base64,EMBED"');
      expect(html).not.toContain('sveska-img:');
    });
  });

  it('md export keeps the raw sveska-img ref (round-trippable)', async () => {
    const note: Note = {
      id: 'n2',
      title: 'Raw',
      body: '![shot](sveska-img:raw1)',
      mode: 'md',
      tags: [],
      directoryId: null,
      pinned: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };
    const result = await exportAs(astFromNote(note), 'md');
    return readBlobText(result.blob).then((md) => {
      expect(md).toContain('sveska-img:raw1');
    });
  });
});

describe('v2 — image paste: editor integration', () => {
  it('pasting an image stores an attachment, inserts a ref, and flips to md mode', async () => {
    await renderApp();
    const noteId = useTabs.getState().activeNote!.id;
    const textarea = screen.getByTestId('editor-textarea');

    const file = new File(['png-bytes'], 'screenshot.png', { type: 'image/png' });
    fireEvent.paste(textarea, {
      clipboardData: {
        items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }],
      },
    });

    // Attachment persisted for this note.
    await waitFor(
      async () => {
        const atts = await listAttachmentsForNote(noteId);
        expect(atts.length).toBe(1);
      },
      { timeout: 5000 },
    );

    // Body gained a sveska-img ref.
    await waitFor(
      () => {
        const ta = screen.getByTestId<HTMLTextAreaElement>('editor-textarea');
        expect(ta.value).toContain('sveska-img:');
        expect(ta.value).toContain('![screenshot]');
      },
      { timeout: 5000 },
    );

    // Note flipped from text → md so the image renders.
    await waitFor(
      () => {
        expect(useTabs.getState().activeNote!.mode).toBe('md');
      },
      { timeout: 5000 },
    );
  });

  it('pasting plain text does NOT create an attachment (lets normal paste through)', async () => {
    await renderApp();
    const noteId = useTabs.getState().activeNote!.id;
    const textarea = screen.getByTestId('editor-textarea');

    fireEvent.paste(textarea, {
      clipboardData: {
        items: [{ kind: 'string', type: 'text/plain', getAsFile: () => null }],
      },
    });

    // Give any async handler a tick; assert no attachment was created.
    await new Promise((r) => setTimeout(r, 50));
    const atts = await listAttachmentsForNote(noteId);
    expect(atts.length).toBe(0);
  });
});
