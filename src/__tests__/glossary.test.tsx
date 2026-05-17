import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Glossary } from '@/routes/Glossary';
import { GLOSSARY, autoLinkGlossary, groupedGlossary, slugify } from '@/platform/glossary';

describe('M6.T6.1 — glossary data shape', () => {
  it('every entry has unique id + non-empty term/summary/body/group', () => {
    const ids = new Set<string>();
    for (const e of GLOSSARY) {
      expect(e.id).toMatch(/^[a-z0-9-]+$/);
      expect(ids.has(e.id)).toBe(false);
      ids.add(e.id);
      expect(e.term.length).toBeGreaterThan(0);
      expect(e.summary.length).toBeGreaterThan(10);
      expect(e.body.length).toBeGreaterThan(20);
      expect(['concept', 'tech', 'brand', 'milestone']).toContain(e.group);
    }
  });

  it('groupedGlossary sorts each group alphabetically by term', () => {
    const g = groupedGlossary();
    for (const k of Object.keys(g) as Array<keyof typeof g>) {
      const terms = g[k].map((e) => e.term);
      const sorted = [...terms].sort((a, b) => a.localeCompare(b));
      expect(terms).toEqual(sorted);
    }
  });

  it('slugify produces stable kebab-case ids', () => {
    expect(slugify('Local-first')).toBe('local-first');
    expect(slugify('Web Share Target')).toBe('web-share-target');
    expect(slugify('  IO!! Stuff??  ')).toBe('io-stuff');
  });
});

describe('M6.T6.1 — autoLinkGlossary', () => {
  it('wraps the first occurrence of a known term with a glossary link', () => {
    const html = '<p>I love PWA tooling.</p>';
    const out = autoLinkGlossary(html);
    expect(out).toContain('glossary-link');
    expect(out).toContain('href="https://sveska.studio/glossary#pwa"');
  });

  it('only links the first occurrence per term', () => {
    const html = '<p>PWA. PWA. PWA.</p>';
    const out = autoLinkGlossary(html);
    expect((out.match(/glossary-link/g) ?? []).length).toBe(1);
  });

  it('skips matches inside <code> and <a>', () => {
    const html = '<p>Try <code>PWA</code> or <a href="#x">PWA</a> here.</p>';
    const out = autoLinkGlossary(html);
    // Both are protected; should NOT add a glossary link.
    expect(out).not.toContain('glossary-link');
  });

  it('respects word boundaries (no mid-word matches)', () => {
    // "Anthropic" should not match inside "anthropics" (would be a different word).
    const html = '<p>The word anthropics is plural.</p>';
    const out = autoLinkGlossary(html);
    expect(out).not.toContain('glossary-link');
  });

  it('matches case-insensitively but preserves the original casing', () => {
    const html = '<p>dexie is great.</p>';
    const out = autoLinkGlossary(html);
    expect(out).toContain('>dexie<');
    expect(out).toContain('glossary-link');
  });

  it('aliases route to the same canonical id', () => {
    const html = '<p>Progressive Web App tech is widespread.</p>';
    const out = autoLinkGlossary(html);
    expect(out).toContain('#pwa');
  });

  it('returns the input unchanged when no terms match', () => {
    const html = '<p>nothing of interest here.</p>';
    expect(autoLinkGlossary(html)).toBe(html.replace(/^<p>|<\/p>$/g, (s) => s));
    // Identity-ish — at minimum no glossary-link class added.
    expect(autoLinkGlossary(html)).not.toContain('glossary-link');
  });
});

describe('M6.T6.1 — /glossary page', () => {
  function renderPage(): void {
    render(
      <MemoryRouter initialEntries={['/glossary']}>
        <Glossary />
      </MemoryRouter>,
    );
  }

  it('renders every glossary term in some group section', () => {
    renderPage();
    for (const e of GLOSSARY) {
      expect(screen.getByTestId(`glossary-entry-${e.id}`)).toBeInTheDocument();
    }
  });

  it('search filters entries in place', async () => {
    renderPage();
    await userEvent.type(screen.getByTestId('glossary-search'), 'excalidraw');
    await waitFor(() => {
      expect(screen.getByTestId('glossary-count').textContent).toMatch(/of \d+ match/);
      expect(screen.getByTestId('glossary-entry-excalidraw')).toBeInTheDocument();
      expect(screen.queryByTestId('glossary-entry-pwa')).not.toBeInTheDocument();
    });
  });

  it('every entry exposes a stable anchor (li id == entry.id)', () => {
    renderPage();
    for (const e of GLOSSARY) {
      const el = document.getElementById(e.id);
      expect(el).not.toBeNull();
    }
  });
});
