/**
 * Share-via-URL hash (M3.T3.7).
 *
 * Encodes a note's title + body + mode into the URL fragment so the
 * receiver can preview it locally without any server roundtrip — the
 * fragment never leaves the browser. The encoder is base64url over
 * UTF-8 JSON to keep the URL short and copy-friendly.
 *
 * Format: `#note=<base64url(json)>`
 * Payload: `{ t: title, b: body, m: mode }` (short keys to save bytes).
 *
 * NOTE: hash-shared notes are plaintext in the link — the recipient
 * sees them, the sender's browser history holds them. The Copy command
 * warns about this in the UI; this helper has no opinion.
 */

export interface SharedNote {
  title: string;
  body: string;
  mode: 'text' | 'md' | 'checklist';
}

export function packShareHash(note: SharedNote): string {
  const json = JSON.stringify({ t: note.title, b: note.body, m: note.mode });
  return '#note=' + bytesToBase64Url(new TextEncoder().encode(json));
}

export function parseShareHash(hash: string): SharedNote | null {
  if (!hash.startsWith('#note=')) return null;
  try {
    const b64 = hash.slice('#note='.length);
    const json = new TextDecoder('utf-8').decode(base64UrlToBytes(b64));
    const obj = JSON.parse(json) as { t?: unknown; b?: unknown; m?: unknown };
    const t = typeof obj.t === 'string' ? obj.t : '';
    const b = typeof obj.b === 'string' ? obj.b : '';
    const m: SharedNote['mode'] =
      obj.m === 'text' || obj.m === 'md' || obj.m === 'checklist' ? obj.m : 'text';
    return { title: t, body: b, mode: m };
  } catch {
    return null;
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
