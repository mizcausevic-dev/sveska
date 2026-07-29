import { create } from 'zustand';

interface TableModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useTableModal = create<TableModalState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export function openTableModal(): void {
  useTableModal.getState().setOpen(true);
}

export function closeTableModal(): void {
  useTableModal.getState().setOpen(false);
}
