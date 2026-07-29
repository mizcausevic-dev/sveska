import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { ThemeSwitch } from './ThemeSwitch';
import { closePrefs, usePrefsModal } from './prefsModalStore';
import {
  DENSITY_LABEL,
  DENSITY_OPTIONS,
  WORKSPACE_WIDTH_LABEL,
  WORKSPACE_WIDTH_OPTIONS,
  useUIStore,
  type Density,
  type WorkspaceWidth,
} from '@/notes/uiStore';
import { useThemeStore, type ThemeChoice } from '@/notes/themeStore';
import {
  FONT_FAMILY_LABEL,
  PAPER_LABEL,
  PAPER_OPTIONS,
  type FontFamily,
  type Paper,
  useEditorPrefs,
} from '@/notes/editorPrefs';
import { getRestoreSession, setRestoreSession } from '@/notes/tabsStore';

const FAMILY_OPTIONS: FontFamily[] = ['mono', 'serif', 'ui', 'dyslexic'];
const TAB_SIZE_OPTIONS = [2, 4, 8] as const;

/**
 * Named accent themes beyond the base dark/light/system trio. Kept as a
 * secondary row (below ThemeSwitch) so the existing 3-button surface stays
 * intact — smoke test expects a "Light" button inside the modal. Choosing
 * an accent theme still routes through `useThemeStore.setTheme`, which
 * writes the same `data-theme` attribute; tokens.css does the rest.
 */
const ACCENT_THEMES: readonly Exclude<ThemeChoice, 'dark' | 'light' | 'system'>[] = [
  'charcoal',
  'midnight',
  'sepia',
] as const;
const ACCENT_LABEL: Record<(typeof ACCENT_THEMES)[number], string> = {
  charcoal: 'Charcoal',
  midnight: 'Midnight',
  sepia: 'Sepia',
};

export function PrefsModalHost(): React.JSX.Element {
  const open = usePrefsModal((s) => s.open);
  const prefs = useEditorPrefs();
  const focus = useUIStore((s) => s.focus);
  const toggleFocus = useUIStore((s) => s.toggleFocus);
  const density = useUIStore((s) => s.density);
  const setDensity = useUIStore((s) => s.setDensity);
  const hideNotesRail = useUIStore((s) => s.hideNotesRail);
  const setHideNotesRail = useUIStore((s) => s.setHideNotesRail);
  const workspaceWidth = useUIStore((s) => s.workspaceWidth);
  const setWorkspaceWidth = useUIStore((s) => s.setWorkspaceWidth);
  const themeChoice = useThemeStore((s) => s.choice);
  const setTheme = useThemeStore((s) => s.setTheme);
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

      {/* Accent themes — Phase 2. Extends the base theme with named
          variants (charcoal / midnight / sepia). Selecting one writes the
          same `data-theme` attribute; tokens.css does the rest. */}
      <div className="row">
        <div>
          <div className="label">Accent theme</div>
          <span className="hint">Charcoal · Midnight · Sepia (override base theme)</span>
        </div>
        <div className="seg" role="group" aria-label="Accent theme">
          {ACCENT_THEMES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={themeChoice === t}
              onClick={() => void setTheme(t)}
              data-testid={`pref-theme-${t}`}
            >
              {ACCENT_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Density — Phase 2. Scales spacing tokens + tap targets. */}
      <div className="row">
        <div>
          <div className="label">Density</div>
          <span className="hint">Compact · Comfortable · Spacious. Scales spacing + tap size.</span>
        </div>
        <div className="seg" role="group" aria-label="Density">
          {DENSITY_OPTIONS.map((d: Density) => (
            <button
              key={d}
              type="button"
              aria-pressed={density === d}
              onClick={() => void setDensity(d)}
              data-testid={`pref-density-${d}`}
            >
              {DENSITY_LABEL[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <div>
          <div className="label">Editor width</div>
          <span className="hint">
            Reading · Wide · Full. Full uses the available ultrawide workspace.
          </span>
        </div>
        <div className="seg" role="group" aria-label="Editor width">
          {WORKSPACE_WIDTH_OPTIONS.map((width: WorkspaceWidth) => (
            <button
              key={width}
              type="button"
              aria-pressed={workspaceWidth === width}
              onClick={() => void setWorkspaceWidth(width)}
              data-testid={`pref-workspace-${width}`}
            >
              {WORKSPACE_WIDTH_LABEL[width]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes rail visibility — Phase 2 panel-visibility toggle. */}
      <div className="row">
        <div>
          <div className="label">Hide notes rail</div>
          <span className="hint">Collapse the notes sidebar to reclaim editor width.</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={hideNotesRail}
            onChange={(e) => void setHideNotesRail(e.target.checked)}
            data-testid="pref-hide-rail"
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          <span className="switch-label">{hideNotesRail ? 'On' : 'Off'}</span>
        </label>
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
          <div className="label">Rich editor</div>
          <span className="hint">
            CodeMirror: pasted screenshots render inline, Markdown highlighting, slash commands,
            snippets, find/replace, typewriter. Turn off for the classic textarea editor.
          </span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.richEditor}
            onChange={(e) => void prefs.setRichEditor(e.target.checked)}
            data-testid="pref-rich-editor"
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          <span className="switch-label">{prefs.richEditor ? 'On' : 'Off'}</span>
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
          <div className="label">Paper texture</div>
          <span className="hint">Subtle background pattern behind the textarea.</span>
        </div>
        <div className="seg" role="group" aria-label="Paper texture">
          {PAPER_OPTIONS.map((p: Paper) => (
            <button
              key={p}
              type="button"
              aria-pressed={prefs.paper === p}
              onClick={() => void prefs.setPaper(p)}
              data-testid={`pref-paper-${p}`}
            >
              {PAPER_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <div>
          <div className="label">Word-count goal</div>
          <span className="hint">
            {prefs.wordGoal === 0
              ? 'Off — set a number to show progress in the footer.'
              : `${prefs.wordGoal} words`}
          </span>
        </div>
        <input
          type="number"
          min={0}
          step={50}
          value={prefs.wordGoal}
          onChange={(e) => void prefs.setWordGoal(Number(e.target.value))}
          className="prefs-number"
          aria-label="Word-count goal"
          data-testid="pref-word-goal"
        />
      </div>

      <div className="row">
        <div>
          <div className="label">Typewriter mode</div>
          <span className="hint">Auto-scroll so the active line stays near vertical center.</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.typewriter}
            onChange={(e) => void prefs.setTypewriter(e.target.checked)}
            data-testid="pref-typewriter"
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          <span className="switch-label">{prefs.typewriter ? 'On' : 'Off'}</span>
        </label>
      </div>

      <div className="row">
        <div>
          <div className="label">Typing sounds</div>
          <span className="hint">
            Short synth click per keystroke. Enter / Space / others get different pitches.
          </span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.sounds}
            onChange={(e) => void prefs.setSounds(e.target.checked)}
            data-testid="pref-sounds"
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          <span className="switch-label">{prefs.sounds ? 'On' : 'Off'}</span>
        </label>
      </div>

      {prefs.sounds && (
        <div className="row">
          <div>
            <div className="label">Sound volume</div>
            <span className="hint">{Math.round(prefs.soundVolume * 100)} %</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={prefs.soundVolume}
            onChange={(e) => void prefs.setSoundVolume(Number(e.target.value))}
            aria-label="Typing sound volume"
            data-testid="pref-sound-volume"
          />
        </div>
      )}

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
