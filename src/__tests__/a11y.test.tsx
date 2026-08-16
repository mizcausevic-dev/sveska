import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/app/App';
import { Glossary } from '@/routes/Glossary';

expect.extend(matchers);

// Common axe rules we knowingly skip:
//   - color-contrast: jsdom doesn't compute real colors; meaningful only
//     in real browsers. Manual visual review covers this.
//   - region: top-level pages render headings + lists rather than ARIA
//     landmarks; the surrounding <Layout> in the live app provides the
//     <main> wrapper, but route-only renders here don't.
const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
};

describe('M7.T7.1 — a11y sweep', () => {
  it('App shell (home / editor) has no axe violations', async () => {
    const { container } = render(<App />);
    // Wait for the editor textarea to mount so we audit the full shell.
    await waitFor(() => expect(container.querySelector('textarea')).not.toBeNull());
    const results = await axe(container, AXE_OPTIONS);
    expect(results).toHaveNoViolations();
  }, 20_000);

  it('/glossary page has no axe violations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/glossary']}>
        <Glossary />
      </MemoryRouter>,
    );
    const results = await axe(container, AXE_OPTIONS);
    expect(results).toHaveNoViolations();
  });
});
