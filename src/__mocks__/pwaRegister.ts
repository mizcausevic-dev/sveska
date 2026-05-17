// Stub for `virtual:pwa-register/react` in test runs.
// Vitest doesn't run vite-plugin-pwa, so we alias the virtual import here
// (see vitest.config.ts resolve.alias). Behaviour mirrors a service worker
// that never has an update available.
export function useRegisterSW(): {
  needRefresh: [boolean, (n: boolean) => void];
  offlineReady: [boolean, (n: boolean) => void];
  updateServiceWorker: (reload?: boolean) => Promise<void>;
} {
  return {
    needRefresh: [false, (): void => undefined],
    offlineReady: [false, (): void => undefined],
    updateServiceWorker: async (): Promise<void> => undefined,
  };
}
