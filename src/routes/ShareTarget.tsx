import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSeo } from '@/platform/useSeo';
import { addInboxItem } from '@/notes/inboxRepo';

/**
 * Web Share Target capture (M3.T3.7). The manifest declares this URL as the
 * POST action; the SPA serves index.html for the POST, the page re-loads
 * with the query params, and we drop the share into the inbox.
 *
 * Supported params: `title`, `text`, `url` — concatenated newline-separated.
 * Any non-empty share becomes a single inbox row, marked unprocessed so the
 * rail badge reflects it on next visit to the editor.
 */
export function ShareTarget(): React.JSX.Element {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'captured' | 'empty'>('pending');
  useSeo({
    title: 'Shared to Sveska',
    description: 'A captured share-target payload.',
    canonical: 'https://sveska.studio/share-target',
    robots: 'noindex',
  });

  useEffect(() => {
    const parts = [
      params.get('title')?.trim(),
      params.get('text')?.trim(),
      params.get('url')?.trim(),
    ].filter((p): p is string => Boolean(p));
    if (parts.length === 0) {
      setStatus('empty');
      return;
    }
    void addInboxItem(parts.join('\n')).then(() => setStatus('captured'));
  }, [params]);

  return (
    <article>
      <h1>
        {status === 'captured' ? 'Captured' : status === 'empty' ? 'Nothing shared' : 'Capturing…'}
      </h1>
      <p className="lead">
        {status === 'captured' && (
          <>
            Saved to your inbox. <Link to="/">Open editor →</Link>
          </>
        )}
        {status === 'empty' && 'The share carried no title, text, or URL.'}
        {status === 'pending' && 'Writing to inbox…'}
      </p>
    </article>
  );
}
