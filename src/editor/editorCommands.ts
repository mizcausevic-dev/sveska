import { create } from 'zustand';

/**
 * Tiny command registry — the Editor registers callbacks at mount;
 * KeyBindings (global) invokes them by name. Decouples the keyboard layer
 * from where the active note's body lives, so KeyBindings doesn't need
 * to know about Editor internals.
 */

export type EditorCommand = 'export.txt' | 'copy.body' | 'clear.body.request';

interface EditorCommandsState {
  commands: Partial<Record<EditorCommand, () => void>>;
  register: (id: EditorCommand, fn: () => void) => void;
  unregister: (id: EditorCommand) => void;
  run: (id: EditorCommand) => boolean;
}

export const useEditorCommands = create<EditorCommandsState>((set, get) => ({
  commands: {},
  register: (id, fn) => {
    set((s) => ({ commands: { ...s.commands, [id]: fn } }));
  },
  unregister: (id) => {
    set((s) => {
      const next = { ...s.commands };
      delete next[id];
      return { commands: next };
    });
  },
  run: (id) => {
    const fn = get().commands[id];
    if (!fn) return false;
    fn();
    return true;
  },
}));
