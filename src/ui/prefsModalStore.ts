import { create } from 'zustand';

interface PrefsModalState {
  open: boolean;
  set: (open: boolean) => void;
}

export const usePrefsModal = create<PrefsModalState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openPrefs(): void {
  usePrefsModal.getState().set(true);
}

export function closePrefs(): void {
  usePrefsModal.getState().set(false);
}
