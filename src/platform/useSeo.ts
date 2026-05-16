import { useEffect } from 'react';

interface Seo {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
}

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) {
    const tag = selector.startsWith('link') ? 'link' : 'meta';
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/** Tiny per-route SEO hook. Keeps M0 from needing react-helmet or vike. */
export function useSeo(seo: Seo): void {
  useEffect(() => {
    document.title = seo.title;
    upsertMeta('meta[name="description"]', { name: 'description', content: seo.description });
    upsertMeta('link[rel="canonical"]', { rel: 'canonical', href: seo.canonical });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: seo.description,
    });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: seo.canonical });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seo.title });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: seo.description,
    });
    if (seo.robots) {
      upsertMeta('meta[name="robots"]', { name: 'robots', content: seo.robots });
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove();
    }
  }, [seo.title, seo.description, seo.canonical, seo.robots]);
}
