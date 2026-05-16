import { Link } from 'react-router-dom';
import { useSeo } from '@/platform/useSeo';

export function NotFound(): React.JSX.Element {
  useSeo({
    title: '404 — Sveska',
    description: 'Page not found.',
    canonical: 'https://sveska.studio/',
    robots: 'noindex',
  });
  return (
    <article>
      <h1>404</h1>
      <p className="lead">
        Nothing on this page. <Link to="/">Back to the notebook.</Link>
      </p>
    </article>
  );
}
