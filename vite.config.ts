import { defineConfig, type ViteDevServer, type PreviewServer } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Make POST /share-target return 200 + a redirect to /?capture=1 in both dev and `vite preview`.
 * Production hosting (netlify.toml) does the same via its SPA fallback. The functional capture
 * handler arrives at M3.7.
 */
function shareTargetMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): void {
  if (req.method === 'POST') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end('<!doctype html><meta http-equiv="refresh" content="0;url=/?capture=1">');
    return;
  }
  next();
}

const shareTargetStub = {
  name: 'sveska-share-target-stub',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/share-target', shareTargetMiddleware);
  },
  configurePreviewServer(server: PreviewServer) {
    server.middlewares.use('/share-target', shareTargetMiddleware);
  },
};

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * Force markdown-it + DOMPurify (and their transitive helpers — entities,
         * mdurl, linkify-it, uc.micro, punycode.js) into a single async chunk.
         *
         * The chunk split is necessary-but-not-sufficient. The first attempt at
         * this (commit af0d619) only added the rule; the gzip dropped 179.78 →
         * 179.12 KB because Editor.tsx and commandCatalog.ts statically imported
         * paths that reached renderMd, so Rollup preloaded the markdown chunk.
         * The full fix also refactors `markdown/export.ts` and `platform/content.ts`
         * to lazy-load renderMd via cached promise getters — then the gzip
         * actually drops 179.11 → 124.58 KB (-54.5 KB), which is what the
         * "56 KB recovered" estimate originally predicted.
         *
         * Anything ELSE imported only by lazy chunks falls through to default chunking.
         */
        manualChunks(id: string) {
          if (
            /[\\/]node_modules[\\/](markdown-it|dompurify|entities|mdurl|linkify-it|uc\.micro|punycode\.js)[\\/]/.test(
              id,
            )
          ) {
            return 'markdown-async';
          }
          return undefined;
        },
      },
    },
  },
  plugins: [
    react(),
    shareTargetStub,
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      strategies: 'generateSW',
      includeAssets: [
        'brand/favicon.svg',
        'brand/icons/apple-touch-icon.png',
        'brand/icons/favicon-16.png',
        'brand/icons/favicon-32.png',
        'robots.txt',
      ],
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'Sveska — local-first notepad',
        short_name: 'Sveska',
        description:
          'A studio-grade, offline-first notepad. Notes, Markdown, canvas, AI — all local.',
        id: '/',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        background_color: '#0C0C0E',
        theme_color: '#0C0C0E',
        categories: ['productivity', 'utilities'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          { src: '/brand/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
          { src: '/brand/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/brand/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/brand/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/brand/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/brand/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/brand/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
          { src: '/brand/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/brand/icons/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/brand/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: '/brand/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
        shortcuts: [
          { name: 'New note', url: '/?new=1', short_name: 'New' },
          { name: 'Quick capture', url: '/?capture=1', short_name: 'Capture' },
          { name: 'Canvas', url: '/?view=canvas', short_name: 'Canvas' },
        ],
        share_target: {
          action: '/share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [{ name: 'files', accept: ['text/plain', 'text/markdown', '.txt', '.md'] }],
          },
        },
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ttf}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/share-target/, /^\/api\//],
        cleanupOutdatedCaches: true,
        // Keep an existing tab on its existing precache until the user accepts
        // the update. Claiming old clients immediately can strand a lazy import
        // between two deployments.
        clientsClaim: false,
        skipWaiting: false,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
  },
});
