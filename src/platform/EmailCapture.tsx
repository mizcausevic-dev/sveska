import { useState } from 'react';
import { isValidEmail, trackLead } from './leadgen';

interface Props {
  /** Which surface the form sits on; recorded with the lead event. */
  source: 'blog-index' | 'blog-post' | 'rail' | 'footer';
  /** Optional headline override. Default is the writing-ritual pitch. */
  heading?: string;
  className?: string;
}

/**
 * Reusable email-capture card (M6.T6.3). Tiny by design — input + button,
 * one happy state, one error state. Lead lands via `trackLead`; vendor
 * integration (Mailchimp/Brevo/ConvertKit) replaces the body of trackLead
 * later without touching this UI.
 */
export function EmailCapture({ source, heading, className }: Props): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'invalid'>('idle');

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const value = email.trim();
    if (!isValidEmail(value)) {
      setState('invalid');
      return;
    }
    await trackLead('email.capture', { source, email: value });
    setEmail('');
    setState('ok');
  }

  return (
    <aside
      className={`leadgen-card${className ? ' ' + className : ''}`}
      data-testid={`leadgen-${source}`}
    >
      <h3 className="leadgen-h">{heading ?? 'Quiet, deliberate updates'}</h3>
      <p className="leadgen-p">
        One short note per ship — milestone tags, what we cut, what's next. No tracking pixels, no
        drip funnels.
      </p>
      <form className="leadgen-form" onSubmit={(e) => void onSubmit(e)}>
        <label htmlFor={`leadgen-email-${source}`} className="visually-hidden">
          Email address
        </label>
        <input
          id={`leadgen-email-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== 'idle') setState('idle');
          }}
          className="leadgen-input"
          aria-invalid={state === 'invalid'}
          data-testid={`leadgen-input-${source}`}
        />
        <button
          type="submit"
          className="snap-btn snap-btn--primary"
          data-testid={`leadgen-submit-${source}`}
        >
          Subscribe
        </button>
      </form>
      {state === 'ok' && (
        <p className="leadgen-ok" role="status" data-testid={`leadgen-ok-${source}`}>
          Saved. We'll write when something real ships.
        </p>
      )}
      {state === 'invalid' && (
        <p className="leadgen-err" role="alert" data-testid={`leadgen-err-${source}`}>
          That doesn't look like an email.
        </p>
      )}
    </aside>
  );
}
