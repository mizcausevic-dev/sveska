import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { type Note } from '@/notes/db';
import {
  migrateLegacyLocalStorage,
  listNotes,
  getNoteById,
  saveNoteBody,
  setNoteMode,
} from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { useAutosave, type SaveState } from './useAutosave';
import { useSnapshots } from './useSnapshots';
import { SnapshotToolbar } from './SnapshotToolbar';
import { StatsModalHost } from './StatsModal';
import { openStats } from './statsModalStore';
import { FONT_FAMILY_CSS, useEditorPrefs } from '@/notes/editorPrefs';
import { useEditorCommands } from './editorCommands';
import { astFromNote } from '@/markdown/ast';
import { download, exportAs } from '@/markdown/export';
import { ClearConfirmHost } from './ClearConfirm';
import { confirmClear } from './clearConfirmStore';
import { TabBar } from './TabBar';
import { TagsBar } from './TagsBar';
import { VersionsModalHost } from './VersionsModal';
import { DraftRecoveryBanner } from './DraftRecoveryBanner';
import { useDraftRecovery } from './draftRecoveryStore';
import { readDraft } from '@/notes/draftRepo';
import { SlashCommands } from './SlashCommands';
import { ExportMenu } from './ExportMenu';
import { ChecklistPane } from './ChecklistPane';
import { useSnippetExpand } from './useSnippetExpand';
import { useImagePaste } from './useImagePaste';
import { useTypewriterScroll } from './useTypewriterScroll';
import { useTypingSounds } from './useTypingSounds';
import {
  countWords,
  formatTimer,
  startWritingTimerTick,
  stopWritingTimerTick,
  useWritingTimer,
} from './writingTimerStore';
import { FindReplaceBar } from './FindReplace';
import { AIResultPane } from '@/ai/AIResultPane';
import { ExcalidrawCanvas } from '@/canvas/ExcalidrawCanvas';
import { useCanvasView } from '@/canvas/canvasViewStore';
import { TableModalHost } from './TableModal';
import { openTableModal } from './tableModalStore';
import { insertMarkdownTable } from './markdownTable';

// Lazy — CodeMirror 6 is ~50 KB gzip; only loads when the user opts into the
// rich editor (default off), so the initial textarea bundle is untouched.
const LazyRichEditor = lazy(() => import('./RichEditor').then((m) => ({ default: m.RichEditor })));

// Lazy — PreviewPane pulls markdown-it + DOMPurify. It only renders in md
// mode with preview on, so deferring it trims the initial bundle with no UX
// cost (the textarea path never loads it).
const PreviewPane = lazy(() => import('./PreviewPane').then((m) => ({ default: m.PreviewPane })));

const PLACEHOLDER = 'Prazna sveska. Najbolji početak.';

const STATE_LABEL: Record<SaveState, string> = {
  idle: 'idle',
  pending: 'pending',
  saving: 'saving',
  saved: 'saved',
  error: 'save failed',
};

type MarkdownView = 'edit' | 'split' | 'preview';

export function Editor(): React.JSX.Element {
  const activeNote = useTabs((s) => s.activeNote);
  const ready = useTabs((s) => s.ready);
  const tabs = useTabs((s) => s.tabs);
  const activeTabId = useTabs((s) => s.activeTabId);
  const refreshActiveNote = useTabs((s) => s.refreshActiveNote);

  const [body, setBody] = useState('');
  const [notesById, setNotesById] = useState<Record<string, Note>>({});
  const [selectionStart, setSelectionStart] = useState(0);
  const [markdownView, setMarkdownView] = useState<MarkdownView>('split');
  const canvasOpen = useCanvasView((s) => s.open);
  const closeCanvas = useCanvasView((s) => s.set);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteId = activeNote?.id ?? null;
  const hydrated = ready && activeNote !== null;

  // Run the legacy localStorage migration once at mount (no-op if already done).
  useEffect(() => {
    void (async () => {
      try {
        await migrateLegacyLocalStorage();
      } catch (err) {
        console.warn('[sveska] legacy localStorage migration skipped:', err);
      }
    })();
  }, []);

  // When the active note ID changes (tab switch / new note / restore), reset
  // the textarea body to that note's persisted body. Watching only the id
  // is intentional — using `activeNote` would re-stomp the body on every
  // refetch (e.g. after rename/save), discarding live edits.
  useEffect(() => {
    if (activeNote) setBody(activeNote.body);
    // T5.1 — close canvas view when switching notes so the canvas-per-note
    // pane doesn't carry over to a different active note.
    closeCanvas(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id]);

  // Crash-safe draft recovery (T2.3). When a note becomes active, look for a
  // shadow whose savedAt is newer than the note's updatedAt — that means the
  // last keystrokes never made it into the debounced save. Surface a banner;
  // the user decides Keep or Discard. We don't auto-restore — the body change
  // would also trigger autosave, defeating the choice.
  useEffect(() => {
    if (!activeNote) return;
    void (async () => {
      const shadow = await readDraft(activeNote.id);
      if (!shadow) return;
      if (shadow.body === activeNote.body) return; // no divergence to recover
      if (shadow.savedAt <= activeNote.updatedAt) return; // shadow is stale
      useDraftRecovery.getState().set({
        noteId: activeNote.id,
        draftBody: shadow.body,
        noteBody: activeNote.body,
        savedAt: shadow.savedAt,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id]);

  // Whenever the tab strip changes, refresh the title lookup so tab chips
  // show the latest titles after a rename / hydration / new note.
  useEffect(() => {
    void (async () => {
      const all = await listNotes();
      const map: Record<string, Note> = {};
      for (const n of all) map[n.id] = n;
      setNotesById(map);
    })();
  }, [tabs.length, activeTabId, activeNote?.title]);

  const { state, lastSavedAt } = useAutosave({ noteId, body });
  const snapshots = useSnapshots({ noteId, body });
  const prefs = useEditorPrefs();

  // Register T1.7 commands with closures over the LATEST note + body.
  useEffect(() => {
    const reg = useEditorCommands.getState().register;
    const unreg = useEditorCommands.getState().unregister;
    reg('export.txt', () => {
      if (!activeNote) return;
      const ast = astFromNote({ ...activeNote, body });
      void exportAs(ast, 'txt').then(download);
    });
    reg('copy.body', () => {
      if (!navigator.clipboard) return;
      void navigator.clipboard.writeText(body);
    });
    reg('clear.body.request', () => {
      if (!activeNote) return;
      void confirmClear().then((ok) => {
        if (!ok) return;
        setBody('');
        void saveNoteBody(activeNote.id, '').then(() => refreshActiveNote());
      });
    });
    return () => {
      unreg('export.txt');
      unreg('copy.body');
      unreg('clear.body.request');
    };
  }, [activeNote, body, refreshActiveNote]);

  // Refresh notesById after autosave so the tab dirty dot turns off.
  // Same id-only dep reasoning as above.
  useEffect(() => {
    if (state !== 'saved' || !activeNote) return;
    void (async () => {
      const fresh = await getNoteById(activeNote.id);
      if (fresh) {
        setNotesById((prev) => ({ ...prev, [fresh.id]: fresh }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, activeNote?.id]);

  // T3.6 — writing timer tick lifecycle (start once at mount, stop on unmount).
  useEffect(() => {
    startWritingTimerTick();
    return () => stopWritingTimerTick();
  }, []);

  // T3.5 — typewriter mode: keep caret line centered in the textarea.
  useTypewriterScroll({
    textareaRef,
    body,
    selectionStart,
    enabled: prefs.typewriter,
  });

  // T3.5 — typing sounds: short WebAudio synth click per keystroke.
  useTypingSounds({
    textareaRef,
    enabled: prefs.sounds,
    volume: prefs.soundVolume,
  });

  // T3.4 — snippet expansion: when the text immediately before the caret
  // matches a saved trigger, replace it with the snippet body in place.
  useSnippetExpand({
    body,
    selectionStart,
    onExpand: (nextBody, nextCursor) => {
      setBody(nextBody);
      setSelectionStart(nextCursor);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.selectionStart = el.selectionEnd = nextCursor;
      });
    },
  });

  // v2 — screenshot/image paste + drag-drop. Stores the blob, inserts a
  // markdown image ref at the caret, and flips a text note to md mode so the
  // image actually renders in preview.
  const imagePaste = useImagePaste({
    noteId,
    mode: activeNote?.mode,
    onInsert: ({ body: nextBody, cursor, switchToMd }) => {
      setBody(nextBody);
      setSelectionStart(cursor);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.selectionStart = el.selectionEnd = cursor;
        el.focus();
      });
      if (switchToMd && activeNote) {
        void (async () => {
          await setNoteMode(activeNote.id, 'md');
          await refreshActiveNote();
          setMarkdownView('split');
        })();
      }
    },
  });

  function onTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Tab' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart, selectionEnd, value } = el;
      const next = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd);
      setBody(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 1;
      });
    }
  }

  function onInsertTable(rows: number, columns: number): void {
    if (!activeNote) return;
    const insertion = insertMarkdownTable(body, selectionStart, rows, columns);
    setBody(insertion.body);
    setSelectionStart(insertion.cursor);
    setMarkdownView('split');
    if (activeNote.mode !== 'md') {
      void setNoteMode(activeNote.id, 'md').then(() => refreshActiveNote());
    }
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.selectionStart = textarea.selectionEnd = insertion.cursor;
      textarea.focus();
    });
  }

  return (
    <section className="editor" aria-busy={!hydrated}>
      <TabBar tabs={tabs} activeTabId={activeTabId} notesById={notesById} activeBody={body} />
      {activeNote && <TagsBar note={activeNote} onInsertTable={openTableModal} />}
      <div className="editor-actions">
        <SnapshotToolbar snapshots={snapshots} onAfterRestore={setBody} />
        <div className="editor-actions-secondary">
          <button
            type="button"
            className="snap-btn stats-btn"
            onClick={openStats}
            data-testid="stats-open"
            title="Statistics (Ctrl + Shift + I)"
          >
            Stats
          </button>
          {activeNote?.mode === 'md' && (
            <div className="md-view-switch" role="group" aria-label="Markdown view">
              <button
                type="button"
                className="snap-btn"
                onClick={() => setMarkdownView('edit')}
                aria-pressed={markdownView === 'edit'}
                data-testid="markdown-view-edit"
              >
                Edit
              </button>
              <button
                type="button"
                className="snap-btn"
                onClick={() =>
                  setMarkdownView((current) => (current === 'split' ? 'edit' : 'split'))
                }
                aria-pressed={markdownView === 'split'}
                data-testid="preview-toggle"
              >
                Split
              </button>
              <button
                type="button"
                className="snap-btn"
                onClick={() => setMarkdownView('preview')}
                aria-pressed={markdownView === 'preview'}
                data-testid="markdown-view-preview"
              >
                Preview
              </button>
            </div>
          )}
          <ExportMenu note={activeNote} body={body} />
        </div>
      </div>
      <StatsModalHost body={body} />
      <ClearConfirmHost />
      <VersionsModalHost liveBody={body} onRestore={setBody} />
      <DraftRecoveryBanner onKeep={setBody} />
      <TableModalHost onInsert={onInsertTable} />
      <FindReplaceBar
        textareaRef={textareaRef}
        body={body}
        onBodyChange={(next, caret) => {
          setBody(next);
          setSelectionStart(caret);
        }}
      />
      {canvasOpen && activeNote ? (
        <div className="editor-input-wrap" data-testid="editor-canvas-wrap">
          <ExcalidrawCanvas noteId={activeNote.id} />
        </div>
      ) : (
        <div
          className={`editor-input-wrap${
            (activeNote?.mode === 'md' && markdownView === 'split') ||
            activeNote?.mode === 'checklist'
              ? ' editor-input-wrap--split'
              : ''
          }${
            activeNote?.mode === 'md' && markdownView === 'preview'
              ? ' editor-input-wrap--preview'
              : ''
          }`}
        >
          {!(activeNote?.mode === 'md' && markdownView === 'preview') &&
            (prefs.richEditor && activeNote && activeNote.mode !== 'checklist' ? (
              <Suspense
                fallback={
                  <div className="rich-editor-loading" data-testid="rich-editor-loading">
                    Loading editor…
                  </div>
                }
              >
                <LazyRichEditor
                  noteId={activeNote.id}
                  body={body}
                  selectionStart={selectionStart}
                  prefs={prefs}
                  placeholder={PLACEHOLDER}
                  onChange={(value, sel) => {
                    setBody(value);
                    setSelectionStart(sel);
                    useWritingTimer.getState().registerInput();
                  }}
                />
              </Suspense>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  className={`editor-input editor-input--paper-${prefs.paper}`}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setSelectionStart(e.target.selectionStart);
                    useWritingTimer.getState().registerInput();
                  }}
                  onKeyUp={(e) => setSelectionStart(e.currentTarget.selectionStart)}
                  onClick={(e) => setSelectionStart(e.currentTarget.selectionStart)}
                  onKeyDown={onTextareaKeyDown}
                  onPaste={imagePaste.onPaste}
                  onDrop={imagePaste.onDrop}
                  onDragOver={imagePaste.onDragOver}
                  placeholder={PLACEHOLDER}
                  spellCheck={prefs.spellcheck}
                  autoFocus
                  aria-label="Note body"
                  data-testid="editor-textarea"
                  style={{
                    fontSize: `${prefs.fontSize}px`,
                    lineHeight: prefs.lineHeight,
                    fontFamily: FONT_FAMILY_CSS[prefs.fontFamily],
                    tabSize: prefs.tabSize,
                  }}
                />
                <SlashCommands
                  textareaRef={textareaRef}
                  value={body}
                  selectionStart={selectionStart}
                  onApply={(nextValue, nextCursor) => {
                    setBody(nextValue);
                    setSelectionStart(nextCursor);
                    requestAnimationFrame(() => {
                      const el = textareaRef.current;
                      if (!el) return;
                      el.selectionStart = el.selectionEnd = nextCursor;
                      el.focus();
                    });
                  }}
                />
              </>
            ))}
          {activeNote?.mode === 'md' && markdownView !== 'edit' && (
            <Suspense fallback={<div className="md-preview" aria-hidden="true" />}>
              <PreviewPane body={body} />
            </Suspense>
          )}
          {activeNote?.mode === 'checklist' && <ChecklistPane body={body} onBodyChange={setBody} />}
          <AIResultPane
            onApply={(next) => {
              setBody(next);
              if (activeNote) {
                void saveNoteBody(activeNote.id, next).then(() => refreshActiveNote());
              }
            }}
          />
        </div>
      )}
      <SaveIndicator
        state={state}
        lastSavedAt={lastSavedAt}
        hydrated={hydrated}
        body={body}
        wordGoal={prefs.wordGoal}
      />
    </section>
  );
}

interface SaveIndicatorProps {
  state: SaveState;
  lastSavedAt: number | null;
  hydrated: boolean;
  body: string;
  wordGoal: number;
}

function SaveIndicator({
  state,
  lastSavedAt,
  hydrated,
  body,
  wordGoal,
}: SaveIndicatorProps): React.JSX.Element {
  const elapsedMs = useWritingTimer((s) => s.elapsedMs);
  const running = useWritingTimer((s) => s.running);
  const label = !hydrated ? 'loading' : STATE_LABEL[state];
  const stamp =
    lastSavedAt === null
      ? ''
      : new Date(lastSavedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
  const words = countWords(body);
  const goalPct = wordGoal > 0 ? Math.min(100, Math.round((words / wordGoal) * 100)) : null;
  return (
    <div className="save-indicator" role="status" aria-live="polite" data-testid="save-state">
      <span className={`save-dot save-dot--${state}`} aria-hidden="true" />
      <span className="save-label">{label}</span>
      {stamp && <span className="save-stamp mono"> · {stamp}</span>}
      <span className="save-spacer" />
      {wordGoal > 0 && goalPct !== null && (
        <span className="save-goal mono" data-testid="word-goal">
          {words}/{wordGoal} ·
          <span
            className={`save-goal-bar${goalPct >= 100 ? ' save-goal-bar--done' : ''}`}
            aria-hidden="true"
          >
            <span style={{ width: `${goalPct}%` }} />
          </span>
        </span>
      )}
      <span
        className={`save-timer mono${running ? ' save-timer--running' : ''}`}
        title={running ? 'Writing session running (pauses on idle > 60s)' : 'Idle'}
        data-testid="writing-timer"
      >
        ⏱ {formatTimer(elapsedMs)}
      </span>
    </div>
  );
}
