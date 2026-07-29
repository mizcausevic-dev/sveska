import type { Tab, ThemeChoice } from '../storage/notesStorage';

interface Props {
  tab: Tab;
  onTabChange: (t: Tab) => void;
  theme: ThemeChoice;
  onThemeChange: (t: ThemeChoice) => void;
}

/**
 * Panel header: two tabs on the left, a light/dark toggle on the right.
 *
 * The theme toggle is intentionally binary (dark ↔ light) for Phase 1.
 * The wider named-theme picker (charcoal/midnight/sepia) lives in the
 * PWA's PrefsModal per the Phase 2 wiring plan — pulling the same
 * `ThemeChoice` type in here keeps the extension a subset of it, no
 * type reshuffle later.
 */
export function Header({ tab, onTabChange, theme, onThemeChange }: Props): React.JSX.Element {
  function toggleTheme(): void {
    onThemeChange(theme === 'light' || theme === 'sepia' ? 'dark' : 'light');
  }
  const isLight = theme === 'light' || theme === 'sepia';
  return (
    <header className="panel-header">
      <div className="panel-tabs" role="tablist" aria-label="Sveska sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'tasks'}
          className={`panel-tab ${tab === 'tasks' ? 'is-active' : ''}`}
          onClick={() => onTabChange('tasks')}
          data-testid="tab-tasks"
        >
          Tasks
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'notebook'}
          className={`panel-tab ${tab === 'notebook' ? 'is-active' : ''}`}
          onClick={() => onTabChange('notebook')}
          data-testid="tab-notebook"
        >
          Notebook
        </button>
      </div>
      <button
        type="button"
        className="panel-theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        data-testid="theme-toggle"
      >
        {isLight ? '☾' : '☀'}
      </button>
    </header>
  );
}
