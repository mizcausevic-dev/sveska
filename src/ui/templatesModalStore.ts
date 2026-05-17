import { create } from 'zustand';

export type TemplatesTab = 'templates' | 'snippets';

interface TemplatesModalState {
  open: boolean;
  tab: TemplatesTab;
  set: (open: boolean) => void;
  setTab: (tab: TemplatesTab) => void;
}

export const useTemplatesModal = create<TemplatesModalState>((set) => ({
  open: false,
  tab: 'templates',
  set: (open) => set({ open }),
  setTab: (tab) => set({ tab }),
}));

export function openTemplates(tab: TemplatesTab = 'templates'): void {
  useTemplatesModal.getState().set(true);
  useTemplatesModal.getState().setTab(tab);
}

export function closeTemplates(): void {
  useTemplatesModal.getState().set(false);
}
