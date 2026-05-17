#!/usr/bin/env node
// One-off Playwright capture for the design-mocks HTML files.
// Renders each at 1400×900 and saves a PNG to docs/screenshots/.
//
// Run: pnpm dlx playwright install chromium && node scripts/capture-mocks.mjs

import { chromium } from 'playwright';
import { mkdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'docs/screenshots');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Tiny static server — the design mocks Babel-fetch JSX files over XHR which
// `file://` blocks via CORS. Serve from disk on localhost so the relative
// imports work.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const filePath = resolve(root, '.' + url);
  try {
    if (!statSync(filePath).isFile()) {
      res.writeHead(404).end();
      return;
    }
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' });
    res.end(readFileSync(filePath));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;
console.log(`Static server: ${base}`);

// Curated list — the most product-y mocks. Skipping pure motion/animation
// pages and the audit/error tiles that don't show app surfaces.
const TARGETS = [
  { src: 'docs/design-mocks/app-shell.html', out: '01-app-shell.png', name: 'App shell + editor' },
  {
    src: 'docs/design-mocks/multinote.html',
    out: '02-multinote.png',
    name: 'Multi-note · search · history',
  },
  { src: 'docs/design-mocks/canvas.html', out: '03-canvas.png', name: 'Excalidraw canvas' },
  {
    src: 'docs/design-mocks/ai-flows.html',
    out: '04-ai-flows.png',
    name: 'AI slash commands + flows',
  },
  {
    src: 'docs/design-mocks/templates-snippets.html',
    out: '05-templates-snippets.png',
    name: 'Templates + snippet manager',
  },
  { src: 'docs/design-mocks/mobile-pwa.html', out: '06-mobile-pwa.png', name: 'Mobile PWA' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  deviceScaleFactor: 2, // retina-crisp PNGs
});

for (const t of TARGETS) {
  const url = `${base}/${t.src.replace(/\\/g, '/')}`;
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error(`  [console] ${msg.text()}`);
  });
  page.on('pageerror', (err) => console.error(`  [pageerror] ${err.message}`));
  page.on('requestfailed', (req) =>
    console.error(`  [requestfailed] ${req.url()} → ${req.failure()?.errorText}`),
  );
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    // The mocks use in-browser Babel JSX compilation after the page settles;
    // wait until #root actually has content, then give fonts a beat to swap.
    await page.waitForFunction(
      () => {
        const r = document.getElementById('root');
        return r !== null && r.children.length > 0;
      },
      { timeout: 60_000 },
    );
    await page.waitForTimeout(1500);
    await page.screenshot({ path: resolve(outDir, t.out), fullPage: true });
    console.log(`✓ ${t.out.padEnd(28)} ${t.name}`);
  } catch (err) {
    console.error(`✗ ${t.out}: ${err.message}`);
  }
  await page.close();
}

await ctx.close();
await browser.close();
server.close();
console.log('\nWrote screenshots to', outDir);
