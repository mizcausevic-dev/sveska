import { create } from 'zustand';

interface FindReplaceState {
  open: boolean;
  set: (open: boolean) => void;
}

export const useFindReplace = create<FindReplaceState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openFindReplace(): void {
  useFindReplace.getState().set(true);
}
export function closeFindReplace(): void {
  useFindReplace.getState().set(false);
}
