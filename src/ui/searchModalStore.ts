import { create } from 'zustand';

interface SearchModalState {
  open: boolean;
  set: (open: boolean) => void;
}

export const useSearchModal = create<SearchModalState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openSearch(): void {
  useSearchModal.getState().set(true);
}
export function closeSearch(): void {
  useSearchModal.getState().set(false);
}
