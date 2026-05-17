import { type Note } from '@/notes/db';
import { astFromNote } from '@/markdown/ast';
import { download, exportAs, type ExportFormat } from '@/markdown/export';

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

  function exportNote(format: ExportFormat): void {
    if (!note) return;
    const live: Note = { ...note, body };
    const ast = astFromNote(live);
    const result = exportAs(ast, format);
    download(result);
  }

  return (
    <div className="export-group" role="group" aria-label="Export note">
      <span className="export-label mono">export</span>
      {FORMATS.map(({ format, label }) => (
        <button
          key={format}
          type="button"
          className="snap-btn export-btn"
          onClick={() => exportNote(format)}
          disabled={disabled}
          data-testid={`export-${format}`}
          title={`Download as .${format}`}
        >
          .{label}
        </button>
      ))}
    </div>
  );
}
