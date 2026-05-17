import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { _resetDbForTests } from '@/notes/db';
import { usePrefsModal } from '@/ui/prefsModalStore';
import { useStatsModal } from '@/editor/statsModalStore';
import { useUIStore } from '@/notes/uiStore';

afterEach(async () => {
  cleanup();
  // Close the Dexie connection + drop the DB so each test starts clean.
  await _resetDbForTests();
  // Reset Zustand modal stores — they're singletons that survive `cleanup()`
  // and would otherwise leak open-state between tests.
  usePrefsModal.setState({ open: false });
  useStatsModal.setState({ open: false });
  useUIStore.setState({ focus: false });
  document.documentElement.classList.remove('focus-mode');
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '';
});
