#!/usr/bin/env node
// Bundle budget gate. CLAUDE.md §0: main bundle < 180KB gzip (pre-canvas/AI).
// Reports per-asset gzip size and fails if main entry exceeds budget.

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

const jsFiles = files.filter((f) => /\.js$/.test(f) && !/sw\.js$|workbox-/.test(f));
const cssFiles = files.filter((f) => /\.css$/.test(f));

let totalJsGz = 0;
let totalCssGz = 0;
const rows = [];
for (const f of [...jsFiles, ...cssFiles]) {
  const raw = readFileSync(f);
  const gz = gzipSync(raw).length;
  rows.push({ file: f.replace(DIST, '').replace(/\\/g, '/'), raw: raw.length, gz });
  if (/\.js$/.test(f)) totalJsGz += gz;
  else totalCssGz += gz;
}

rows.sort((a, b) => b.gz - a.gz);
const kb = (n) => (n / 1024).toFixed(2);

console.log('\n[check-bundle] per-asset gzipped sizes:');
console.log('   ' + 'file'.padEnd(60) + 'raw'.padStart(10) + 'gzip'.padStart(10));
for (const r of rows) {
  console.log(
    '   ' + r.file.padEnd(60) + (kb(r.raw) + ' KB').padStart(10) + (kb(r.gz) + ' KB').padStart(10),
  );
}

const totalKb = (totalJsGz + totalCssGz) / 1024;
console.log(`\n[check-bundle] total JS gzip:  ${kb(totalJsGz)} KB`);
console.log(`[check-bundle] total CSS gzip: ${kb(totalCssGz)} KB`);
console.log(`[check-bundle] combined:       ${totalKb.toFixed(2)} KB / budget ${BUDGET_KB} KB`);

if (totalJsGz / 1024 > BUDGET_KB) {
  console.error(
    `\n[check-bundle] FAILED — JS gzip ${kb(totalJsGz)} KB > budget ${BUDGET_KB} KB. Investigate before merge.`,
  );
  process.exit(2);
}

console.log('[check-bundle] OK — within budget.');
