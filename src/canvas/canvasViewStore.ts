import { create } from 'zustand';

/**
 * Tracks whether the canvas pane is visible for the active note (M5.T5.1).
 * Session-scoped — closing + reopening the tab returns to text view; the
 * canvas DATA persists via `canvasRepo`, the view-state doesn't.
 */
interface CanvasViewState {
  open: boolean;
  toggle: () => void;
  set: (open: boolean) => void;
}

export const useCanvasView = create<CanvasViewState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  set: (open) => set({ open }),
}));

export function openCanvasView(): void {
  useCanvasView.getState().set(true);
}
export function closeCanvasView(): void {
  useCanvasView.getState().set(false);
}
