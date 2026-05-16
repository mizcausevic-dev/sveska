import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { _resetDbForTests } from '@/notes/db';

afterEach(() => {
  cleanup();
  // Fresh Dexie singleton per test; fake-indexeddb resets via its module reset hook.
  _resetDbForTests();
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '';
});
