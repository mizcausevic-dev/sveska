import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { ThemeSwitch } from './ThemeSwitch';
import { closePrefs, usePrefsModal } from './prefsModalStore';
import { useUIStore } from '@/notes/uiStore';
import { FONT_FAMILY_LABEL, type FontFamily, useEditorPrefs } from '@/notes/editorPrefs';
import { getRestoreSession, setRestoreSession } from '@/notes/tabsStore';

const FAMILY_OPTIONS: FontFamily[] = ['mono', 'serif', 'ui', 'dyslexic'];
const TAB_SIZE_OPTIONS = [2, 4, 8] as const;

export function PrefsModalHost(): React.JSX.Element {
  const open = usePrefsModal((s) => s.open);
  const prefs = useEditorPrefs();
  const focus = useUIStore((s) => s.focus);
  const toggleFocus = useUIStore((s) => s.toggleFocus);
  const [restoreSession, setRestoreSessionLocal] = useState(true);

  // Hydrate the restoreSession pref every time the modal opens so the toggle
  // reflects the latest persisted value (changes elsewhere round-trip cleanly).
  useEffect(() => {
    if (!open) return;
    void getRestoreSession().then(setRestoreSessionLocal);
  }, [open]);

  return (
    <Modal open={open} onClose={closePrefs} title="Preferences" describedById="prefs-hint">
      <p id="prefs-hint" className="visually-hidden">
        Editor + theme preferences. All values persist across reloads.
      </p>

      {/* Theme — existing */}
      <div className="row">
        <div>
          <div className="label">Theme</div>
          <span className="hint">Dark default · Light · System</span>
        </div>
        <ThemeSwitch />
      </div>

      {/* Editor section — M1.T1.6 */}
      <div className="row">
        <div>
          <div className="label">Font family</div>
          <span className="hint">Mono · Serif · Sans · OpenDyslexic (system fallback)</span>
        </div>
        <div className="seg" role="group" aria-label="Font family">
          {FAMILY_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={prefs.fontFamily === f}
              onClick={() => void prefs.setFontFamily(f)}
              data-testid={`pref-family-${f}`}
            >
              {FONT_FAMILY_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <div>
          <div className="label">Font size</div>
          <span className="hint">{prefs.fontSize} px</span>
        </div>
        <input
          type="range"
          min={13}
          max={24}
          step={1}
          value={prefs.fontSize}
          onChange={(e) => void prefs.setFontSize(Number(e.target.value))}
          aria-label="Font size"
          data-testid="pref-font-size"
        />
      </div>

      <div className="row">
        <div>
          <div className="label">Line height</div>
          <span className="hint">{prefs.lineHeight.toFixed(2)} ×</span>
        </div>
        <input
          type="range"
          min={1.2}
          max={2.2}
          step={0.05}
          value={prefs.lineHeight}
          onChange={(e) => void prefs.setLineHeight(Number(e.target.value))}
          aria-label="Line height"
          data-testid="pref-line-height"
        />
      </div>

      <div className="row">
        <div>
          <div className="label">Spellcheck</div>
          <span className="hint">Browser-native squiggly underline</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.spellcheck}
            onChange={(e) => void prefs.setSpellcheck(e.target.checked)}
            data-testid="pref-spellcheck"
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          <span className="switch-label">{prefs.spellcheck ? 'On' : 'Off'}</span>
        </label>
      </div>

      <div className="row">
        <div>
          <div className="label">Tab size</div>
          <span className="hint">Visual width when a Tab character is rendered</span>
        </div>
        <div className="seg" role="group" aria-label="Tab size">
          {TAB_SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={prefs.tabSize === s}
              onClick={() => void prefs.setTabSize(s)}
              data-testid={`pref-tab-${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <div>
          <div className="label">Focus mode</div>
          <span className="hint">
            Hide chrome, widen margins. Toggle anywhere with <span className="kbd">Alt + F</span>.
          </span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={focus}
            onChange={() => void toggleFocus()}
            data-testid="pref-focus"
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          <span className="switch-label">{focus ? 'On' : 'Off'}</span>
        </label>
      </div>

      <div className="row">
        <div>
          <div className="label">Open previous session</div>
          <span className="hint">
            Restore the same tabs on next launch. Off = start fresh each time.
          </span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={restoreSession}
            onChange={(e) => {
              const v = e.target.checked;
              setRestoreSessionLocal(v);
              void setRestoreSession(v);
            }}
            data-testid="pref-restore-session"
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          <span className="switch-label">{restoreSession ? 'On' : 'Off'}</span>
        </label>
      </div>

      <div className="row">
        <div>
          <div className="label">Reset all editor preferences</div>
          <span className="hint">
            Back to BRAND.md defaults (17 px / 1.70× / mono / spellcheck on / tab 2).
          </span>
        </div>
        <button
          type="button"
          className="snap-btn snap-btn--danger"
          onClick={() => void prefs.reset()}
          data-testid="pref-reset"
        >
          Reset
        </button>
      </div>

      <div className="row">
        <div>
          <div className="label">Shortcuts</div>
          <span className="hint">
            <span className="kbd">Ctrl + ?</span> opens the full cheatsheet.
          </span>
        </div>
      </div>
    </Modal>
  );
}
