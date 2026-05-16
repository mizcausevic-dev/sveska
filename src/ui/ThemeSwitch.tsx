import { type ThemeChoice, useThemeStore } from '@/notes/themeStore';

const CHOICES: readonly ThemeChoice[] = ['dark', 'light', 'system'] as const;
const LABEL: Record<ThemeChoice, string> = { dark: 'Dark', light: 'Light', system: 'System' };

export function ThemeSwitch(): React.JSX.Element {
  const choice = useThemeStore((s) => s.choice);
  const setTheme = useThemeStore((s) => s.setTheme);
  return (
    <div className="theme-switch" role="group" aria-label="Theme">
      {CHOICES.map((c) => (
        <button key={c} type="button" aria-pressed={choice === c} onClick={() => void setTheme(c)}>
          {LABEL[c]}
        </button>
      ))}
    </div>
  );
}
