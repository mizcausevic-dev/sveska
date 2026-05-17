/**
 * Structured image spec returned by the AI for M4.T4.3 Notes → Image.
 *
 * The AI returns JSON; we parse + clamp it into a known shape so the
 * renderer doesn't have to defend against garbage. Each variant has a
 * different schema:
 *   - concise  → title + subtitle + 3 bullet lines + accent color
 *   - detailed → title + subtitle + 4 sections (heading + 2-3 lines each)
 *
 * The proxy returns a stream — for image generation we accumulate the
 * full text first, then JSON.parse. If parsing fails, we fall back to
 * a best-effort spec from the note's first lines.
 */

export type ImageVariant = 'concise' | 'detailed';

export interface ConciseSpec {
  variant: 'concise';
  title: string;
  subtitle: string;
  bullets: string[];
  accent: string;
}

export interface DetailedSection {
  heading: string;
  lines: string[];
}

export interface DetailedSpec {
  variant: 'detailed';
  title: string;
  subtitle: string;
  sections: DetailedSection[];
  accent: string;
}

export type ImageSpec = ConciseSpec | DetailedSpec;

const ACCENTS = ['#f2b544', '#7ad29c', '#7ec2ff', '#e07a7a', '#b08bdc'];
const DEFAULT_ACCENT = ACCENTS[0]!;

function clampStr(s: unknown, max: number, fallback = ''): string {
  if (typeof s !== 'string') return fallback;
  return s.trim().slice(0, max);
}

function clampAccent(s: unknown): string {
  if (typeof s !== 'string') return DEFAULT_ACCENT;
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : DEFAULT_ACCENT;
}

function clampStringArray(arr: unknown, count: number, max: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => clampStr(v, max))
    .filter((s): s is string => s.length > 0)
    .slice(0, count);
}

/** Parse a JSON spec returned by the AI; falls back if malformed. */
export function parseImageSpec(
  text: string,
  variant: ImageVariant,
  fallbackTitle: string,
  fallbackBody: string,
): ImageSpec {
  const trimmed = stripCodeFence(text).trim();
  try {
    const raw = JSON.parse(trimmed) as Record<string, unknown>;
    if (variant === 'concise') {
      return {
        variant: 'concise',
        title: clampStr(raw.title, 80, fallbackTitle || 'Untitled'),
        subtitle: clampStr(raw.subtitle, 120),
        bullets: clampStringArray(raw.bullets, 3, 100),
        accent: clampAccent(raw.accent),
      };
    }
    const sections = Array.isArray(raw.sections)
      ? raw.sections
          .map((s): DetailedSection => {
            const obj = s as Record<string, unknown>;
            return {
              heading: clampStr(obj.heading, 40),
              lines: clampStringArray(obj.lines, 3, 90),
            };
          })
          .filter((s) => s.heading.length > 0)
          .slice(0, 4)
      : [];
    return {
      variant: 'detailed',
      title: clampStr(raw.title, 80, fallbackTitle || 'Untitled'),
      subtitle: clampStr(raw.subtitle, 120),
      sections,
      accent: clampAccent(raw.accent),
    };
  } catch {
    return fallbackSpec(variant, fallbackTitle, fallbackBody);
  }
}

/** Best-effort spec if the AI returned non-JSON (or no key configured). */
export function fallbackSpec(variant: ImageVariant, title: string, body: string): ImageSpec {
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const safeTitle = (title || 'Untitled').slice(0, 80);
  if (variant === 'concise') {
    return {
      variant: 'concise',
      title: safeTitle,
      subtitle: '',
      bullets: lines.slice(0, 3).map((l) => l.slice(0, 100)),
      accent: DEFAULT_ACCENT,
    };
  }
  return {
    variant: 'detailed',
    title: safeTitle,
    subtitle: '',
    sections: [
      {
        heading: 'Note',
        lines: lines.slice(0, 6).map((l) => l.slice(0, 90)),
      },
    ],
    accent: DEFAULT_ACCENT,
  };
}

function stripCodeFence(s: string): string {
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(s.trim());
  return fenced ? (fenced[1] ?? '') : s;
}

/** The system prompt the AI sees for each variant. */
export function specPromptFor(variant: ImageVariant): string {
  if (variant === 'concise') {
    return [
      'You are an image-spec generator. Given a note, return ONLY a JSON object with this shape:',
      '{ "title": string (≤80 chars), "subtitle": string (≤120 chars), "bullets": [string × 3] (each ≤100 chars), "accent": hex color "#rrggbb" }',
      "Pick an accent that fits the note's mood. No prose, no code fence — JSON only.",
    ].join('\n');
  }
  return [
    'You are an image-spec generator. Given a note, return ONLY a JSON object with this shape:',
    '{ "title": string (≤80 chars), "subtitle": string (≤120 chars),',
    '  "sections": [ { "heading": string (≤40 chars), "lines": [string × 3] (each ≤90 chars) } × 4 ],',
    '  "accent": hex color "#rrggbb" }',
    "Pick an accent that fits the note's mood. No prose, no code fence — JSON only.",
  ].join('\n');
}
