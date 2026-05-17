import { useEffect } from 'react';
import { openPrefs } from '@/ui/prefsModalStore';
import { openStats } from '@/editor/statsModalStore';
import { openShortcuts } from '@/ui/shortcutsModalStore';
import { openSearch } from '@/ui/searchModalStore';
import { openInbox } from '@/ui/inboxModalStore';
import { openCommandPalette } from '@/ui/commandPaletteStore';
import { openTemplates } from '@/ui/templatesModalStore';
import { openFindReplace } from '@/editor/findReplaceStore';
import { useEditorCommands } from '@/editor/editorCommands';
import { useUIStore } from '@/notes/uiStore';

/**
 * Global keyboard shortcuts (full M1 set per CLAUDE.md §6 T1.7).
 *
 * Modal shortcuts:
 *   Ctrl/Cmd + ,            preferences
 *   Ctrl/Cmd + Shift + I    statistics
 *   Ctrl/Cmd + ?            this cheatsheet (Shift+/ also)
 *
 * Editor commands (dispatched via useEditorCommands so KeyBindings doesn't
 * touch the editor's local state):
 *   Ctrl/Cmd + S            save / export as .txt
 *   Alt + C                 copy whole body to clipboard
 *   Ctrl/Cmd + Del          clear body (confirm modal first)
 *
 * View:
 *   Alt + F                 toggle focus mode
 */
export function KeyBindings(): null {
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const ctrlish = e.ctrlKey || e.metaKey;

      if (ctrlish && !e.shiftKey && !e.altKey && e.key === ',') {
        e.preventDefault();
        openPrefs();
        return;
      }
      if (ctrlish && !e.shiftKey && !e.altKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        openSearch();
        return;
      }
      if (ctrlish && !e.shiftKey && !e.altKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        openCommandPalette();
        return;
      }
      if (ctrlish && !e.shiftKey && !e.altKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        openTemplates();
        return;
      }
      if (ctrlish && !e.shiftKey && !e.altKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        openFindReplace();
        return;
      }
      if (ctrlish && e.shiftKey && !e.altKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        openInbox();
        return;
      }
      if (ctrlish && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        openStats();
        return;
      }
      if (ctrlish && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        openShortcuts();
        return;
      }
      if (ctrlish && !e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        useEditorCommands.getState().run('export.txt');
        return;
      }
      if (e.altKey && !ctrlish && (e.key === 'C' || e.key === 'c' || e.key === 'ç')) {
        // macOS Alt+C → ç
        e.preventDefault();
        useEditorCommands.getState().run('copy.body');
        return;
      }
      if (ctrlish && e.key === 'Delete') {
        e.preventDefault();
        useEditorCommands.getState().run('clear.body.request');
        return;
      }
      if (e.altKey && !ctrlish && (e.key === 'F' || e.key === 'f' || e.key === 'ƒ')) {
        // macOS Alt+F → ƒ
        e.preventDefault();
        void useUIStore.getState().toggleFocus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
