import { create } from 'zustand';
import { type Directory } from './db';
import {
  createDirectory,
  deleteDirectoryTree,
  listDirectories,
  renameDirectory,
} from './directoryRepo';

interface DirectoryState {
  directories: Directory[];
  selectedId: string | null;
  ready: boolean;
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  select: (id: string | null) => void;
  create: (name: string, parentId?: string | null) => Promise<Directory>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useDirectories = create<DirectoryState>((set, get) => ({
  directories: [],
  selectedId: null,
  ready: false,
  bootstrap: async () => {
    const directories = await listDirectories();
    set({ directories, ready: true });
  },
  refresh: async () => {
    const directories = await listDirectories();
    const selectedId = get().selectedId;
    set({
      directories,
      selectedId:
        selectedId && directories.some((directory) => directory.id === selectedId)
          ? selectedId
          : null,
      ready: true,
    });
  },
  select: (selectedId) => set({ selectedId }),
  create: async (name, parentId = null) => {
    const directory = await createDirectory(name, parentId);
    await get().refresh();
    return directory;
  },
  rename: async (id, name) => {
    await renameDirectory(id, name);
    await get().refresh();
  },
  remove: async (id) => {
    await deleteDirectoryTree(id);
    await get().refresh();
  },
}));
