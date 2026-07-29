import { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { search, searchKeymap } from '@codemirror/search';
import { closeBrackets } from '@codemirror/autocomplete';
import { inlineImagePlugin } from './richImageWidget';
import { slashCommands, snippetExpand, typewriterScroll, typingSounds } from './cmExtensions';
import { attachmentRef, putAttachment } from '@/notes/attachmentRepo';
import { type EditorPrefs, FONT_FAMILY_CSS } from '@/notes/editorPrefs';

/**
 * CodeMirror 6 rich editor (the "big lift") — the `richEditor` pref, now
 * DEFAULT ON. Lazy-loaded so the CM chunk dynamic-imports after first paint
 * and the initial bundle budget holds.
 *
 * Headline: pasted screenshots render INLINE in the editing surface (not as
 * raw `![](sveska-img:…)` text) via a live-preview widget. Plus markdown
 * syntax highlighting, undo, soft-wrap, and the full M3 power-feature set
 * ported in increment 2 (see ./cmExtensions): slash commands, snippet
 * expansion, find/replace (@codemirror/search), typewriter scroll, typing
 * sounds. The classic <textarea> editor remains the opt-out.
 */

interface Props {
  noteId: string;
  body: string;
  selectionStart: number;
  prefs: EditorPrefs;
  placeholder: string;
  onChange: (value: string, selectionStart: number) => void;
}

function buildTheme(prefs: EditorPrefs): ReturnType<typeof EditorView.theme> {
  return EditorView.theme(
    {
      '&': {
        backgroundColor: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-md)',
        height: '100%',
        fontSize: `${prefs.fontSize}px`,
      },
      '.cm-content': {
        fontFamily: FONT_FAMILY_CSS[prefs.fontFamily],
        lineHeight: String(prefs.lineHeight),
        padding: '22px 24px',
        caretColor: 'var(--accent)',
      },
      '.cm-scroller': { fontFamily: FONT_FAMILY_CSS[prefs.fontFamily], overflow: 'auto' },
      '&.cm-focused': { outline: '2px solid var(--accent)', outlineOffset: '-2px' },
      '.cm-cursor': { borderLeftColor: 'var(--accent)' },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        backgroundColor: 'color-mix(in oklab, var(--accent) 22%, transparent)',
      },
      '.cm-placeholder': { color: 'var(--text-dim)' },
      '.cm-inline-img-wrap': { display: 'block', margin: '8px 0' },
      '.cm-inline-img': {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-soft)',
      },
    },
    { dark: true },
  );
}

export function RichEditor({
  noteId,
  body,
  selectionStart,
  prefs,
  placeholder,
  onChange,
}: Props): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeComp = useRef(new Compartment());
  // Latest callbacks/ids without re-creating the view.
  const onChangeRef = useRef(onChange);
  const noteIdRef = useRef(noteId);
  onChangeRef.current = onChange;
  noteIdRef.current = noteId;

  // Create the view once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const updateListener = EditorView.updateListener.of((u) => {
      if (u.docChanged) {
        const value = u.state.doc.toString();
        const sel = u.state.selection.main.head;
        onChangeRef.current(value, sel);
      }
    });

    async function handleImageFile(view: EditorView, file: File): Promise<void> {
      const mime = file.type || 'image/png';
      const name = file.name || `screenshot-${Date.now()}.png`;
      const id = await putAttachment(noteIdRef.current, file, mime, name);
      const sel = view.state.selection.main;
      const before = view.state.doc.sliceString(0, sel.from);
      const lead = before && !before.endsWith('\n') ? '\n' : '';
      const insert = `${lead}![screenshot](${attachmentRef(id)})\n`;
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert },
        selection: { anchor: sel.from + insert.length },
      });
    }

    const pasteDrop = EditorView.domEventHandlers({
      paste(event, view) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const fileItem = Array.from(items).find(
          (it) => it.kind === 'file' && it.type.startsWith('image/'),
        );
        const file = fileItem?.getAsFile();
        if (!file) return false;
        event.preventDefault();
        void handleImageFile(view, file);
        return true;
      },
      drop(event, view) {
        const files = event.dataTransfer?.files;
        const image = files && Array.from(files).find((f) => f.type.startsWith('image/'));
        if (!image) return false;
        event.preventDefault();
        void handleImageFile(view, image);
        return true;
      },
    });

    const state = EditorState.create({
      doc: body,
      extensions: [
        history(),
        // searchKeymap (Ctrl/⌘+F) before defaultKeymap so find/replace wins.
        keymap.of([...searchKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
        markdown(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        EditorView.lineWrapping,
        cmPlaceholder(placeholder),
        closeBrackets(),
        search({ top: true }),
        // M3 power features ported to CM (increment 2):
        slashCommands, // / at line start → command palette
        snippetExpand, // ;trigger → snippet body
        typewriterScroll, // center caret line when the pref is on
        typingSounds, // WebAudio click when the pref is on
        inlineImagePlugin,
        updateListener,
        pasteDrop,
        themeComp.current.of(buildTheme(prefs)),
        EditorState.allowMultipleSelections.of(false),
        // spellcheck via the contenteditable attribute on the content node
        EditorView.contentAttributes.of({ spellcheck: prefs.spellcheck ? 'true' : 'false' }),
      ],
    });

    const view = new EditorView({ state, parent: host });
    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Intentionally create-once; body/prefs sync happens in the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External body changes (tab switch, restore, AI apply) → replace the doc,
  // but only when it genuinely differs from what's already shown (avoids
  // stomping the caret on our own edits).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === body) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: body },
      selection: { anchor: Math.max(0, Math.min(body.length, selectionStart)) },
    });
  }, [body, selectionStart]);

  // Prefs change → reconfigure the theme compartment (no view recreation).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: themeComp.current.reconfigure(buildTheme(prefs)) });
  }, [prefs]);

  return (
    <div
      ref={hostRef}
      className={`rich-editor rich-editor--paper-${prefs.paper}`}
      data-testid="rich-editor"
    />
  );
}
