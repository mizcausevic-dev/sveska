import { useEffect } from 'react';
import { openPrefs } from '@/ui/prefsModalStore';
import { openStats } from '@/editor/statsModalStore';
import { useUIStore } from '@/notes/uiStore';

/**
 * Global keyboard shortcuts.
 * - Ctrl/Cmd + ,         → preferences (M0.T0.2)
 * - Ctrl/Cmd + Shift + I → statistics modal (M1.T1.4)
 * - Alt + F              → toggle focus mode (M1.T1.5)
 * Full M1 shortcut set arrives at T1.7.
 */
export function KeyBindings(): null {
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const ctrlish = e.ctrlKey || e.metaKey;
      if (ctrlish && e.key === ',') {
        e.preventDefault();
        openPrefs();
        return;
      }
      if (ctrlish && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        openStats();
        return;
      }
      if (e.altKey && !ctrlish && (e.key === 'F' || e.key === 'f' || e.key === 'ƒ')) {
        // Note: macOS turns Alt+F into 'ƒ'.
        e.preventDefault();
        void useUIStore.getState().toggleFocus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
