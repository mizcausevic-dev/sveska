import { useEffect } from 'react';
import { openPrefs } from '@/ui/prefsModalStore';

/** Global keyboard shortcuts. M0 wires only Ctrl+, per T0.2. */
export function KeyBindings(): null {
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const ctrlish = e.ctrlKey || e.metaKey;
      if (ctrlish && e.key === ',') {
        e.preventDefault();
        openPrefs();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
