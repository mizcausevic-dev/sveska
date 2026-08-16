import { describe, expect, it, vi } from 'vitest';
import { EditorState } from '@codemirror/state';
import { type EditorView } from '@codemirror/view';
import { findImageRefs } from '@/editor/richImageWidget';
import { tryLinkPastedUrl } from '@/editor/cmExtensions';
import { DEFAULT_EDITOR_PREFS, useEditorPrefs } from '@/notes/editorPrefs';

/**
 * `tryLinkPastedUrl` only touches `view.state` (read) and `view.dispatch`
 * (call) — never the DOM — so a real `EditorView` (which needs a `parent`
 * element) isn't needed. This minimal stand-in satisfies the function's
 * actual usage without pulling jsdom into the loop. Returns `dispatch`
 * separately (not accessed as `view.dispatch` in assertions) so eslint's
 * `unbound-method` check doesn't flag pulling a "method" off a
 * class-typed object — it's a plain `vi.fn()`, not a bound instance method.
 */
function fakeView(
  doc: string,
  anchor: number,
  head: number = anchor,
): { view: EditorView; dispatch: ReturnType<typeof vi.fn> } {
  const state = EditorState.create({ doc, selection: { anchor, head } });
  const dispatch = vi.fn();
  return { view: { state, dispatch } as unknown as EditorView, dispatch };
}

function pasteEvent(text: string): ClipboardEvent {
  return {
    clipboardData: { getData: (type: string) => (type === 'text/plain' ? text : '') },
    preventDefault: vi.fn(),
  } as unknown as ClipboardEvent;
}

describe('big lift — findImageRefs (inline image matcher)', () => {
  it('finds a single ref with correct range + id', () => {
    const text = '![screenshot](sveska-img:abc123def456)';
    const refs = findImageRefs(text);
    expect(refs).toHaveLength(1);
    expect(refs[0]!.id).toBe('abc123def456');
    expect(refs[0]!.from).toBe(0);
    expect(refs[0]!.to).toBe(text.length);
  });

  it('finds multiple refs interleaved with prose, in order', () => {
    const text = 'intro\n![a](sveska-img:111aaa)\nmiddle ![b](sveska-img:222bbb) end';
    const refs = findImageRefs(text);
    expect(refs.map((r) => r.id)).toEqual(['111aaa', '222bbb']);
    // Ranges point at the actual ref substrings.
    expect(text.slice(refs[0]!.from, refs[0]!.to)).toBe('![a](sveska-img:111aaa)');
    expect(text.slice(refs[1]!.from, refs[1]!.to)).toBe('![b](sveska-img:222bbb)');
  });

  it('ignores ordinary markdown images + plain links', () => {
    const text = '![ext](https://example.com/x.png) and [link](sveska.studio)';
    expect(findImageRefs(text)).toHaveLength(0);
  });

  it('returns empty for empty text', () => {
    expect(findImageRefs('')).toEqual([]);
  });

  it('handles an empty alt text', () => {
    const refs = findImageRefs('![](sveska-img:deadbeef0000)');
    expect(refs).toHaveLength(1);
    expect(refs[0]!.id).toBe('deadbeef0000');
  });
});

describe('tryLinkPastedUrl — paste-a-URL-over-a-selection auto-link', () => {
  it('wraps the selected text as a markdown link to the pasted URL', () => {
    const { view, dispatch } = fakeView('see docs here please', 4, 8); // selects "docs"
    const handled = tryLinkPastedUrl(pasteEvent('https://example.com/guide'), view);
    expect(handled).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({
      changes: { from: 4, to: 8, insert: '[docs](https://example.com/guide)' },
      selection: { anchor: 4 + '[docs](https://example.com/guide)'.length },
    });
  });

  it('does nothing when there is no selection (collapsed cursor)', () => {
    const { view, dispatch } = fakeView('hello world', 5);
    const handled = tryLinkPastedUrl(pasteEvent('https://example.com'), view);
    expect(handled).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('leaves non-URL paste text alone', () => {
    const { view, dispatch } = fakeView('select this', 0, 6);
    const handled = tryLinkPastedUrl(pasteEvent('just some regular text'), view);
    expect(handled).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('tolerates surrounding whitespace on the pasted URL', () => {
    const { view, dispatch } = fakeView('select this', 0, 6);
    const handled = tryLinkPastedUrl(pasteEvent('  https://example.com/x  \n'), view);
    expect(handled).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: { from: 0, to: 6, insert: '[select](https://example.com/x)' },
      }),
    );
  });

  it('requires an http(s) scheme — bare domains are not auto-linked', () => {
    const { view, dispatch } = fakeView('select this', 0, 6);
    const handled = tryLinkPastedUrl(pasteEvent('example.com'), view);
    expect(handled).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe('big lift — richEditor pref flag', () => {
  it('production default is ON as of increment 2 (feature parity reached)', () => {
    // Assert the constant, not the live store — the test harness forces the
    // store to false so App-integration tests target the classic textarea.
    expect(DEFAULT_EDITOR_PREFS.richEditor).toBe(true);
  });

  it('setRichEditor flips the store value (classic textarea opt-out)', async () => {
    await useEditorPrefs.getState().setRichEditor(false);
    expect(useEditorPrefs.getState().richEditor).toBe(false);
    await useEditorPrefs.getState().setRichEditor(true);
    expect(useEditorPrefs.getState().richEditor).toBe(true);
  });
});
