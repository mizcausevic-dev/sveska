import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

/**
 * Markdown → sanitized HTML pipeline (M3.T3.2).
 *
 * `markdown-it` parses the body; DOMPurify sanitizes the resulting HTML so
 * a malicious note body can't smuggle <script> or `onerror=` past us. Both
 * libraries are conservative defaults: GitHub-flavored autolink + tables are
 * on, but raw HTML is rejected (`html: false`) so authors can't bypass the
 * sanitizer by writing literal `<script>` in markdown.
 *
 * Singleton parser — `MarkdownIt` is heavy to construct and ~zero cost to
 * reuse. Tests do not import this module directly; they exercise `renderMd`.
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
});

/**
 * Parse a markdown body into sanitized HTML. Safe for `dangerouslySetInnerHTML`.
 * Returns an empty string for empty / whitespace-only input.
 */
export function renderMd(body: string): string {
  if (!body || !body.trim()) return '';
  const raw = md.render(body);
  // ADD_ATTR: target+rel for links so we can pop external URLs in a new tab
  // without losing the noopener guard.
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'iframe', 'form', 'input', 'button'],
  });
}
