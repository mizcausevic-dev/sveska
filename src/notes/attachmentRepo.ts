import { db, type Attachment } from './db';

/**
 * Attachment repository (screenshot paste, v2).
 *
 * Attachments are image Blobs pasted/dropped into a note. They live in the
 * `attachments` Dexie store, keyed by a UUID, and are referenced inside note
 * bodies as the synthetic URL `sveska-img:<id>`. At render/export time the
 * reference is resolved to a `data:` URI (see `blobToDataUri`) so the image
 * survives DOMPurify (which allows `data:` images but strips `blob:`).
 *
 * Local-first: blobs never leave the browser. They're part of the same
 * IndexedDB the notes live in.
 */

/** Reference prefix embedded in note bodies. Keep in sync with renderMd. */
export const ATTACHMENT_REF_PREFIX = 'sveska-img:';

/** Build the markdown image reference for a stored attachment id. */
export function attachmentRef(id: string): string {
  return `${ATTACHMENT_REF_PREFIX}${id}`;
}

/** Extract every attachment id referenced in a note body (deduped, in order). */
export function extractAttachmentIds(body: string): string[] {
  const re = /sveska-img:([A-Za-z0-9-]+)/g;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const id = m[1];
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Persist an image blob for a note. Returns the new attachment id. */
export async function putAttachment(
  noteId: string,
  blob: Blob,
  mime: string,
  name: string,
): Promise<string> {
  const id = crypto.randomUUID();
  const att: Attachment = {
    id,
    noteId,
    blob,
    mime,
    name,
    createdAt: Date.now(),
  };
  await db().attachments.put(att);
  return id;
}

export async function getAttachment(id: string): Promise<Attachment | undefined> {
  return db().attachments.get(id);
}

export async function listAttachmentsForNote(noteId: string): Promise<Attachment[]> {
  return db().attachments.where('noteId').equals(noteId).sortBy('createdAt');
}

export async function deleteAttachment(id: string): Promise<void> {
  await db().attachments.delete(id);
}

/**
 * Resolve a set of attachment ids to `data:` URIs, keyed by id. Missing ids
 * are simply omitted from the result. Used by the preview pane + export.
 */
export async function resolveAttachmentDataUris(
  ids: readonly string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  await Promise.all(
    ids.map(async (id) => {
      const att = await getAttachment(id);
      if (!att) return;
      try {
        out.set(id, await blobToDataUri(att.blob));
      } catch {
        // skip unreadable blob — ref will render as broken link text, not crash
      }
    }),
  );
  return out;
}

/**
 * Convert a Blob to a `data:<mime>;base64,…` URI. FileReader-based so it works
 * in jsdom (where Blob.arrayBuffer is flaky and there's no `Buffer`).
 */
export function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (): void => {
      resolve(typeof fr.result === 'string' ? fr.result : '');
    };
    fr.onerror = (): void => reject(fr.error ?? new Error('blob read failed'));
    fr.readAsDataURL(blob);
  });
}
