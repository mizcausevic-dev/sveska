#!/usr/bin/env node
// Bundle budget gate. CLAUDE.md §0: main bundle < 180KB gzip (pre-canvas/AI).
// Only counts initial-load chunks — i.e. assets directly linked from index.html.
// Lazy chunks (jspdf, etc) appear in the report but don't count toward budget.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = 'dist';
const BUDGET_KB = 180;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

let files;
try {
  files = walk(DIST);
} catch (e) {
  console.error(`[check-bundle] dist/ not found — run \`pnpm build\` first. (${e.message})`);
  process.exit(1);
}

// Parse index.html for the assets it directly loads. That's the initial-load
// surface the 180 KB budget applies to. Anything else (lazy chunks from
// `import()` — jsPDF, html2canvas) is on-demand and doesn't count.
let initialAssetNames = new Set();
try {
  const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
  const matches = html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g);
  for (const m of matches) initialAssetNames.add(m[1].replace(/\\/g, '/'));
} catch {
  // No html (e.g. unusual build) — fall back to counting everything.
  initialAssetNames = null;
}

const jsFiles = files.filter((f) => /\.js$/.test(f) && !/sw\.js$|workbox-/.test(f));
const cssFiles = files.filter((f) => /\.css$/.test(f));

let initialJsGz = 0;
let initialCssGz = 0;
let lazyJsGz = 0;
const rows = [];
for (const f of [...jsFiles, ...cssFiles]) {
  const raw = readFileSync(f);
  const gz = gzipSync(raw).length;
  const rel = f.replace(DIST, '').replace(/\\/g, '/').replace(/^\//, '');
  const isInitial = initialAssetNames === null ? true : initialAssetNames.has(rel);
  rows.push({ file: '/' + rel, raw: raw.length, gz, isInitial });
  if (/\.js$/.test(f)) {
    if (isInitial) initialJsGz += gz;
    else lazyJsGz += gz;
  } else if (isInitial) initialCssGz += gz;
}

rows.sort((a, b) => b.gz - a.gz);
const kb = (n) => (n / 1024).toFixed(2);

console.log('\n[check-bundle] per-asset gzipped sizes:');
console.log('   ' + 'file'.padEnd(60) + 'raw'.padStart(10) + 'gzip'.padStart(10) + '  load');
for (const r of rows) {
  console.log(
    '   ' +
      r.file.padEnd(60) +
      (kb(r.raw) + ' KB').padStart(10) +
      (kb(r.gz) + ' KB').padStart(10) +
      '  ' +
      (r.isInitial ? 'initial' : 'lazy'),
  );
}

const totalKb = (initialJsGz + initialCssGz) / 1024;
console.log(`\n[check-bundle] initial JS gzip: ${kb(initialJsGz)} KB`);
console.log(`[check-bundle] initial CSS gzip: ${kb(initialCssGz)} KB`);
console.log(`[check-bundle] lazy JS gzip:    ${kb(lazyJsGz)} KB`);
console.log(`[check-bundle] initial total:   ${totalKb.toFixed(2)} KB / budget ${BUDGET_KB} KB`);

if (initialJsGz / 1024 > BUDGET_KB) {
  console.error(
    `\n[check-bundle] FAILED — initial JS gzip ${kb(initialJsGz)} KB > budget ${BUDGET_KB} KB. Investigate before merge.`,
  );
  process.exit(2);
}

console.log('[check-bundle] OK — within budget.');
