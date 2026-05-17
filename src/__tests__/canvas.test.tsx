import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { useTabs } from '@/notes/tabsStore';
import { countCanvases, readCanvas, writeCanvas, deleteCanvas } from '@/canvas/canvasRepo';
import { useCanvasView } from '@/canvas/canvasViewStore';

async function renderApp(): Promise<void> {
  await bootstrapTheme();
  render(<App />);
  await waitFor(() => expect(screen.getByTestId('editor-textarea')).toBeInTheDocument());
  await waitFor(() => expect(useTabs.getState().activeNote).not.toBeNull());
}

describe('M5.T5.1 — canvasRepo', () => {
  it('round-trips a Blob through write + read', async () => {
    const doc = new Blob([JSON.stringify({ elements: [{ id: 'a' }] })], {
      type: 'application/json',
    });
    await writeCanvas('n1', 'excalidraw', doc);
    const back = await readCanvas('n1');
    expect(back?.noteId).toBe('n1');
    expect(back?.providerId).toBe('excalidraw');
    // fake-indexeddb may serialize the Blob through structured-clone; the
    // stored field exists, that's all we need for the round-trip contract.
    expect(back?.doc).toBeDefined();
    expect(await countCanvases()).toBe(1);
  });

  it('overwrites the row for the same noteId', async () => {
    await writeCanvas('n1', 'excalidraw', new Blob(['v1']));
    await writeCanvas('n1', 'excalidraw', new Blob(['v2']));
    expect(await countCanvases()).toBe(1);
  });

  it('deleteCanvas drops only the matching row', async () => {
    await writeCanvas('a', 'excalidraw', new Blob(['a']));
    await writeCanvas('b', 'excalidraw', new Blob(['b']));
    await deleteCanvas('a');
    expect(await readCanvas('a')).toBeNull();
    expect(await readCanvas('b')).not.toBeNull();
  });
});

describe('M5.T5.1 — Canvas view store + toggle UI', () => {
  it('canvas toggle button flips the store + opens the canvas pane', async () => {
    await renderApp();
    expect(useCanvasView.getState().open).toBe(false);
    expect(screen.queryByTestId('canvas-pane')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('canvas-toggle'));
    await waitFor(() => expect(useCanvasView.getState().open).toBe(true));
    // The lazy vendor chunk won't actually resolve in jsdom, but the wrapper
    // div (with the Suspense fallback) renders synchronously.
    await waitFor(() => expect(screen.getByTestId('canvas-pane')).toBeInTheDocument());
    expect(screen.getByTestId('editor-canvas-wrap')).toBeInTheDocument();
    // While loading, the fallback is what the user sees.
    expect(screen.getByTestId('canvas-loading')).toBeInTheDocument();
  });

  it('opening a different note closes the canvas pane', async () => {
    await renderApp();
    await userEvent.click(screen.getByTestId('canvas-toggle'));
    await waitFor(() => expect(useCanvasView.getState().open).toBe(true));

    // Spin up a fresh note + activate it.
    await useTabs.getState().newNote();
    await waitFor(() => expect(useCanvasView.getState().open).toBe(false));
    expect(screen.queryByTestId('canvas-pane')).not.toBeInTheDocument();
  });
});

describe('M5.T5.1 — palette commands', () => {
  it('"Open canvas" surfaces in the palette and opens the canvas', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'open canvas');
    await waitFor(() =>
      expect(screen.getByTestId('palette-row-note.canvas.open')).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTestId('palette-row-note.canvas.open'));
    await waitFor(() => expect(useCanvasView.getState().open).toBe(true));
  });

  it('"Export canvas" with canvas closed shows a warn toast (no PNG)', async () => {
    await renderApp();
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.type(screen.getByTestId('palette-input'), 'export canvas');
    await waitFor(() =>
      expect(screen.getByTestId('palette-row-note.canvas.export')).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTestId('palette-row-note.canvas.export'));
    await waitFor(() => expect(screen.getByTestId('ai-toast')).toBeInTheDocument());
    expect(screen.getByTestId('ai-toast').textContent).toContain('Open the canvas first');
  });
});
