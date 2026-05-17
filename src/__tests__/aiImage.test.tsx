import { describe, expect, it } from 'vitest';
import {
  fallbackSpec,
  parseImageSpec,
  specPromptFor,
  type ConciseSpec,
  type DetailedSpec,
} from '@/ai/imageSpec';

describe('M4.T4.3 — parseImageSpec', () => {
  it('parses a valid concise JSON spec', () => {
    const json = JSON.stringify({
      title: 'My Note',
      subtitle: 'A line of context',
      bullets: ['one', 'two', 'three'],
      accent: '#7ad29c',
    });
    const spec = parseImageSpec(json, 'concise', 'fallback', 'body') as ConciseSpec;
    expect(spec.variant).toBe('concise');
    expect(spec.title).toBe('My Note');
    expect(spec.bullets).toEqual(['one', 'two', 'three']);
    expect(spec.accent).toBe('#7ad29c');
  });

  it('strips a fenced JSON block', () => {
    const fenced =
      '```json\n{ "title": "X", "subtitle": "", "bullets": ["a"], "accent": "#f2b544" }\n```';
    const spec = parseImageSpec(fenced, 'concise', 'fallback', 'body') as ConciseSpec;
    expect(spec.title).toBe('X');
    expect(spec.bullets).toEqual(['a']);
  });

  it('clamps invalid accent to default', () => {
    const json = JSON.stringify({
      title: 'T',
      subtitle: '',
      bullets: [],
      accent: 'not-a-hex',
    });
    const spec = parseImageSpec(json, 'concise', 'fallback', 'body') as ConciseSpec;
    expect(spec.accent).toBe('#f2b544');
  });

  it('parses a valid detailed JSON spec with 2 sections', () => {
    const json = JSON.stringify({
      title: 'D',
      subtitle: 'sub',
      sections: [
        { heading: 'A', lines: ['l1', 'l2'] },
        { heading: 'B', lines: ['l3'] },
      ],
      accent: '#7ec2ff',
    });
    const spec = parseImageSpec(json, 'detailed', 'fallback', 'body') as DetailedSpec;
    expect(spec.variant).toBe('detailed');
    expect(spec.sections.length).toBe(2);
    expect(spec.sections[0]?.heading).toBe('A');
  });

  it('falls back when the JSON is malformed', () => {
    const spec = parseImageSpec('not json at all', 'concise', 'My Title', 'a\nb\nc') as ConciseSpec;
    expect(spec.title).toBe('My Title');
    expect(spec.bullets).toEqual(['a', 'b', 'c']);
  });
});

describe('M4.T4.3 — fallbackSpec', () => {
  it('uses the first non-blank lines of the body as bullets', () => {
    const spec = fallbackSpec(
      'concise',
      'Untitled',
      '\n\nfirst\nsecond\n\nthird\nfourth\n',
    ) as ConciseSpec;
    expect(spec.bullets).toEqual(['first', 'second', 'third']);
  });

  it('falls back to "Untitled" when title is empty', () => {
    const spec = fallbackSpec('concise', '', 'body') as ConciseSpec;
    expect(spec.title).toBe('Untitled');
  });
});

describe('M4.T4.3 — specPromptFor', () => {
  it('asks the AI for JSON-only output for both variants', () => {
    expect(specPromptFor('concise')).toContain('JSON');
    expect(specPromptFor('concise')).toContain('bullets');
    expect(specPromptFor('detailed')).toContain('sections');
  });
});
