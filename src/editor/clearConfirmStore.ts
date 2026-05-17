import { create } from 'zustand';

interface ClearConfirmState {
  open: boolean;
  /** Pending confirm()'s resolver — null when no prompt is open. */
  resolver: ((accepted: boolean) => void) | null;
  prompt: () => Promise<boolean>;
  resolve: (accepted: boolean) => void;
}

export const useClearConfirm = create<ClearConfirmState>((set, get) => ({
  open: false,
  resolver: null,
  prompt: () =>
    new Promise<boolean>((resolve) => {
      set({ open: true, resolver: resolve });
    }),
  resolve: (accepted) => {
    const r = get().resolver;
    set({ open: false, resolver: null });
    if (r) r(accepted);
  },
}));

/** Open the confirm dialog; resolves true on Accept, false on Cancel/dismiss. */
export function confirmClear(): Promise<boolean> {
  return useClearConfirm.getState().prompt();
}
