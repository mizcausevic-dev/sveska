import { useSeo } from '@/platform/useSeo';

export function Home(): React.JSX.Element {
  useSeo({
    title: 'Sveska — local-first notepad',
    description:
      'A studio-grade, offline-first notepad. Notes, Markdown, canvas — all local. No account required.',
    canonical: 'https://sveska.studio/',
  });
  return (
    <article>
      <h1>
        Prazna sveska. <span className="amb">Najbolji početak.</span>
      </h1>
      <p className="lead">
        Sveska is a studio-grade, local-first, offline-first notepad. Your notes live in your
        browser&rsquo;s storage — no account, no telemetry, no sync until you ask for it.
      </p>
      <p className="lead">
        M0 is the scaffold. The editor lands at M1. Press <span className="kbd">Ctrl</span>{' '}
        <span className="kbd">,</span> to open preferences and try the theme switch.
      </p>
    </article>
  );
}
