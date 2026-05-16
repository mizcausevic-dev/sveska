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
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    react(),
    shareTargetStub,
    VitePWA({
      registerType: 'autoUpdate',
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
        clientsClaim: true,
        skipWaiting: true,
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
