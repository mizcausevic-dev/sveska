import { Modal } from './Modal';
import { ThemeSwitch } from './ThemeSwitch';
import { closePrefs, usePrefsModal } from './prefsModalStore';

export function PrefsModalHost(): React.JSX.Element {
  const open = usePrefsModal((s) => s.open);
  return (
    <Modal open={open} onClose={closePrefs} title="Preferences" describedById="prefs-hint">
      <p id="prefs-hint" className="visually-hidden">
        Preferences shell. Full settings ship at M1.
      </p>
      <div className="row">
        <div>
          <div className="label">Theme</div>
          <span className="hint">Dark default · Light · System</span>
        </div>
        <ThemeSwitch />
      </div>
      <div className="row">
        <div>
          <div className="label">Editor preferences</div>
          <span className="hint">Font, size, spellcheck, focus margin — ship at M1.6.</span>
        </div>
        <span className="kbd">M1</span>
      </div>
      <div className="row">
        <div>
          <div className="label">Shortcuts</div>
          <span className="hint">
            <span className="kbd">Ctrl + ,</span> opens this dialog. More land at M1.7.
          </span>
        </div>
        <span className="kbd">M1</span>
      </div>
    </Modal>
  );
}
