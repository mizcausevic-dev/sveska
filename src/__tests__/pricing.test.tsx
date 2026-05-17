import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Pricing } from '@/routes/Pricing';
import { Funnel } from '@/routes/Funnel';
import { countLeadEvents, trackLead } from '@/platform/leadgen';

function renderRoute(node: React.ReactNode, initialEntry = '/'): void {
  render(<MemoryRouter initialEntries={[initialEntry]}>{node}</MemoryRouter>);
}

describe('M6.T6.4 — /pricing page', () => {
  it('renders three tiers (Free, Pro, Team)', () => {
    renderRoute(<Pricing />);
    expect(screen.getByTestId('pricing-card-free')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-card-pro')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-card-team')).toBeInTheDocument();
  });

  it('Pro CTA records a cta.click lead event', async () => {
    renderRoute(<Pricing />);
    const before = await countLeadEvents('cta.click');
    await userEvent.click(screen.getByTestId('pricing-cta-pro-interest'));
    await waitFor(async () => {
      expect(await countLeadEvents('cta.click')).toBe(before + 1);
    });
  });

  it('Team CTA records a separate cta.click event with distinct id', async () => {
    renderRoute(<Pricing />);
    await userEvent.click(screen.getByTestId('pricing-cta-team'));
    await waitFor(async () => {
      const { listLeadEvents } = await import('@/platform/leadgen');
      const events = await listLeadEvents();
      const last = events[events.length - 1];
      expect(last?.kind).toBe('cta.click');
      expect(last?.payload?.id).toBe('pricing.team.interest');
    });
  });
});

describe('M6.T6.4 — /funnel dashboard', () => {
  it('shows empty-state when no lead events have landed', async () => {
    renderRoute(<Funnel />);
    await waitFor(() => expect(screen.getByTestId('funnel-empty')).toBeInTheDocument());
  });

  it('graphs stages from captured lead events', async () => {
    await trackLead('email.capture', { source: 'blog-index', email: 'a@b.co' });
    await trackLead('email.capture', { source: 'footer', email: 'c@d.co' });
    await trackLead('cta.click', { id: 'pricing.pro.waitlist', slot: 'pricing-card' });
    await trackLead('cta.click', { id: 'm6.changelog.intro', slot: 'shell' });
    await trackLead('cta.dismiss', { id: 'm6.changelog.intro', slot: 'shell' });

    renderRoute(<Funnel />);
    await waitFor(() => expect(screen.getByTestId('funnel-row-email').textContent).toContain('2'));
    expect(screen.getByTestId('funnel-row-pro').textContent).toContain('1');
    expect(screen.getByTestId('funnel-row-cta-clicks').textContent).toContain('2');
    expect(screen.getByTestId('funnel-row-cta-dismiss').textContent).toContain('1');
  });

  it('shows the $15K/mo target line + bar', async () => {
    renderRoute(<Funnel />);
    await waitFor(() => expect(screen.getByTestId('funnel-target')).toBeInTheDocument());
    expect(screen.getByTestId('funnel-target').textContent).toMatch(/15,000/);
    expect(screen.getByTestId('funnel-target').textContent).toMatch(/1,500/);
  });
});
