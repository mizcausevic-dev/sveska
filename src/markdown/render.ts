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
 * Resolver for pasted-image references. Given an attachment id, returns a
 * `data:` URI (or undefined if not yet loaded / missing). See attachmentRepo.
 */
export type ImageResolver = (id: string) => string | undefined;

const IMG_REF_RE = /sveska-img:([A-Za-z0-9-]+)/g;

/**
 * Parse a markdown body into sanitized HTML. Safe for `dangerouslySetInnerHTML`.
 * Returns an empty string for empty / whitespace-only input.
 *
 * `resolveImg` (optional) swaps `sveska-img:<id>` references in the markdown
 * SOURCE for resolved `data:` URIs BEFORE markdown-it runs. This ordering is
 * deliberate: DOMPurify allows `data:` images by default but strips unknown
 * schemes like `sveska-img:` (and `blob:`), so the src must already be a
 * data: URI by the time the sanitizer sees the generated <img>. Unresolved
 * refs are left as-is and render as plain text (no broken image, no crash).
 */
export function renderMd(body: string, resolveImg?: ImageResolver): string {
  if (!body || !body.trim()) return '';
  const source = resolveImg
    ? body.replace(IMG_REF_RE, (match, id: string) => resolveImg(id) ?? match)
    : body;
  const raw = md.render(source);
  // ADD_ATTR: target+rel for links so we can pop external URLs in a new tab
  // without losing the noopener guard.
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'iframe', 'form', 'input', 'button'],
  });
}
