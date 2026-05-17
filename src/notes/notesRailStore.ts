import { create } from 'zustand';

/**
 * Rail UI state (M2.T2.4). Persists open/collapsed across a session via the
 * Zustand store; we don't bother round-tripping it through Dexie because the
 * default (open) is a fine cold-start, and toggle is one click away.
 *
 * `filter` is one of:
 *   - { kind: 'all' }
 *   - { kind: 'pinned' }
 *   - { kind: 'untagged' }
 *   - { kind: 'tag', tag: string }
 */
export type RailFilter =
  | { kind: 'all' }
  | { kind: 'pinned' }
  | { kind: 'untagged' }
  | { kind: 'tag'; tag: string };

interface RailState {
  open: boolean;
  filter: RailFilter;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setFilter: (f: RailFilter) => void;
}

export const useNotesRail = create<RailState>((set) => ({
  open: true,
  filter: { kind: 'all' },
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  setFilter: (filter) => set({ filter }),
}));
