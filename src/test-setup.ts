import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// virtual:pwa-register/react is aliased to src/__mocks__/pwaRegister.ts
// via vitest.config.ts — no per-test mock needed.
import { _resetDbForTests } from '@/notes/db';
import { usePrefsModal } from '@/ui/prefsModalStore';
import { useStatsModal } from '@/editor/statsModalStore';
import { useShortcutsModal } from '@/ui/shortcutsModalStore';
import { useUIStore } from '@/notes/uiStore';
import { DEFAULT_EDITOR_PREFS, useEditorPrefs } from '@/notes/editorPrefs';
import { PREF_KEYS_EDITOR, setPref } from '@/notes/prefs';
import { useTabs } from '@/notes/tabsStore';
import { useVersionsModal } from '@/editor/versionsModalStore';
import { useDraftRecovery } from '@/editor/draftRecoveryStore';
import { useNotesRail } from '@/notes/notesRailStore';
import { useSearchModal } from '@/ui/searchModalStore';
import { useInboxModal } from '@/ui/inboxModalStore';
import { useCommandPalette } from '@/ui/commandPaletteStore';
import { useTemplatesModal } from '@/ui/templatesModalStore';
import { useFindReplace } from '@/editor/findReplaceStore';
import { useWritingTimer } from '@/editor/writingTimerStore';
import { useAIRun } from '@/ai/aiRunStore';
import { useCanvasView } from '@/canvas/canvasViewStore';
import { useCTA } from '@/platform/ctaStore';

// Pre-bootstrap the tabs store so every test starts with a hydrated note +
// one open tab — matches first-boot behavior. Without this, tests would race
// the Editor's async auto-bootstrap and see an empty Dexie when probing it.
beforeEach(async () => {
  await useTabs.getState().bootstrap();
  // The production default is the CodeMirror rich editor (richEditor: true),
  // but the App-integration tests target the classic <textarea> surface
  // (data-testid="editor-textarea") and CM doesn't render meaningfully in
  // jsdom. Force the classic editor for tests: set the store AND persist
  // false to Dexie so any per-test bootstrapEditorPrefs() reads it back as
  // false (otherwise bootstrap would re-hydrate the true default). Rich-
  // editor behavior is covered by its own unit tests + browser verification.
  await setPref(PREF_KEYS_EDITOR.richEditor, false);
  useEditorPrefs.setState({ richEditor: false });
});

afterEach(async () => {
  cleanup();
  // Close the Dexie connection + drop the DB so each test starts clean.
  await _resetDbForTests();
  // Reset Zustand singletons — they survive `cleanup()` and would otherwise
  // leak state between tests.
  usePrefsModal.setState({ open: false });
  useStatsModal.setState({ open: false });
  useShortcutsModal.setState({ open: false });
  useVersionsModal.setState({ open: false });
  useDraftRecovery.setState({ pending: null });
  useNotesRail.setState({ open: true, filter: { kind: 'all' } });
  useSearchModal.setState({ open: false });
  useInboxModal.setState({ open: false });
  useCommandPalette.setState({ open: false });
  useTemplatesModal.setState({ open: false, tab: 'templates' });
  useFindReplace.setState({ open: false });
  useWritingTimer.setState({ running: false, elapsedMs: 0, lastInputAt: 0 });
  useAIRun.getState().reset();
  useAIRun.setState({ toast: null });
  useCanvasView.setState({ open: false });
  useCTA.getState()._reset();
  useUIStore.setState({ focus: false });
  useEditorPrefs.setState(DEFAULT_EDITOR_PREFS);
  useTabs.setState({ tabs: [], activeTabId: null, activeNote: null, ready: false });
  document.documentElement.classList.remove('focus-mode');
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '';
});
