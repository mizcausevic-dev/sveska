import { useMemo } from 'react';
import { renderMd } from '@/markdown/render';

interface Props {
  body: string;
}

/**
 * Read-only Markdown preview (M3.T3.2). Rendered to the right of the
 * textarea when the active note is in `md` mode. The HTML is sanitized
 * inside `renderMd` so `dangerouslySetInnerHTML` is safe here.
 *
 * Heavy bodies could be a perf concern; markdown-it parses ~50k chars in
 * a couple of ms in jsdom benchmarks, which fits inside the 16ms frame
 * budget at typewriter speed. If a future profile shows it dominates, the
 * fix is to debounce the body prop in the parent — not change this surface.
 */
export function PreviewPane({ body }: Props): React.JSX.Element {
  const html = useMemo(() => renderMd(body), [body]);
  return (
    <div
      className="md-preview prose"
      aria-live="polite"
      data-testid="md-preview"
      dangerouslySetInnerHTML={{
        __html: html || '<p class="md-preview-empty">Nothing to preview yet.</p>',
      }}
    />
  );
}
