import { type NoteAST } from '@/markdown/ast';

/**
 * Lazy PDF export (M3.T3.7). jsPDF is ~50 KB gzip and only loads on
 * first .pdf-export click — keeps the main bundle lean for the
 * 95%+ of users who never export.
 *
 * Renders the note title as a header band + the body as wrapped text,
 * paginated at A4 margins. Markdown isn't rendered yet — that lands
 * with a typeset pass once we vendor a PDF-ready Markdown engine; until
 * then md / checklist notes export as plain text (which still reads).
 */

export async function exportNoteAsPdf(ast: NoteAST): Promise<void> {
  // Dynamic import — split into its own chunk so it's not in the main bundle.
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const textWidth = pageWidth - margin * 2;

  // Header band
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const title = ast.title || 'Untitled';
  doc.text(title, margin, margin);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  const stamp = new Date(ast.exportedAt).toISOString();
  doc.text(`Sveska · sveska.studio · exported ${stamp}`, margin, margin + 16);
  doc.setTextColor(0);

  doc.setLineWidth(0.5);
  doc.line(margin, margin + 24, pageWidth - margin, margin + 24);

  // Body
  doc.setFontSize(11);
  doc.setFont('courier', 'normal');
  const lineHeight = 14;
  const bodyTop = margin + 44;
  let y = bodyTop;
  const lines = doc.splitTextToSize(ast.body || ' ', textWidth) as string[];
  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  const slug = slugify(title);
  doc.save(`${slug || 'sveska-note'}.pdf`);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
