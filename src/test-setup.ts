import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { _resetDbForTests } from '@/notes/db';

afterEach(async () => {
  cleanup();
  // Close the Dexie connection + drop the DB so each test starts clean.
  await _resetDbForTests();
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '';
});
