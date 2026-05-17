import { useMemo, useState } from 'react';
import { useSeo } from '@/platform/useSeo';
import { GLOSSARY, groupedGlossary, type GlossaryEntry } from '@/platform/glossary';

const GROUP_LABEL: Record<GlossaryEntry['group'], string> = {
  concept: 'Concepts',
  tech: 'Tech',
  brand: 'Brand',
  milestone: 'Milestones',
};

/**
 * Standalone /glossary page (M6.T6.1). Designed as a real SEO target —
 * complete term list grouped by category, with anchor links so the
 * auto-linker on .html exports can point at a deep anchor.
 *
 * Lightweight search input filters in place (no fuzzy lib — exact
 * substring on term + summary is fine for ~20 entries).
 */
export function Glossary(): React.JSX.Element {
  const [query, setQuery] = useState('');
  useSeo({
    title: 'Glossary — Sveska',
    description:
      'Plain-language definitions for the concepts, tech, and brand vocabulary used across Sveska — local-first notepad PWA.',
    canonical: 'https://sveska.studio/glossary',
  });

  const grouped = useMemo(() => groupedGlossary(), []);
  const filter = query.trim().toLowerCase();

  function matches(e: GlossaryEntry): boolean {
    if (!filter) return true;
    const hay = `${e.term} ${e.aliases?.join(' ') ?? ''} ${e.summary}`.toLowerCase();
    return hay.includes(filter);
  }

  const totalMatches = GLOSSARY.filter(matches).length;

  return (
    <article className="glossary" data-testid="glossary-page">
      <header className="glossary-head">
        <h1>Glossary</h1>
        <p className="lead">
          {GLOSSARY.length} terms used across the Sveska notepad, canvas, and platform surface.
          Auto-linked inline from .html exports of md-mode notes.
        </p>
        <input
          type="search"
          className="search-input glossary-search"
          placeholder={`Search ${GLOSSARY.length} terms…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter glossary"
          data-testid="glossary-search"
        />
        {filter && (
          <p className="mono glossary-count" data-testid="glossary-count">
            {totalMatches} of {GLOSSARY.length} match.
          </p>
        )}
      </header>

      {(['concept', 'tech', 'brand', 'milestone'] as const).map((group) => {
        const entries = grouped[group].filter(matches);
        if (entries.length === 0) return null;
        return (
          <section key={group} className="glossary-group" data-testid={`glossary-group-${group}`}>
            <h2>{GROUP_LABEL[group]}</h2>
            <ul className="glossary-list">
              {entries.map((e) => (
                <li
                  key={e.id}
                  id={e.id}
                  className="glossary-entry"
                  data-testid={`glossary-entry-${e.id}`}
                >
                  <h3>
                    <a
                      href={`#${e.id}`}
                      className="glossary-anchor"
                      aria-label={`Anchor to ${e.term}`}
                    >
                      §
                    </a>{' '}
                    {e.term}
                    {e.aliases && e.aliases.length > 0 && (
                      <span className="glossary-aliases mono"> · {e.aliases.join(' · ')}</span>
                    )}
                  </h3>
                  <p className="glossary-summary">{e.summary}</p>
                  <p className="glossary-body">{e.body}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}
