import { useSearchParams } from 'react-router-dom';
import { useSeo } from '@/platform/useSeo';

/**
 * M0 stub for Web Share Target. The manifest declares this URL as the POST action.
 * On a static host with SPA fallback (netlify.toml) the POST returns 200 + index.html;
 * Vite's dev middleware does the same. The actual capture-to-inbox handler lands at M3.7.
 */
export function ShareTarget(): React.JSX.Element {
  const [params] = useSearchParams();
  useSeo({
    title: 'Shared to Sveska',
    description: 'A captured share-target payload.',
    canonical: 'https://sveska.studio/share-target',
    robots: 'noindex',
  });
  return (
    <article>
      <h1>Captured</h1>
      <p className="lead">
        Sveska received a share. Full inbox processing arrives at M3.7. URL parameters:{' '}
        <code className="mono">{params.toString() || '(none)'}</code>
      </p>
    </article>
  );
}
