import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
// virtual:pwa-register/react is aliased to src/__mocks__/pwaRegister.ts
// via vitest.config.ts — no per-test mock needed.
import { cleanup } from '@testing-library/react';
import { _resetDbForTests } from '@/notes/db';
import { usePrefsModal } from '@/ui/prefsModalStore';
import { useStatsModal } from '@/editor/statsModalStore';
import { useShortcutsModal } from '@/ui/shortcutsModalStore';
import { useUIStore } from '@/notes/uiStore';
import { DEFAULT_EDITOR_PREFS, useEditorPrefs } from '@/notes/editorPrefs';

afterEach(async () => {
  cleanup();
  // Close the Dexie connection + drop the DB so each test starts clean.
  await _resetDbForTests();
  // Reset Zustand singletons — they survive `cleanup()` and would otherwise
  // leak state between tests.
  usePrefsModal.setState({ open: false });
  useStatsModal.setState({ open: false });
  useShortcutsModal.setState({ open: false });
  useUIStore.setState({ focus: false });
  useEditorPrefs.setState(DEFAULT_EDITOR_PREFS);
  document.documentElement.classList.remove('focus-mode');
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '';
});
