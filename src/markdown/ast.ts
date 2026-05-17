import { type Note } from '@/notes/db';

/**
 * Single source-of-truth representation that the export module consumes. Future
 * formats (PDF at M3.7, MDX blog export at M6.2) should all derive from this so
 * the on-screen output stays consistent across destinations.
 *
 * M1.T1.3: only `text` mode is implemented. M3.2 adds Markdown — at that point
 * the AST grows block children (heading / paragraph / list / code) rather than
 * a single `body` string. Until then `body` is the raw textarea content.
 */
export interface NoteAST {
  title: string;
  body: string;
  mode: Note['mode'];
  exportedAt: number;
  updatedAt: number;
}

export function astFromNote(note: Note): NoteAST {
  return {
    title: note.title.trim(),
    body: note.body,
    mode: note.mode,
    exportedAt: Date.now(),
    updatedAt: note.updatedAt,
  };
}
