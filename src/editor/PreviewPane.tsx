import { useEffect, useMemo, useRef, useState } from 'react';
import { renderMd } from '@/markdown/render';
import { extractAttachmentIds, resolveAttachmentDataUris } from '@/notes/attachmentRepo';

interface Props {
  body: string;
}

/**
 * Read-only Markdown preview (M3.T3.2 · image paste v2).
 *
 * The HTML is sanitized inside `renderMd` so `dangerouslySetInnerHTML` is
 * safe here.
 *
 * Pasted-image refs (`sveska-img:<id>`) are resolved async: on body change we
 * load any not-yet-cached attachment ids from Dexie, convert them to `data:`
 * URIs, and re-render with a resolver. `data:` (not `blob:`) is deliberate —
 * DOMPurify keeps data: images but strips blob:. Resolved URIs are cached by
 * id in a ref so re-renders don't re-read IndexedDB; data: strings need no
 * revoke (unlike object URLs), so the lifecycle is leak-free.
 */
export function PreviewPane({ body }: Props): React.JSX.Element {
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [imgMap, setImgMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const ids = extractAttachmentIds(body);
    const missing = ids.filter((id) => !cacheRef.current.has(id));
    if (missing.length === 0) return;
    let cancelled = false;
    void (async () => {
      const resolved = await resolveAttachmentDataUris(missing);
      if (cancelled || resolved.size === 0) return;
      for (const [k, v] of resolved) cacheRef.current.set(k, v);
      setImgMap(new Map(cacheRef.current));
    })();
    return () => {
      cancelled = true;
    };
  }, [body]);

  const html = useMemo(() => renderMd(body, (id) => imgMap.get(id)), [body, imgMap]);

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
