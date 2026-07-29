#!/usr/bin/env node
/**
 * Phase 1 DoD build gate.
 *
 * MV3's default extension CSP is `script-src 'self'; object-src 'self'`,
 * which blocks both `eval()` and `new Function(...)` at runtime. Recon
 * verified our source-level deps (markdown-it, DOMPurify, @codemirror/*,
 * React) are clean, but a bundler transform could still introduce eval
 * (e.g. via a "helpful" polyfill or a lazy-import shim). This script
 * re-verifies the assumption against the actual `dist/` output so we
 * catch bundler-introduced eval before the extension ever loads.
 *
 * Exits non-zero on the first hit. Runs as the last step of `pnpm build`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

// Match `eval(` and `new Function(` as tokens (word-boundary-aware).
const PATTERNS = [
  { name: 'eval', re: /\beval\s*\(/g },
  { name: 'new Function', re: /\bnew\s+Function\s*\(/g },
];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(js|mjs|cjs)$/.test(e)) out.push(p);
  }
  return out;
}

let hits = 0;
let filesScanned = 0;

let files;
try {
  files = walk(DIST);
} catch (err) {
  console.error(`[extension] check-no-eval: could not walk ${DIST}: ${err.message}`);
  console.error('Run `pnpm build` first.');
  process.exit(2);
}

for (const f of files) {
  filesScanned++;
  const content = readFileSync(f, 'utf8');
  for (const { name, re } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const before = content.slice(0, m.index);
      const line = before.split('\n').length;
      const rel = f.replace(DIST + '/', '').replace(DIST + '\\', '');
      console.error(`  ${rel}:${line}  ${name}(`);
      hits++;
    }
  }
}

if (hits > 0) {
  console.error(
    `\n[extension] check-no-eval FAILED — ${hits} hit(s) across ${filesScanned} file(s).`,
  );
  console.error(
    "MV3's default CSP forbids eval() and new Function(). Fix the source or bundler config.",
  );
  process.exit(1);
}
console.log(`[extension] check-no-eval passed (0 hits across ${filesScanned} file(s) in dist/).`);
