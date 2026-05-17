import { create } from 'zustand';

interface VersionsModalState {
  open: boolean;
  set: (open: boolean) => void;
}

export const useVersionsModal = create<VersionsModalState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openVersions(): void {
  useVersionsModal.getState().set(true);
}

export function closeVersions(): void {
  useVersionsModal.getState().set(false);
}
