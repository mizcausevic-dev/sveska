/**
 * Static content loader for changelog + blog (M6.T6.2).
 *
 * Content files live in /public/content/ and are fetched at navigation
 * time. The renderer reuses the existing markdown-it + DOMPurify
 * pipeline so links are clickable, code blocks are styled, and XSS is
 * still gated. Result is cached in-memory per slug for the session so
 * back-button nav doesn't re-fetch.
 */

// markdown-it + DOMPurify live in the `markdown-vendor` chunk (vite.config
// manualChunks rule). commandCatalog statically imports this module for
// slugify + toBlogMdx, so we cannot top-level-import renderMd here without
// dragging the vendor into the initial bundle. Lazy-cache instead.
import type { renderMd as RenderMd } from '@/markdown/render';
let renderMdPromise: Promise<typeof RenderMd> | null = null;
function getRenderMd(): Promise<typeof RenderMd> {
  if (!renderMdPromise) {
    renderMdPromise = import('@/markdown/render').then((m) => m.renderMd);
  }
  return renderMdPromise;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags?: string[];
}

const CACHE = new Map<string, string>();

async function fetchText(url: string): Promise<string> {
  const cached = CACHE.get(url);
  if (cached !== undefined) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`content fetch failed: ${url} → ${res.status}`);
  const text = await res.text();
  CACHE.set(url, text);
  return text;
}

export async function loadChangelogHtml(): Promise<string> {
  const md = await fetchText('/content/changelog.md');
  const renderMd = await getRenderMd();
  return renderMd(md);
}

export async function loadBlogIndex(): Promise<BlogPostMeta[]> {
  const cached = CACHE.get('blog-index');
  if (cached !== undefined) return JSON.parse(cached) as BlogPostMeta[];
  const res = await fetch('/content/blog/index.json');
  if (!res.ok) throw new Error(`blog index fetch failed: ${res.status}`);
  const json = (await res.json()) as { posts: BlogPostMeta[] };
  CACHE.set('blog-index', JSON.stringify(json.posts));
  return json.posts;
}

export async function loadBlogPostHtml(slug: string): Promise<string> {
  const md = await fetchText(`/content/blog/${encodeURIComponent(slug)}.md`);
  const renderMd = await getRenderMd();
  return renderMd(md);
}

/**
 * Build a frontmatter-prefixed Markdown export of an active note, suitable
 * for dropping into an MDX-flavored blog system (Astro, Next.js, Eleventy).
 */
export function toBlogMdx(note: { title: string; body: string; tags: string[] }): string {
  const slug = slugify(note.title) || `note-${Date.now()}`;
  const today = new Date().toISOString().slice(0, 10);
  const fm = [
    '---',
    `title: ${JSON.stringify(note.title || 'Untitled')}`,
    `slug: "${slug}"`,
    `publishedAt: "${today}"`,
    `tags: [${note.tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    `source: "sveska://export"`,
    '---',
    '',
  ].join('\n');
  return fm + note.body;
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      // Strip combining diacritic marks (čšž → c s z) before alpha-only filter.
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64)
  );
}
