import { type ReactNode } from 'react';
import { ThemeSwitch } from '@/ui/ThemeSwitch';
import { openPrefs } from '@/ui/prefsModalStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="/" className="brand" aria-label="Sveska home">
          <img src="/brand/favicon.svg" alt="" width={28} height={28} />
          <span className="wordmark">
            Sveska<span className="dot">.</span>
          </span>
        </a>
        <nav aria-label="Primary">
          <button
            type="button"
            onClick={openPrefs}
            aria-label="Open preferences (Ctrl + ,)"
            title="Preferences (Ctrl + ,)"
            className="kbd"
          >
            Prefs · Ctrl+,
          </button>
          <ThemeSwitch />
        </nav>
      </header>
      <main className="app-main" id="main">
        {children}
      </main>
      <footer className="app-footer">
        <span>Sveska · local-first · v0.0.0</span>
        <span aria-live="polite">Prazna sveska. Najbolji početak.</span>
      </footer>
    </div>
  );
}
