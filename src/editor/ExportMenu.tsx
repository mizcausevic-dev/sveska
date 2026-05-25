import { type Note } from '@/notes/db';
import { astFromNote } from '@/markdown/ast';
import { download, exportAs, type ExportFormat } from '@/markdown/export';
import { extractAttachmentIds, resolveAttachmentDataUris } from '@/notes/attachmentRepo';

interface Props {
  /** The currently-loaded note. Null while hydrating; export is disabled then. */
  note: Note | null;
  /**
   * Live body from the textarea (may differ from note.body before the next
   * autosave flush). Export uses this so the user always gets the current view.
   */
  body: string;
}

const FORMATS: { format: ExportFormat; label: string; ext: string }[] = [
  { format: 'txt', label: 'txt', ext: '.txt' },
  { format: 'md', label: 'md', ext: '.md' },
  { format: 'html', label: 'html', ext: '.html' },
];

export function ExportMenu({ note, body }: Props): React.JSX.Element {
  const disabled = note === null;

  async function exportNote(format: ExportFormat): Promise<void> {
    if (!note) return;
    const live: Note = { ...note, body };
    const ast = astFromNote(live);
    // For self-contained HTML of md notes, inline pasted screenshots as
    // data: URIs. txt/md keep the raw `sveska-img:` ref so re-import works.
    let resolveImg: ((id: string) => string | undefined) | undefined;
    if (format === 'html' && note.mode === 'md') {
      const ids = extractAttachmentIds(body);
      if (ids.length > 0) {
        const map = await resolveAttachmentDataUris(ids);
        resolveImg = (id) => map.get(id);
      }
    }
    const result = exportAs(ast, format, resolveImg);
    download(result);
  }

  async function exportPdf(): Promise<void> {
    if (!note) return;
    const live: Note = { ...note, body };
    const ast = astFromNote(live);
    // Lazy import — jsPDF is ~50KB gzip; only pay when the user clicks.
    const { exportNoteAsPdf } = await import('@/lib/exportPdf');
    await exportNoteAsPdf(ast);
  }

  return (
    <div className="export-group" role="group" aria-label="Export note">
      <span className="export-label mono">export</span>
      {FORMATS.map(({ format, label }) => (
        <button
          key={format}
          type="button"
          className="snap-btn export-btn"
          onClick={() => void exportNote(format)}
          disabled={disabled}
          data-testid={`export-${format}`}
          title={`Download as .${format}`}
        >
          .{label}
        </button>
      ))}
      <button
        type="button"
        className="snap-btn export-btn"
        onClick={() => void exportPdf()}
        disabled={disabled}
        data-testid="export-pdf"
        title="Download as .pdf (lazy-loaded)"
      >
        .pdf
      </button>
    </div>
  );
}
