import { useEffect } from 'react';
import { openPrefs } from '@/ui/prefsModalStore';
import { openStats } from '@/editor/statsModalStore';

/**
 * Global keyboard shortcuts.
 * - Ctrl/Cmd + ,     → preferences (M0.T0.2)
 * - Ctrl/Cmd + Shift + I → statistics modal (M1.T1.4)
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
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
