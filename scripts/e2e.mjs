#!/usr/bin/env node
// M7.T7.1b — End-to-end smoke suite for the built PWA.
//
// Drives the production `dist/` via `vite preview` through Chromium.
// Confirms the offline path (the load-bearing local-first contract) and that
// every public route renders without console errors.
//
// Prereqs (run once):
//   pnpm build
//   pnpm dlx playwright install chromium
//
// Run:
//   node scripts/e2e.mjs
//
// Not wired into `pnpm build` because it depends on the Chromium binary —
// kept on-demand so CI stays slim. Run before tagging a release.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { connect } from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
// Pick a port unlikely to collide with a stray `pnpm preview`. The PWA
// uses same-origin everywhere, so any port works.
const PORT = Number(process.env.SVESKA_E2E_PORT ?? 4179);
const BASE = `http://localhost:${PORT}`;

if (!existsSync(resolve(root, 'dist/index.html'))) {
  console.error('✗ dist/ missing — run `pnpm build` first.');
  process.exit(2);
}

// Spawn `vite preview` and wait until the TCP port accepts connections.
// Parsing stdout for "Local:" is fragile across Vite versions.
console.log(`Starting vite preview on ${BASE}…`);
// Bypass the package.json script so we can pin the port + force strict mode.
const preview = spawn('pnpm', ['exec', 'vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: root,
  shell: process.platform === 'win32',
  stdio: ['ignore', 'pipe', 'pipe'],
});
preview.stdout.on('data', (b) => process.stdout.write(`[preview] ${b}`));
preview.stderr.on('data', (b) => process.stderr.write(`[preview] ${b}`));
await waitFor(() => portOpen(PORT), 30_000, `vite preview did not open port ${PORT}`);

const results = [];
let exitCode = 0;
const browser = await chromium.launch();

try {
  await runCase('home / editor mounts', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = collectErrors(page);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('textarea[data-testid="editor-textarea"]', { timeout: 10_000 });
    assertNoErrors(errors);
    await ctx.close();
  });

  await runCase('/glossary renders entries', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = collectErrors(page);
    await page.goto(`${BASE}/glossary`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid^="glossary-entry-"]', { timeout: 10_000 });
    const count = await page.locator('[data-testid^="glossary-entry-"]').count();
    if (count < 5) throw new Error(`expected ≥5 glossary entries, got ${count}`);
    assertNoErrors(errors);
    await ctx.close();
  });

  await runCase('manifest.json is served + parses (PWA install gate)', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const resp = await page.goto(`${BASE}/manifest.json`);
    if (!resp || resp.status() !== 200) {
      throw new Error(`manifest GET → ${resp?.status() ?? 'no response'}`);
    }
    const manifest = JSON.parse(await resp.text());
    if (!manifest.name || !manifest.icons?.length) {
      throw new Error('manifest missing name or icons[]');
    }
    await ctx.close();
  });

  await runCase('offline: SW serves the shell after first visit', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    // Prime the SW + caches. The Workbox SW registers on first paint.
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('textarea[data-testid="editor-textarea"]', { timeout: 10_000 });
    // Give the SW a moment to claim clients; settle the cache.
    await page.waitForTimeout(1500);
    // Drop the network. Reload should still render the editor from cache.
    // We skip `waitForFunction` here because our CSP forbids `unsafe-eval`,
    // which Playwright's predicate evaluator needs — selector waits are fine.
    await ctx.setOffline(true);
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('textarea[data-testid="editor-textarea"]', { timeout: 10_000 });
    await ctx.close();
  });
} finally {
  await browser.close();
  preview.kill();
}

// Report.
const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
console.log(`\n${'─'.repeat(60)}`);
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.err ? '\n    → ' + r.err : ''}`);
}
console.log(`\n${passed} passed · ${failed} failed`);
process.exit(exitCode);

// ─── helpers ─────────────────────────────────────────────────────────

async function runCase(name, fn) {
  process.stdout.write(`  ${name}… `);
  try {
    await fn();
    results.push({ name, ok: true });
    process.stdout.write('ok\n');
  } catch (e) {
    exitCode = 1;
    results.push({ name, ok: false, err: e.message });
    process.stdout.write(`FAIL\n    → ${e.message}\n`);
  }
}

function collectErrors(page) {
  const errs = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(`[console.error] ${m.text()}`);
  });
  page.on('pageerror', (e) => errs.push(`[pageerror] ${e.message}`));
  return errs;
}

function assertNoErrors(errs) {
  // Filter benign console noise that does not indicate an app bug:
  //   - favicon / sourcemap chatter from dev tooling
  //   - the `frame-ancestors` warning: browsers ignore it when delivered
  //     via <meta>, but our netlify.toml header is the real enforcement
  //     point — the meta CSP is belt + suspenders for hosts that strip
  //     headers. The warning is documented expected behavior.
  const real = errs.filter(
    (e) => !/favicon|sourcemap/i.test(e) && !/frame-ancestors.*meta/i.test(e),
  );
  if (real.length > 0) throw new Error('console errors:\n  ' + real.join('\n  '));
}

async function waitFor(fn, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(label);
}

function portOpen(port) {
  // Try both v4 and v6 loopback — Vite on Windows often binds to ::1 only.
  return Promise.any([tryConnect(port, '127.0.0.1'), tryConnect(port, '::1')]).then(
    () => true,
    () => false,
  );
}

function tryConnect(port, host) {
  return new Promise((res, rej) => {
    const s = connect(port, host);
    s.once('connect', () => {
      s.destroy();
      res();
    });
    s.once('error', (e) => {
      s.destroy();
      rej(e);
    });
  });
}
