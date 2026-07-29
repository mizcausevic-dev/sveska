import { describe, expect, it } from 'vitest';
import {
  appendTask,
  parseChecklist,
  removeAt,
  serializeChecklist,
  toggleAt,
} from '../src/lib/checklist';
import { createNote, listNotes, updateNote } from '../src/storage/notesStorage';

describe('checklist parser — smoke', () => {
  it('parses and round-trips a mixed body with passthroughs', () => {
    const body = 'todos:\n- [ ] wash dishes\n- [x] pay bills\n\ndone.';
    const items = parseChecklist(body);
    expect(items).toHaveLength(5);
    expect(items[1]).toEqual({ kind: 'task', indent: '', done: false, text: 'wash dishes' });
    expect(items[2]).toEqual({ kind: 'task', indent: '', done: true, text: 'pay bills' });
    expect(serializeChecklist(items)).toBe(body);
  });

  it('toggle flips done, preserves passthroughs and indices', () => {
    const items = parseChecklist('preface\n- [ ] one\n- [ ] two');
    const toggled = toggleAt(items, 1);
    expect(serializeChecklist(toggled)).toBe('preface\n- [x] one\n- [ ] two');
  });

  it('removeAt drops the row at that index (task or passthrough)', () => {
    const items = parseChecklist('- [ ] one\n- [ ] two\n- [ ] three');
    expect(serializeChecklist(removeAt(items, 1))).toBe('- [ ] one\n- [ ] three');
  });

  it('appendTask adds a new unchecked row at the end', () => {
    const items = parseChecklist('- [ ] one');
    expect(serializeChecklist(appendTask(items, 'two'))).toBe('- [ ] one\n- [ ] two');
  });
});

describe('checklist toggle persistence via storage (DoD: check/uncheck persists)', () => {
  it('toggling and saving via updateNote survives a re-list', async () => {
    const note = await createNote('checklist');
    await updateNote(note.id, { body: '- [ ] one\n- [ ] two' });
    const [before] = await listNotes();
    const parsed = parseChecklist(before!.body);
    const next = serializeChecklist(toggleAt(parsed, 0));
    await updateNote(note.id, { body: next });
    const [after] = await listNotes();
    expect(after!.body).toBe('- [x] one\n- [ ] two');
  });
});
