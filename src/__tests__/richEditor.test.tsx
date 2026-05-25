import { describe, expect, it } from 'vitest';
import { findImageRefs } from '@/editor/richImageWidget';
import { DEFAULT_EDITOR_PREFS, useEditorPrefs } from '@/notes/editorPrefs';

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
