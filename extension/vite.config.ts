import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, mkdirSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Copy MV3 manifest + icons into dist/ verbatim after each build. The
 * manifest references files by hardcoded path; the background service
 * worker filename is pinned below via `entryFileNames` so the
 * manifest → dist reference doesn't drift on rebuild. panel.html is
 * emitted by Vite from the input entry and can reference hashed JS/CSS
 * — Vite auto-injects those in the HTML output.
 */
function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      mkdirSync(resolve(dist, 'icons'), { recursive: true });
      cpSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'));
      const iconsSrc = resolve(__dirname, 'public/icons');
      if (existsSync(iconsSrc)) {
        cpSync(iconsSrc, resolve(dist, 'icons'), { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, 'panel.html'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        // background.js is pinned (referenced by manifest.json). Panel and
        // its dependencies get hashed filenames — Vite rewrites the HTML
        // <script>/<link> tags so panel.html's references stay correct.
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
