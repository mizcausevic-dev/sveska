// vitest-axe@0.1 ships augmentation for `Vi.Assertion` but vitest@2
// resolves matchers via `import('vitest').Assertion` in `expect()`.
// Re-augment the public `Assertion` interface here so `toHaveNoViolations`
// is visible under TS strict mode.
import 'vitest';
import type { AxeResults } from 'axe-core';

interface AxeMatchers {
  toHaveNoViolations(received?: AxeResults): { pass: boolean; message: () => string };
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Assertion<T = unknown> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
