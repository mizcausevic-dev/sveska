import { create } from 'zustand';

interface InboxModalState {
  open: boolean;
  set: (open: boolean) => void;
}

export const useInboxModal = create<InboxModalState>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

export function openInbox(): void {
  useInboxModal.getState().set(true);
}
export function closeInbox(): void {
  useInboxModal.getState().set(false);
}
