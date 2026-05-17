import { Modal } from './Modal';
import { closeShortcuts, useShortcutsModal } from './shortcutsModalStore';

interface Shortcut {
  keys: string[];
  label: string;
  group: 'Modals' | 'Editor' | 'View' | 'Help';
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['Ctrl', ','], label: 'Preferences', group: 'Modals' },
  { keys: ['Ctrl', 'Shift', 'I'], label: 'Statistics', group: 'Modals' },
  { keys: ['Ctrl', '?'], label: 'This cheatsheet', group: 'Modals' },
  { keys: ['Ctrl', 'S'], label: 'Save / export as .txt', group: 'Editor' },
  { keys: ['Alt', 'C'], label: 'Copy whole note to clipboard', group: 'Editor' },
  { keys: ['Ctrl', 'Del'], label: 'Clear note (confirm)', group: 'Editor' },
  { keys: ['Alt', 'F'], label: 'Toggle focus mode', group: 'View' },
];

const GROUP_ORDER: Shortcut['group'][] = ['Modals', 'Editor', 'View', 'Help'];

export function ShortcutsModalHost(): React.JSX.Element {
  const open = useShortcutsModal((s) => s.open);
  return (
    <Modal
      open={open}
      onClose={closeShortcuts}
      title="Keyboard shortcuts"
      describedById="shortcuts-hint"
    >
      <p id="shortcuts-hint" className="visually-hidden">
        Every shortcut currently wired in the app. On macOS, Ctrl = Cmd.
      </p>
      <div className="shortcuts" data-testid="shortcuts-list">
        {GROUP_ORDER.map((group) => {
          const items = SHORTCUTS.filter((s) => s.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="shortcuts-group">
              <h3 className="shortcuts-group-label mono">{group}</h3>
              <ul>
                {items.map((s, i) => (
                  <li key={i} className="shortcut-row">
                    <span className="shortcut-keys">
                      {s.keys.map((k, j) => (
                        <span key={j} className="kbd">
                          {k}
                        </span>
                      ))}
                    </span>
                    <span className="shortcut-label">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
