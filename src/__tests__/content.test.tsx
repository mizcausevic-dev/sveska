import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Changelog } from '@/routes/Changelog';
import { BlogIndex } from '@/routes/BlogIndex';
import { BlogPost } from '@/routes/BlogPost';
import { slugify, toBlogMdx } from '@/platform/content';

const CHANGELOG_MD = `# Changelog\n\n## v0.5.0-m5\n\nCanvas shipped.\n`;
const POSTS_INDEX = {
  posts: [
    {
      slug: 'why-local-first',
      title: 'Why local-first',
      summary: 'A short take.',
      publishedAt: '2026-05-17',
      tags: ['philosophy'],
    },
  ],
};
const POST_MD = '# Why local-first\n\nLocal-first means your work outlives the company.';

function mockFetch(): typeof fetch {
  return vi.fn(((url: string) => {
    if (url === '/content/changelog.md') {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(CHANGELOG_MD),
      } as Response);
    }
    if (url === '/content/blog/index.json') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(POSTS_INDEX),
      } as Response);
    }
    if (url.startsWith('/content/blog/') && url.endsWith('.md')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(POST_MD),
      } as Response);
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({}),
    } as Response);
  }) as typeof fetch);
}

describe('M6.T6.2 — slugify + toBlogMdx (pure)', () => {
  it('slugify trims + kebabs ASCII; Unicode passes through best-effort', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    // čšž decompose via NFKD; đ is a separate Latin letter (not a diacritic)
    // and falls into the non-alpha bucket, becoming a hyphen.
    expect(slugify('Najbolji početak')).toBe('najbolji-pocetak');
    expect(slugify('   !!! ')).toBe('');
  });

  it('toBlogMdx wraps a note with valid YAML frontmatter', () => {
    const out = toBlogMdx({ title: 'My Post', body: '# Hi\n\nbody', tags: ['draft', 'work'] });
    expect(out.startsWith('---\n')).toBe(true);
    expect(out).toContain('title: "My Post"');
    expect(out).toContain('slug: "my-post"');
    expect(out).toMatch(/publishedAt: "\d{4}-\d{2}-\d{2}"/);
    expect(out).toContain('tags: ["draft", "work"]');
    expect(out).toContain('source: "sveska://export"');
    expect(out).toContain('# Hi\n\nbody');
  });
});

describe('M6.T6.2 — /changelog page', () => {
  let originalFetch: typeof fetch;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('renders the fetched changelog HTML', async () => {
    render(
      <MemoryRouter initialEntries={['/changelog']}>
        <Changelog />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('changelog-body').innerHTML).toContain('Canvas shipped'),
    );
  });
});

describe('M6.T6.2 — /blog index + post', () => {
  let originalFetch: typeof fetch;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('lists posts from the index JSON', async () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <BlogIndex />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('blog-entry-why-local-first')).toBeInTheDocument(),
    );
    expect(screen.getByText('A short take.')).toBeInTheDocument();
  });

  it('renders an individual post for /blog/:slug', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/why-local-first']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('blog-post-body').innerHTML).toContain('outlives the company'),
    );
    // The post page renders an h1 for the index-metadata title, plus the
    // markdown body's own h1; both reading "Why local-first" is expected.
    const titles = screen.getAllByRole('heading', { level: 1, name: /Why local-first/ });
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });
});
