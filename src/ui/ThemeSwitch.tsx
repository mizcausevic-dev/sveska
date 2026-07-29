import { useThemeStore } from '@/notes/themeStore';

// This is the base 3-choice header switch. Named accent themes
// (charcoal / midnight / sepia) live in PrefsModal's accent-theme row;
// selecting one there routes through the same `useThemeStore.setTheme`,
// which drops all three of these into their unpressed state — an
// acceptable visual quirk since the switch isn't the source of truth.
const CHOICES = ['dark', 'light', 'system'] as const;
type BaseChoice = (typeof CHOICES)[number];
const LABEL: Record<BaseChoice, string> = { dark: 'Dark', light: 'Light', system: 'System' };

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
