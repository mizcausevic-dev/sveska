#!/usr/bin/env node
// Hard security gate: fail the build if any API-key-shaped string leaked into the client bundle.
// Wired now (M0) so it can never silently regress when the AI layer lands at M4.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const PATTERNS = [
  // Vite-exposed env vars that look like API keys.
  /VITE_[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PRIVATE)[A-Z0-9_]*/i,
  // Common AI provider key prefixes.
  /\bsk-ant-[A-Za-z0-9_-]{20,}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  // Anthropic env var by name.
  /\bANTHROPIC_API_KEY\b/,
  /\bOPENAI_API_KEY\b/,
  // Generic bearer-shaped secrets.
  /\bBearer\s+[A-Za-z0-9_-]{30,}\b/,
];

const ALLOWLIST_FILES = new Set([
  // Add file basenames here only after manual security review. Empty by default.
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (/\.(js|mjs|cjs|html|css|map|json|txt|svg|webmanifest)$/i.test(entry)) out.push(full);
  }
  return out;
}

let failed = false;
const files = (() => {
  try {
    return walk(DIST);
  } catch (e) {
    console.error(`[check-no-keys] dist/ not found — run \`pnpm build\` first. (${e.message})`);
    process.exit(1);
  }
})();

for (const file of files) {
  const base = file.split(/[\\/]/).pop();
  if (ALLOWLIST_FILES.has(base)) continue;
  const text = readFileSync(file, 'utf8');
  for (const re of PATTERNS) {
    const m = text.match(re);
    if (m) {
      console.error(`[check-no-keys] LEAK: ${file} matched ${re} -> ${m[0].slice(0, 40)}...`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\n[check-no-keys] FAILED — API-key-shaped content found in client bundle.');
  console.error('   Security gate (CLAUDE.md §5) — fix before merge.');
  process.exit(2);
}

console.log(`[check-no-keys] OK — ${files.length} bundle files scanned, no key-shaped secrets.`);
