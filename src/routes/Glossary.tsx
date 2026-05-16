import { useSeo } from '@/platform/useSeo';

export function Glossary(): React.JSX.Element {
  useSeo({
    title: 'Glossary — Sveska',
    description:
      'Glossary for Sveska — terms used across the notepad, canvas, and platform surface.',
    canonical: 'https://sveska.studio/glossary',
  });
  return (
    <article>
      <h1>Glossary</h1>
      <p className="lead">
        Reserved for the glossary engine landing at M6. This route exists today so search engines
        and the auto-linker can find a stable URL.
      </p>
    </article>
  );
}
