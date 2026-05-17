import { create } from 'zustand';

interface ShortcutsModalState {
  open: boolean;
  set: (open: boolean) => void;
}

export const useShortcutsModal = create<ShortcutsModalState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openShortcuts(): void {
  useShortcutsModal.getState().set(true);
}

export function closeShortcuts(): void {
  useShortcutsModal.getState().set(false);
}
