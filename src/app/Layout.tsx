import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeSwitch } from '@/ui/ThemeSwitch';
import { openPrefs } from '@/ui/prefsModalStore';
import { useUIStore } from '@/notes/uiStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  const focus = useUIStore((s) => s.focus);
  const toggleFocus = useUIStore((s) => s.toggleFocus);
  return (
    <div className={`app-shell${focus ? ' app-shell--focus' : ''}`} data-testid="app-shell">
      {focus && (
        <button
          type="button"
          className="focus-exit"
          onClick={() => void toggleFocus()}
          title="Exit focus mode (Alt + F)"
          data-testid="focus-exit"
        >
          <span className="kbd">Alt + F</span> exit
        </button>
      )}
      <header className="app-header">
        <NavLink to="/" className="brand" aria-label="Sveska home">
          <img src="/brand/favicon.svg" alt="" width={28} height={28} />
          <span className="wordmark">
            Sveska<span className="dot">.</span>
          </span>
        </NavLink>
        <nav aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/glossary">Glossary</NavLink>
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
        <span>
          Sveska · local-first · v0.0.0 · <a href="/glossary">glossary</a>
        </span>
        <span aria-live="polite">Prazna sveska. Najbolji početak.</span>
      </footer>
    </div>
  );
}
