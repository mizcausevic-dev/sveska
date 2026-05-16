#!/usr/bin/env node
// Build-time sitemap generator. Keeps SEO surface declarative.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://sveska.studio';
const TODAY = new Date().toISOString().slice(0, 10);

const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/glossary', changefreq: 'weekly', priority: '0.7' },
];

const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${BASE}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

// Write into dist/ post-build so the deployed bundle ships it.
const out = existsSync('dist') ? join('dist', 'sitemap.xml') : join('public', 'sitemap.xml');
if (!existsSync('dist') && !existsSync('public')) mkdirSync('public');
writeFileSync(out, body, 'utf8');
console.log(`[sitemap] wrote ${out} with ${routes.length} routes`);
