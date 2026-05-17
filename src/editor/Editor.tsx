import { useEffect, useRef, useState } from 'react';
import { type Note } from '@/notes/db';
import { migrateLegacyLocalStorage, listNotes, getNoteById, saveNoteBody } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { useAutosave, type SaveState } from './useAutosave';
import { useSnapshots } from './useSnapshots';
import { SnapshotToolbar } from './SnapshotToolbar';
import { ExportMenu } from './ExportMenu';
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
import { PreviewPane } from './PreviewPane';
import { ChecklistPane } from './ChecklistPane';
import { useSnippetExpand } from './useSnippetExpand';
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

const PLACEHOLDER = 'Prazna sveska. Najbolji početak.';

const STATE_LABEL: Record<SaveState, string> = {
  idle: 'idle',
  pending: 'pending',
  saving: 'saving',
  saved: 'saved',
  error: 'save failed',
};

export function Editor(): React.JSX.Element {
  const activeNote = useTabs((s) => s.activeNote);
  const ready = useTabs((s) => s.ready);
  const tabs = useTabs((s) => s.tabs);
  const activeTabId = useTabs((s) => s.activeTabId);
  const refreshActiveNote = useTabs((s) => s.refreshActiveNote);

  const [body, setBody] = useState('');
  const [notesById, setNotesById] = useState<Record<string, Note>>({});
  const [selectionStart, setSelectionStart] = useState(0);
  const [previewOn, setPreviewOn] = useState(true);
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
      download(exportAs(ast, 'txt'));
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

  return (
    <section className="editor" aria-busy={!hydrated}>
      <TabBar tabs={tabs} activeTabId={activeTabId} notesById={notesById} activeBody={body} />
      {activeNote && <TagsBar note={activeNote} />}
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
            <button
              type="button"
              className={`snap-btn${previewOn ? ' snap-btn--primary' : ''}`}
              onClick={() => setPreviewOn((v) => !v)}
              aria-pressed={previewOn}
              data-testid="preview-toggle"
              title="Toggle Markdown preview pane"
            >
              {previewOn ? 'Hide preview' : 'Show preview'}
            </button>
          )}
          <ExportMenu note={activeNote} body={body} />
        </div>
      </div>
      <StatsModalHost body={body} />
      <ClearConfirmHost />
      <VersionsModalHost liveBody={body} onRestore={setBody} />
      <DraftRecoveryBanner onKeep={setBody} />
      <FindReplaceBar
        textareaRef={textareaRef}
        body={body}
        onBodyChange={(next, caret) => {
          setBody(next);
          setSelectionStart(caret);
        }}
      />
      <div
        className={`editor-input-wrap${
          (activeNote?.mode === 'md' && previewOn) || activeNote?.mode === 'checklist'
            ? ' editor-input-wrap--split'
            : ''
        }`}
      >
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
        {activeNote?.mode === 'md' && previewOn && <PreviewPane body={body} />}
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
