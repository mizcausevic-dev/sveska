/**
 * Canvas seam (CLAUDE.md §3). The only implementation is Excalidraw (MIT), vendored
 * and lazy-loaded at M5. App code imports the seam — never a vendor directly.
 * tldraw is permanently out (parking lot §9 row 1).
 */

export type CanvasFormat = 'png' | 'svg' | 'json';

export interface CanvasProvider {
  readonly id: string;
  mount(el: HTMLElement): Promise<void>;
  load(doc: Blob | string): Promise<void>;
  export(format: CanvasFormat): Promise<Blob>;
  onChange(cb: (doc: Blob) => void): () => void;
  destroy(): void;
}
