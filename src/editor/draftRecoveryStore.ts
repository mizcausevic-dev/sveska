import { create } from 'zustand';

/**
 * Holds the *single* draft pending recovery for the currently-mounted Editor.
 * Set by the Editor when it detects a `draft.<noteId>` shadow whose `savedAt`
 * is newer than `note.updatedAt` (M2.T2.3). Cleared when the user picks
 * Keep or Discard in the banner.
 */
export interface PendingDraft {
  noteId: string;
  draftBody: string;
  noteBody: string;
  savedAt: number;
}

interface DraftRecoveryState {
  pending: PendingDraft | null;
  set: (p: PendingDraft | null) => void;
  clear: () => void;
}

export const useDraftRecovery = create<DraftRecoveryState>((set) => ({
  pending: null,
  set: (p) => set({ pending: p }),
  clear: () => set({ pending: null }),
}));
