import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/platform/useSeo';
import { loadBlogIndex, type BlogPostMeta } from '@/platform/content';
import { EmailCapture } from '@/platform/EmailCapture';

/**
 * Blog index (M6.T6.2). Renders the curated list from
 * /public/content/blog/index.json. Posts are linked into /blog/:slug.
 */
export function BlogIndex(): React.JSX.Element {
  useSeo({
    title: 'Blog — Sveska',
    description: 'Essays on local-first software, building Sveska, and writing tools.',
    canonical: 'https://sveska.studio/blog',
  });
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void loadBlogIndex()
      .then(setPosts)
      .catch((e: unknown) => setErr((e as Error).message));
  }, []);

  return (
    <article className="content-page" data-testid="blog-index">
      <header>
        <h1>Blog</h1>
        <p className="lead">Essays on local-first software, building Sveska, and writing tools.</p>
      </header>
      {err && (
        <p className="content-error" data-testid="content-error">
          Couldn’t load the blog index ({err}).
        </p>
      )}
      <ul className="blog-list">
        {posts.map((p) => (
          <li key={p.slug} className="blog-entry" data-testid={`blog-entry-${p.slug}`}>
            <h2>
              <Link to={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="blog-summary">{p.summary}</p>
            <p className="blog-meta mono">
              <time dateTime={p.publishedAt}>{p.publishedAt}</time>
              {p.tags && p.tags.length > 0 && (
                <span className="blog-tags"> · {p.tags.map((t) => `#${t}`).join(' ')}</span>
              )}
            </p>
          </li>
        ))}
      </ul>
      <EmailCapture source="blog-index" className="leadgen-card--blog" />
    </article>
  );
}
