import { create } from 'zustand';

interface CommandPaletteState {
  open: boolean;
  set: (open: boolean) => void;
}

export const useCommandPalette = create<CommandPaletteState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openCommandPalette(): void {
  useCommandPalette.getState().set(true);
}
export function closeCommandPalette(): void {
  useCommandPalette.getState().set(false);
}
