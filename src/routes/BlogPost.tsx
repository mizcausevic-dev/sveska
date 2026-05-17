import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeo } from '@/platform/useSeo';
import { loadBlogIndex, loadBlogPostHtml, type BlogPostMeta } from '@/platform/content';
import { EmailCapture } from '@/platform/EmailCapture';

/**
 * Individual blog post (M6.T6.2). Loads the matching Markdown file from
 * /public/content/blog/<slug>.md and the post's metadata from the index.
 */
export function BlogPost(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState('');
  const [meta, setMeta] = useState<BlogPostMeta | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setHtml('');
    setMeta(null);
    setErr(null);
    void Promise.all([loadBlogIndex(), loadBlogPostHtml(slug)])
      .then(([index, body]) => {
        setMeta(index.find((p) => p.slug === slug) ?? null);
        setHtml(body);
      })
      .catch((e: unknown) => setErr((e as Error).message));
  }, [slug]);

  useSeo({
    title: meta ? `${meta.title} — Sveska` : 'Post — Sveska',
    description: meta?.summary ?? 'A Sveska blog post.',
    canonical: `https://sveska.studio/blog/${slug ?? ''}`,
  });

  return (
    <article className="content-page" data-testid="blog-post">
      <p className="content-back">
        <Link to="/blog">← all posts</Link>
      </p>
      {meta && (
        <header className="blog-post-head">
          <h1>{meta.title}</h1>
          <p className="blog-meta mono">
            <time dateTime={meta.publishedAt}>{meta.publishedAt}</time>
            {meta.tags && meta.tags.length > 0 && (
              <span className="blog-tags"> · {meta.tags.map((t) => `#${t}`).join(' ')}</span>
            )}
          </p>
        </header>
      )}
      {err && (
        <p className="content-error" data-testid="content-error">
          Couldn’t load this post ({err}).
        </p>
      )}
      <div
        className="content-body prose"
        data-testid="blog-post-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EmailCapture
        source="blog-post"
        className="leadgen-card--blog"
        heading="Liked this? Get the next one."
      />
    </article>
  );
}
