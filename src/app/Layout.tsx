import { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeSwitch } from '@/ui/ThemeSwitch';
import { openPrefs } from '@/ui/prefsModalStore';
import { useUIStore } from '@/notes/uiStore';
import { NotesRail } from '@/editor/NotesRail';
import { useNotesRail } from '@/notes/notesRailStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  const focus = useUIStore((s) => s.focus);
  const toggleFocus = useUIStore((s) => s.toggleFocus);
  const railOpen = useNotesRail((s) => s.open);
  const location = useLocation();
  // Show the rail only on the editor route + only outside focus mode.
  const showRail = !focus && location.pathname === '/';
  const shellMod = `${focus ? ' app-shell--focus' : ''}${
    showRail ? (railOpen ? ' app-shell--rail-open' : ' app-shell--rail-collapsed') : ''
  }`;
  return (
    <div className={`app-shell${shellMod}`} data-testid="app-shell">
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
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/changelog">Changelog</NavLink>
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
      <div className="app-body">
        {showRail && <NotesRail />}
        <main className="app-main" id="main">
          {children}
        </main>
      </div>
      <footer className="app-footer">
        <span>
          Sveska · local-first · v0.0.0 · <a href="/glossary">glossary</a>
        </span>
        <span aria-live="polite">Prazna sveska. Najbolji početak.</span>
      </footer>
    </div>
  );
}
