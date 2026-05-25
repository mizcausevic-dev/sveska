import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { Annotation } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { buildCommandCatalog } from '@/ui/commandCatalog';
import { fuzzySearch } from '@/lib/fuzzy';
import { getSlashContext } from './slashContext';
import { findTriggerAt } from '@/notes/snippetsRepo';
import { useEditorPrefs } from '@/notes/editorPrefs';

/**
 * CodeMirror 6 ports of the M3 power features (big lift, increment 2):
 * slash commands, snippet expansion, typewriter scroll, typing sounds.
 * Find/replace comes from @codemirror/search (wired in RichEditor).
 *
 * These read live prefs from the zustand store at event time (rather than
 * via props/compartments) so toggling typewriter/sounds takes effect without
 * recreating the view.
 */

// ── Slash commands ──────────────────────────────────────────────────────
// Reuses getSlashContext (line-starts-with-/) + the palette catalog + the
// fuzzy scorer, surfaced through CM's autocomplete tooltip. Accepting an
// option strips the `/query` and runs the command (no text inserted).

function slashSource(context: CompletionContext): CompletionResult | null {
  const ctx = getSlashContext(context.state.doc.toString(), context.pos);
  if (!ctx) return null;
  const catalog = buildCommandCatalog();
  const indexed = catalog.map((c) => ({
    id: c.id,
    title: c.label,
    body: c.keywords ?? '',
    cmd: c,
  }));
  const matches = ctx.query
    ? fuzzySearch(indexed, ctx.query, 8).map((h) => h.item.cmd)
    : catalog.slice(0, 8);
  if (matches.length === 0) return null;

  const options: Completion[] = matches.map((cmd) => ({
    label: cmd.label,
    detail: cmd.group,
    type: 'keyword',
    apply: (view: EditorView) => {
      // Recompute the slash range in case more was typed before acceptance.
      const cur = getSlashContext(view.state.doc.toString(), view.state.selection.main.head) ?? ctx;
      view.dispatch({
        changes: { from: cur.start, to: cur.end, insert: '' },
        selection: { anchor: cur.start },
      });
      queueMicrotask(() => cmd.run());
    },
  }));

  return { from: ctx.start, to: ctx.end, options, filter: false };
}

export const slashCommands = autocompletion({
  override: [slashSource],
  icons: false,
  defaultKeymap: true,
});

// ── Snippet expansion ───────────────────────────────────────────────────
// When the text before the caret ends with a saved trigger, replace it with
// the snippet body. Reuses findTriggerAt. Guards against re-processing its
// own expansion via an annotation, and only fires on user input.

const snippetExpansion = Annotation.define<boolean>();

export const snippetExpand = EditorView.updateListener.of((u) => {
  if (!u.docChanged) return;
  if (u.transactions.some((t) => t.annotation(snippetExpansion))) return;
  const userTyped = u.transactions.some(
    (t) => t.isUserEvent('input') || t.isUserEvent('input.type'),
  );
  if (!userTyped) return;

  const { view } = u;
  const head = u.state.selection.main.head;
  const line = u.state.doc.lineAt(head);
  const prefix = u.state.doc.sliceString(line.from, head);

  void findTriggerAt(prefix).then((snippet) => {
    if (!snippet) return;
    // Re-validate against the live state (caret may have moved).
    const h = view.state.selection.main.head;
    const ln = view.state.doc.lineAt(h);
    const pre = view.state.doc.sliceString(ln.from, h);
    if (!pre.endsWith(snippet.trigger)) return;
    const from = h - snippet.trigger.length;
    view.dispatch({
      changes: { from, to: h, insert: snippet.body },
      selection: { anchor: from + snippet.body.length },
      annotations: snippetExpansion.of(true),
      userEvent: 'input.complete',
    });
  });
});

// ── Typewriter scroll ───────────────────────────────────────────────────
// Keep the caret line vertically centered when the typewriter pref is on.
// Deferred to rAF so we don't dispatch synchronously inside the update cycle.

export const typewriterScroll = EditorView.updateListener.of((u) => {
  if (!u.docChanged && !u.selectionSet) return;
  if (!useEditorPrefs.getState().typewriter) return;
  const { view } = u;
  requestAnimationFrame(() => {
    const head = view.state.selection.main.head;
    view.dispatch({ effects: EditorView.scrollIntoView(head, { y: 'center' }) });
  });
});

// ── Typing sounds ───────────────────────────────────────────────────────
// Short WebAudio click per keystroke (reuses the synth design from the
// textarea's useTypingSounds). Reads sounds + volume from prefs live.

let audioCtx: AudioContext | null = null;
let lastPlayedAt = 0;

function playClick(key: string, volume: number): void {
  const now = performance.now();
  if (now - lastPlayedAt < 25) return;
  const freq = key === 'Enter' ? 520 : key === ' ' ? 360 : 440;
  if (key.length !== 1 && key !== 'Enter' && key !== ' ' && key !== 'Backspace') return;
  lastPlayedAt = now;
  try {
    if (!audioCtx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = ctx.currentTime;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * 0.18, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.06);
  } catch {
    // best-effort; never break typing
  }
}

export const typingSounds = EditorView.domEventHandlers({
  keydown(e) {
    const prefs = useEditorPrefs.getState();
    if (!prefs.sounds) return false;
    playClick(e.key, prefs.soundVolume);
    return false;
  },
});
