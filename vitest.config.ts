import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * vite-plugin-pwa's `virtual:pwa-register/react` is resolved by the PWA
 * plugin's `resolveId` hook in dev/build. Vitest doesn't load that plugin,
 * so we replace the virtual import with an inline stub: never-needs-refresh,
 * never-offline-ready, no-op updateServiceWorker.
 */
const pwaRegisterStub = (): Plugin => ({
  name: 'sveska-pwa-register-stub',
  resolveId(id) {
    return id === 'virtual:pwa-register/react' ? id : null;
  },
  load(id) {
    if (id !== 'virtual:pwa-register/react') return null;
    return `
      export function useRegisterSW() {
        return {
          needRefresh: [false, () => {}],
          offlineReady: [false, () => {}],
          updateServiceWorker: () => Promise.resolve(),
        };
      }
    `;
  },
});

// T5.1 — @excalidraw/excalidraw's transitive roughjs import breaks under
// jsdom (Node ESM can't resolve `roughjs/bin/rough` without an extension).
// Aliased to src/__mocks__/excalidraw.ts in `resolve.alias` below.
// Production builds use the real package via lazy `import()`.

export default defineConfig({
  plugins: [pwaRegisterStub(), react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@excalidraw/excalidraw': resolve(__dirname, 'src/__mocks__/excalidraw.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: true,
    // The /extension package is a sibling Vite build with its own
    // node_modules and its own vitest config (chrome.* shim). Its tests
    // don't belong in the PWA's test run — running them here fails with a
    // multiple-React-instances error because both packages ship React.
    exclude: ['**/node_modules/**', '**/dist/**', 'extension/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test-setup.ts', 'src/main.tsx'],
    },
  },
});
