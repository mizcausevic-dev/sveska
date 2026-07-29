import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

/**
 * Chrome extension API shim for jsdom tests. jsdom doesn't ship the
 * `chrome.*` namespace — everything in the extension that touches
 * `chrome.storage.local`, `chrome.sidePanel`, or `chrome.action` reads
 * from this in-memory shim during test runs.
 *
 * The storage shim matches the real chrome.storage.local shape: get(key |
 * keys[] | { key: default }) returns matching entries; set(items) merges;
 * remove/clear behave as documented. Each test starts against an empty
 * store (see beforeEach below) so tests don't leak into each other.
 */

interface ChromeStorageArea {
  get: (
    keys?: string | string[] | Record<string, unknown> | null,
  ) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (keys: string | string[]) => Promise<void>;
  clear: () => Promise<void>;
}

interface ChromeShim {
  storage: { local: ChromeStorageArea };
  sidePanel: {
    open: (opts: { windowId: number }) => Promise<void>;
    setPanelBehavior: (opts: { openPanelOnActionClick: boolean }) => Promise<void>;
  };
  action: {
    onClicked: {
      addListener: (fn: (tab: { windowId?: number }) => void) => void;
    };
  };
}

let store: Record<string, unknown> = {};

function makeStorageArea(): ChromeStorageArea {
  return {
    get: vi.fn(async (keys) => {
      if (keys === undefined || keys === null) return { ...store };
      if (typeof keys === 'string') {
        return keys in store ? { [keys]: store[keys] } : {};
      }
      if (Array.isArray(keys)) {
        const out: Record<string, unknown> = {};
        for (const k of keys) if (k in store) out[k] = store[k];
        return out;
      }
      const out: Record<string, unknown> = {};
      for (const [k, fallback] of Object.entries(keys)) {
        out[k] = k in store ? store[k] : fallback;
      }
      return out;
    }),
    set: vi.fn(async (items) => {
      Object.assign(store, items);
    }),
    remove: vi.fn(async (keys) => {
      const list = Array.isArray(keys) ? keys : [keys];
      for (const k of list) delete store[k];
    }),
    clear: vi.fn(async () => {
      store = {};
    }),
  };
}

const chromeShim: ChromeShim = {
  storage: { local: makeStorageArea() },
  sidePanel: {
    open: vi.fn(async () => {}),
    setPanelBehavior: vi.fn(async () => {}),
  },
  action: {
    onClicked: { addListener: vi.fn() },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as unknown as { chrome: ChromeShim }).chrome = chromeShim;

beforeEach(() => {
  store = {};
});
