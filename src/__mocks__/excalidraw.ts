import { createElement } from 'react';

/**
 * Vitest stub for @excalidraw/excalidraw — the real vendor pulls roughjs
 * which can't resolve under Node ESM in jsdom. Aliased by vitest.config.ts.
 * Production builds use the real package via lazy `import()`.
 */
export function Excalidraw(): React.JSX.Element {
  return createElement('div', { 'data-testid': 'excalidraw-stub' }, 'excalidraw stub');
}
