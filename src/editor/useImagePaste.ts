import { useCallback } from 'react';
import { type Note } from '@/notes/db';
import { attachmentRef, putAttachment } from '@/notes/attachmentRepo';

/**
 * Screenshot/image paste + drag-drop for the editor textarea (v2).
 *
 * On paste or drop of an image, the blob is persisted via `putAttachment`
 * and a markdown image reference `![screenshot](sveska-img:<id>)` is inserted
 * at the caret on its own line. If the note isn't already in `md` mode, the
 * caller is asked to switch it (via `onInsert`'s `switchToMd`) so the image
 * actually renders in the preview instead of sitting as literal ref text.
 *
 * Local-first: the image never leaves the browser; it's a Blob in IndexedDB.
 */
interface UseImagePasteOpts {
  noteId: string | null;
  mode: Note['mode'] | undefined;
  onInsert: (next: { body: string; cursor: number; switchToMd: boolean }) => void;
}

interface ImagePasteHandlers {
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onDrop: (e: React.DragEvent<HTMLTextAreaElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLTextAreaElement>) => void;
}

export function useImagePaste({ noteId, mode, onInsert }: UseImagePasteOpts): ImagePasteHandlers {
  const handleImage = useCallback(
    async (textarea: HTMLTextAreaElement, file: File): Promise<void> => {
      if (!noteId) return;
      const mime = file.type || 'image/png';
      const name = file.name || `screenshot-${Date.now()}.png`;
      const id = await putAttachment(noteId, file, mime, name);
      const ref = `![screenshot](${attachmentRef(id)})`;

      const { selectionStart, selectionEnd, value } = textarea;
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);
      // Put the image on its own line so markdown renders it as a block.
      const lead = before && !before.endsWith('\n') ? '\n' : '';
      const trail = after && !after.startsWith('\n') ? '\n' : '';
      const insertion = `${lead}${ref}${trail}`;
      const nextBody = before + insertion + after;
      const cursor = (before + insertion).length;

      onInsert({ body: nextBody, cursor, switchToMd: mode !== 'md' });
    },
    [noteId, mode, onInsert],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const fileItem = Array.from(items).find(
        (it) => it.kind === 'file' && it.type.startsWith('image/'),
      );
      if (!fileItem) return; // let normal text paste through
      const file = fileItem.getAsFile();
      if (!file) return;
      e.preventDefault();
      void handleImage(e.currentTarget, file);
    },
    [handleImage],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>): void => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      const image = Array.from(files).find((f) => f.type.startsWith('image/'));
      if (!image) return; // .txt/.md drops are handled by the rail importer
      e.preventDefault();
      void handleImage(e.currentTarget, image);
    },
    [handleImage],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>): void => {
    // Only claim the drop if it carries files; otherwise let text selection drag work.
    const hasFiles = Array.from(e.dataTransfer?.items ?? []).some((it) => it.kind === 'file');
    if (hasFiles) e.preventDefault();
  }, []);

  return { onPaste, onDrop, onDragOver };
}
