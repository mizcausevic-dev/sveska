import { create } from 'zustand';

interface StatsModalState {
  open: boolean;
  set: (open: boolean) => void;
}

export const useStatsModal = create<StatsModalState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openStats(): void {
  useStatsModal.getState().set(true);
}

export function closeStats(): void {
  useStatsModal.getState().set(false);
}
