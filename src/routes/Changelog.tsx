import { useEffect, useState } from 'react';
import { useSeo } from '@/platform/useSeo';
import { loadChangelogHtml } from '@/platform/content';

/**
 * Standalone /changelog page (M6.T6.2). Renders the hand-maintained
 * Markdown file at /public/content/changelog.md through the existing
 * markdown-it + DOMPurify pipeline.
 */
export function Changelog(): React.JSX.Element {
  useSeo({
    title: 'Changelog — Sveska',
    description: 'Per-milestone release notes for Sveska, the local-first notepad PWA.',
    canonical: 'https://sveska.studio/changelog',
  });
  const [html, setHtml] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void loadChangelogHtml()
      .then(setHtml)
      .catch((e: unknown) => setErr((e as Error).message));
  }, []);

  return (
    <article className="content-page prose" data-testid="changelog-page">
      {err && (
        <p className="content-error" data-testid="content-error">
          Couldn’t load the changelog ({err}).
        </p>
      )}
      <div
        className="content-body"
        data-testid="changelog-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
