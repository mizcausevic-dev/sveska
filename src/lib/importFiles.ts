import { createNote } from '@/notes/noteRepo';
import { type Note } from '@/notes/db';

/**
 * Import .txt / .md files as fresh notes (M3.T3.7).
 *
 * Accepts a FileList (file picker or drag-drop) and returns the notes
 * that were created so the caller can pop the first one open in a tab.
 * Unknown extensions are skipped silently — drag-dropping a PDF onto
 * the rail shouldn't crash anything; the visual no-op is the signal.
 */

const ACCEPTED_EXT = /\.(txt|md|markdown)$/i;

export interface ImportResult {
  notes: Note[];
  skipped: string[];
}

export async function importFiles(files: FileList | File[]): Promise<ImportResult> {
  const list = Array.from(files);
  const created: Note[] = [];
  const skipped: string[] = [];
  for (const file of list) {
    if (!ACCEPTED_EXT.test(file.name)) {
      skipped.push(file.name);
      continue;
    }
    const text = await readFileText(file);
    const isMd = /\.md$/i.test(file.name) || /\.markdown$/i.test(file.name);
    const title = file.name.replace(ACCEPTED_EXT, '');
    const note = await createNote({
      title,
      body: text,
      mode: isMd ? 'md' : 'text',
    });
    created.push(note);
  }
  return { notes: created, skipped };
}

/** Read a File as UTF-8 text — wraps both the browser `File.text()` (when
 *  available) and the FileReader fallback (jsdom lacks `.text()`). */
function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (): void => resolve(typeof fr.result === 'string' ? fr.result : '');
    fr.onerror = (): void => reject(fr.error ?? new Error('read failed'));
    fr.readAsText(file, 'utf-8');
  });
}
