import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { readCanvas, writeCanvas } from './canvasRepo';
import { debounce } from '@/lib/debounce';

/**
 * Excalidraw canvas adapter (M5.T5.1) — lazy-loaded behind the
 * CanvasProvider seam. The vendor package is ~600 KB gzip on its own;
 * dynamic import keeps it out of the initial bundle (mirrors the jsPDF
 * pattern from T3.7).
 *
 * Lifecycle:
 *   - On mount with `noteId`, read the canvas blob from Dexie + hydrate.
 *   - `onChange` (debounced 400ms) serializes the scene back to a Blob
 *     and writes it to the `canvas` table keyed by noteId.
 *   - Export-to-PNG flows through the `excalidrawApi` ref so we don't
 *     need to instantiate a separate vendor instance.
 *
 * The vendor's React component is wrapped in a Suspense fallback that
 * shows a "Loading canvas…" tile while the chunk arrives.
 */

const PROVIDER_ID = 'excalidraw';

// Lazy-loaded vendor module. Resolves to the Excalidraw default export
// re-shaped as a React component.
const LazyExcalidraw = lazy(async () => {
  const mod = await import('@excalidraw/excalidraw');
  return { default: mod.Excalidraw };
});

interface Props {
  noteId: string;
}

interface ExcalidrawApi {
  getSceneElements?: () => unknown[];
  getAppState?: () => unknown;
  getFiles?: () => unknown;
  exportToBlob?: (opts: {
    mimeType?: string;
    quality?: number;
    appState?: unknown;
    elements?: unknown[];
    files?: unknown;
  }) => Promise<Blob>;
}

export function ExcalidrawCanvas({ noteId }: Props): React.JSX.Element {
  const [initialData, setInitialData] = useState<unknown>(null);
  const [ready, setReady] = useState(false);
  const apiRef = useRef<ExcalidrawApi | null>(null);

  // Hydrate from Dexie on mount / note change.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void (async () => {
      const row = await readCanvas(noteId);
      if (cancelled) return;
      if (!row) {
        setInitialData(null);
      } else {
        try {
          const text = await blobToText(row.doc);
          setInitialData(JSON.parse(text));
        } catch {
          setInitialData(null);
        }
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [noteId]);

  // Debounced writer — 400ms mirrors the body autosave.
  const writer = useMemo(
    () =>
      debounce((id: string, doc: unknown) => {
        const blob = new Blob([JSON.stringify(doc)], { type: 'application/json' });
        void writeCanvas(id, PROVIDER_ID, blob);
      }, 400),
    [],
  );

  function handleChange(elements: unknown[], appState: unknown, files: unknown): void {
    writer(noteId, { elements, appState, files });
  }

  // Expose api ref for export — global lookup on window so the palette
  // command can grab it without prop-drilling.
  useEffect(() => {
    const w = window as { __sveskaCanvasExport?: () => Promise<Blob | null> };
    w.__sveskaCanvasExport = async () => {
      const api = apiRef.current;
      if (!api?.exportToBlob || !api.getSceneElements || !api.getAppState || !api.getFiles)
        return null;
      return api.exportToBlob({
        mimeType: 'image/png',
        elements: api.getSceneElements(),
        appState: api.getAppState(),
        files: api.getFiles(),
      });
    };
    return () => {
      delete w.__sveskaCanvasExport;
    };
  }, []);

  return (
    <div className="canvas-pane" data-testid="canvas-pane">
      <Suspense
        fallback={
          <div className="canvas-loading" data-testid="canvas-loading">
            Loading canvas vendor chunk…
          </div>
        }
      >
        {ready && (
          <LazyExcalidraw
            initialData={initialData as never}
            onChange={handleChange as never}
            excalidrawAPI={
              ((api: ExcalidrawApi) => {
                apiRef.current = api;
              }) as never
            }
            theme="dark"
            UIOptions={{ canvasActions: { saveToActiveFile: false } }}
          />
        )}
      </Suspense>
    </div>
  );
}

function blobToText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (): void => resolve(typeof fr.result === 'string' ? fr.result : '');
    fr.onerror = (): void => reject(fr.error ?? new Error('read failed'));
    fr.readAsText(blob, 'utf-8');
  });
}
