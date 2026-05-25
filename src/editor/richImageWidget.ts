import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import { Annotation, RangeSetBuilder } from '@codemirror/state';
import { resolveAttachmentDataUris } from '@/notes/attachmentRepo';

/**
 * Inline image rendering for the CodeMirror rich editor (the "big lift").
 *
 * A `![alt](sveska-img:<id>)` reference is collapsed into an actual <img>
 * widget showing the resolved data: URI — Obsidian "live preview" style.
 * The collapse is suppressed while the cursor/selection overlaps the ref so
 * you can still edit or delete it. Data URIs are resolved async from Dexie
 * and cached module-level; when a new one arrives we dispatch a no-op
 * annotation transaction to force a decoration rebuild.
 */

const IMG_RE = /!\[[^\]]*\]\(sveska-img:([A-Za-z0-9-]+)\)/g;

/** Module-level cache: attachment id → data: URI. */
const dataUriCache = new Map<string, string>();

/** Annotation marking the "images just resolved, rebuild decorations" tx. */
const imagesLoaded = Annotation.define<boolean>();

export interface ImageRef {
  from: number;
  to: number;
  id: string;
}

/**
 * Pure: locate every `sveska-img` image reference in the text with its
 * character range + id. Exported for unit testing the matcher independently
 * of CodeMirror.
 */
export function findImageRefs(text: string): ImageRef[] {
  const out: ImageRef[] = [];
  IMG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = IMG_RE.exec(text)) !== null) {
    const id = m[1];
    if (id) out.push({ from: m.index, to: m.index + m[0].length, id });
  }
  return out;
}

class ImageWidget extends WidgetType {
  constructor(
    readonly src: string,
    readonly id: string,
  ) {
    super();
  }
  override eq(other: ImageWidget): boolean {
    return other.src === this.src && other.id === this.id;
  }
  override toDOM(): HTMLElement {
    const wrap = document.createElement('span');
    wrap.className = 'cm-inline-img-wrap';
    const img = document.createElement('img');
    img.src = this.src;
    img.className = 'cm-inline-img';
    img.alt = 'pasted image';
    wrap.appendChild(img);
    return wrap;
  }
  override ignoreEvent(): boolean {
    return false;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const text = view.state.doc.toString();
  const sel = view.state.selection.main;
  for (const ref of findImageRefs(text)) {
    const src = dataUriCache.get(ref.id);
    if (!src) continue; // not resolved yet — leave as editable text
    const cursorOverlaps = sel.from <= ref.to && sel.to >= ref.from;
    if (cursorOverlaps) continue; // keep raw ref visible while editing it
    builder.add(ref.from, ref.to, Decoration.replace({ widget: new ImageWidget(src, ref.id) }));
  }
  return builder.finish();
}

export const inlineImagePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
      void this.ensureLoaded(view);
    }
    update(u: ViewUpdate): void {
      const annotated = u.transactions.some((t) => t.annotation(imagesLoaded));
      if (u.docChanged || u.selectionSet || u.viewportChanged || annotated) {
        this.decorations = buildDecorations(u.view);
        void this.ensureLoaded(u.view);
      }
    }
    async ensureLoaded(view: EditorView): Promise<void> {
      const ids = [...new Set(findImageRefs(view.state.doc.toString()).map((r) => r.id))].filter(
        (id) => !dataUriCache.has(id),
      );
      if (ids.length === 0) return;
      const map = await resolveAttachmentDataUris(ids);
      let added = false;
      for (const [k, v] of map) {
        if (!dataUriCache.has(k)) {
          dataUriCache.set(k, v);
          added = true;
        }
      }
      // Force a rebuild now that new URIs are cached. The annotation-only
      // transaction terminates the loop: next ensureLoaded finds all ids
      // cached and returns early.
      if (added) view.dispatch({ annotations: imagesLoaded.of(true) });
    }
  },
  { decorations: (v) => v.decorations },
);
