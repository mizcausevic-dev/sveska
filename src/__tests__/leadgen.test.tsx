import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailCapture } from '@/platform/EmailCapture';
import { CTASlot } from '@/platform/CTASlot';
import { useCTA } from '@/platform/ctaStore';
import { countLeadEvents, isValidEmail, listLeadEvents, trackLead } from '@/platform/leadgen';

describe('M6.T6.3 — leadgen seam (pure)', () => {
  it('isValidEmail rejects junk + accepts well-formed addresses', () => {
    expect(isValidEmail('a@b.c')).toBe(true);
    expect(isValidEmail('miz@kineticgain.com')).toBe(true);
    expect(isValidEmail('plain')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('@a.b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('trackLead appends rows to the prefs leadEvents store', async () => {
    await trackLead('email.capture', { source: 'test', email: 'a@b.co' });
    await trackLead('cta.click', { id: 'x', slot: 'shell' });
    const events = await listLeadEvents();
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[events.length - 1]?.kind).toBe('cta.click');
    expect(await countLeadEvents('email.capture')).toBeGreaterThanOrEqual(1);
  });
});

describe('M6.T6.3 — EmailCapture component', () => {
  it('invalid email shows the inline error (no track)', async () => {
    const before = await countLeadEvents('email.capture');
    render(<EmailCapture source="rail" />);
    const input = screen.getByTestId<HTMLInputElement>('leadgen-input-rail');
    fireEvent.change(input, { target: { value: 'not-an-email' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(screen.getByTestId('leadgen-err-rail')).toBeInTheDocument());
    expect(await countLeadEvents('email.capture')).toBe(before);
  });

  it('valid email tracks + flips to ok state', async () => {
    render(<EmailCapture source="footer" />);
    const input = screen.getByTestId<HTMLInputElement>('leadgen-input-footer');
    fireEvent.change(input, { target: { value: 'me@example.com' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(screen.getByTestId('leadgen-ok-footer')).toBeInTheDocument());
    const events = await listLeadEvents();
    const last = events[events.length - 1];
    expect(last?.kind).toBe('email.capture');
    expect(last?.payload?.email).toBe('me@example.com');
    expect(last?.payload?.source).toBe('footer');
  });
});

describe('M6.T6.3 — CTASlot + dismissal', () => {
  it('renders by default + dismiss persists across remount', async () => {
    render(<CTASlot id="m6.test.cta" slot="shell" label="Try" href="/x" blurb="hi" />);
    await waitFor(() => expect(screen.getByTestId('cta-slot-m6.test.cta')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('cta-dismiss-m6.test.cta'));
    await waitFor(() =>
      expect(screen.queryByTestId('cta-slot-m6.test.cta')).not.toBeInTheDocument(),
    );
    // Simulate remount: useCTA's dismissed set is still populated.
    expect(useCTA.getState().dismissed.has('m6.test.cta')).toBe(true);
  });

  it('clicking the CTA link records a cta.click lead event', async () => {
    render(<CTASlot id="m6.click.test" slot="blog" label="See" href="/y" />);
    await waitFor(() => expect(screen.getByTestId('cta-slot-m6.click.test')).toBeInTheDocument());
    const before = await countLeadEvents('cta.click');
    await userEvent.click(screen.getByTestId('cta-link-m6.click.test'));
    await waitFor(async () => {
      expect(await countLeadEvents('cta.click')).toBe(before + 1);
    });
  });
});
