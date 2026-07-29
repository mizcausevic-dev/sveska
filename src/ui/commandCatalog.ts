import { openPrefs } from './prefsModalStore';
import { openStats } from '@/editor/statsModalStore';
import { openShortcuts } from './shortcutsModalStore';
import { openSearch } from './searchModalStore';
import { openInbox } from './inboxModalStore';
import { openVersions } from '@/editor/versionsModalStore';
import { openTemplates } from './templatesModalStore';
import { useEditorCommands } from '@/editor/editorCommands';
import { useUIStore } from '@/notes/uiStore';
import { useNotesRail } from '@/notes/notesRailStore';
import { useTabs } from '@/notes/tabsStore';
import { setNotePinned } from '@/notes/noteRepo';
import { packShareHash } from '@/lib/hashShare';
import { AI_COMMANDS } from '@/ai/prompts';
import { useAIRun } from '@/ai/aiRunStore';
import { fallbackSpec, parseImageSpec, specPromptFor, type ImageVariant } from '@/ai/imageSpec';
import { downloadImage } from '@/ai/renderImage';
import { runAI, type AIError } from '@/ai/aiClient';
import { openCanvasView, useCanvasView } from '@/canvas/canvasViewStore';
import { toBlogMdx, slugify as contentSlugify } from '@/platform/content';
import { openTableModal } from '@/editor/tableModalStore';

/**
 * Static catalog of every user-facing action (M3.T3.1).
 *
 * Each entry has a stable id (used as React key + slash-command alias), a
 * display label, an optional shortcut hint for the row, an optional keywords
 * blob for fuzzy matching, and the `run` thunk. Most thunks just call the
 * already-existing modal-opener or editor-command — the palette is a
 * discovery surface, not a re-implementation.
 *
 * Built lazily as a function (not a top-level const) because some `run`s
 * read the current Zustand state via `getState()` and we want each invocation
 * to see fresh state, not state from import time.
 */
export interface PaletteCommand {
  id: string;
  label: string;
  keywords?: string;
  shortcut?: string;
  group: 'editor' | 'view' | 'navigate' | 'note' | 'app' | 'ai';
  run: () => void;
}

export function buildCommandCatalog(): PaletteCommand[] {
  return [
    // ─── navigate ──────────────────────────────────────────────────────────
    {
      id: 'open.search',
      label: 'Search notes',
      keywords: 'find go to find file',
      shortcut: 'Ctrl + P',
      group: 'navigate',
      run: openSearch,
    },
    {
      id: 'open.inbox',
      label: 'Open inbox',
      keywords: 'capture quick',
      shortcut: 'Ctrl + Shift + K',
      group: 'navigate',
      run: openInbox,
    },
    {
      id: 'toggle.rail',
      label: 'Toggle notes rail',
      keywords: 'sidebar hide show',
      group: 'navigate',
      run: () => useNotesRail.getState().toggle(),
    },
    {
      id: 'new.note',
      label: 'New note',
      keywords: 'create',
      group: 'navigate',
      run: () => void useTabs.getState().newNote(),
    },

    // ─── note ──────────────────────────────────────────────────────────────
    {
      id: 'note.pin.toggle',
      label: 'Toggle pin on this note',
      keywords: 'favorite star',
      group: 'note',
      run: () => {
        const n = useTabs.getState().activeNote;
        if (!n) return;
        void setNotePinned(n.id, n.pinned !== 1).then(() => useTabs.getState().refreshActiveNote());
      },
    },
    {
      id: 'note.history',
      label: 'Version history…',
      keywords: 'versions snapshots diff',
      group: 'note',
      run: openVersions,
    },
    {
      id: 'note.canvas.open',
      label: 'Open canvas (Excalidraw)',
      keywords: 'draw sketch diagram canvas excalidraw',
      group: 'note',
      run: openCanvasView,
    },
    {
      id: 'note.canvas.export',
      label: 'Export canvas as PNG',
      keywords: 'image export png canvas drawing',
      group: 'note',
      run: () => {
        if (!useCanvasView.getState().open) {
          useAIRun.getState().setToast({
            kind: 'warn',
            text: 'Open the canvas first (✎ in the tags bar) before exporting.',
          });
          return;
        }
        const exporter = (window as { __sveskaCanvasExport?: () => Promise<Blob | null> })
          .__sveskaCanvasExport;
        if (!exporter) {
          useAIRun.getState().setToast({ kind: 'error', text: 'Canvas not ready yet.' });
          return;
        }
        void exporter().then((blob) => {
          if (!blob) {
            useAIRun.getState().setToast({ kind: 'error', text: 'Canvas export failed.' });
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const note = useTabs.getState().activeNote;
          a.href = url;
          a.download = `${slugForCanvas(note?.title ?? 'sveska')}-canvas.png`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 0);
          useAIRun.getState().setToast({ kind: 'info', text: 'Canvas PNG downloaded.' });
        });
      },
    },
    {
      id: 'note.from.template',
      label: 'New note from template…',
      keywords: 'templates meeting daily retro standup brief',
      shortcut: 'Ctrl + T',
      group: 'note',
      run: () => openTemplates('templates'),
    },
    {
      id: 'snippets.manage',
      label: 'Manage snippets…',
      keywords: 'expand trigger abbreviation',
      group: 'note',
      run: () => openTemplates('snippets'),
    },
    {
      id: 'note.copy.share.link',
      label: 'Copy share link (URL hash)',
      keywords: 'share url copy link export hash',
      group: 'note',
      run: () => {
        const n = useTabs.getState().activeNote;
        if (!n || !navigator.clipboard) return;
        const url =
          window.location.origin +
          window.location.pathname +
          packShareHash({ title: n.title, body: n.body, mode: n.mode });
        void navigator.clipboard.writeText(url);
      },
    },
    {
      id: 'note.export.blog',
      label: 'Export as blog post (MDX with frontmatter)',
      keywords: 'blog mdx export frontmatter publish post',
      group: 'note',
      run: () => {
        const n = useTabs.getState().activeNote;
        if (!n) return;
        const mdx = toBlogMdx({ title: n.title, body: n.body, tags: n.tags });
        const slug = contentSlugify(n.title) || 'sveska-post';
        const blob = new Blob([mdx], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}.mdx`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
        useAIRun.getState().setToast({ kind: 'info', text: `Exported as ${slug}.mdx` });
      },
    },

    // ─── editor ────────────────────────────────────────────────────────────
    {
      id: 'export.txt',
      label: 'Export as .txt',
      keywords: 'download save plain text',
      shortcut: 'Ctrl + S',
      group: 'editor',
      run: () => useEditorCommands.getState().run('export.txt'),
    },
    {
      id: 'copy.body',
      label: 'Copy note body to clipboard',
      keywords: 'clipboard yank',
      shortcut: 'Alt + C',
      group: 'editor',
      run: () => useEditorCommands.getState().run('copy.body'),
    },
    {
      id: 'clear.body',
      label: 'Clear note body…',
      keywords: 'empty erase delete',
      shortcut: 'Ctrl + Del',
      group: 'editor',
      run: () => useEditorCommands.getState().run('clear.body.request'),
    },
    {
      id: 'insert.table',
      label: 'Insert Markdown table…',
      keywords: 'grid rows columns spreadsheet',
      group: 'editor',
      run: openTableModal,
    },

    // ─── view ──────────────────────────────────────────────────────────────
    {
      id: 'view.focus',
      label: 'Toggle focus mode',
      keywords: 'hide chrome distraction',
      shortcut: 'Alt + F',
      group: 'view',
      run: () => void useUIStore.getState().toggleFocus(),
    },
    {
      id: 'view.stats',
      label: 'Note statistics',
      keywords: 'word count reading time',
      shortcut: 'Ctrl + Shift + I',
      group: 'view',
      run: openStats,
    },

    // ─── app ───────────────────────────────────────────────────────────────
    {
      id: 'app.prefs',
      label: 'Preferences',
      keywords: 'settings font size theme',
      shortcut: 'Ctrl + ,',
      group: 'app',
      run: openPrefs,
    },
    {
      id: 'app.shortcuts',
      label: 'Keyboard shortcuts',
      keywords: 'help cheatsheet keys',
      shortcut: 'Ctrl + ?',
      group: 'app',
      run: openShortcuts,
    },

    // ─── ai (M4.T4.2) — each entry dispatches a run against active note body ──
    ...AI_COMMANDS.map(
      (cmd): PaletteCommand => ({
        id: cmd.id,
        label: cmd.label,
        keywords: `ai ${cmd.trigger} ${cmd.hint}`,
        group: 'ai',
        run: () => {
          const n = useTabs.getState().activeNote;
          if (!n) return;
          void useAIRun.getState().start(cmd.id, n.body);
        },
      }),
    ),

    // ─── ai (M4.T4.3) — Notes → image (concise + detailed) ────────────────
    ...(['concise', 'detailed'] as ImageVariant[]).map(
      (variant): PaletteCommand => ({
        id: `ai.image.${variant}`,
        label: `AI · Render as image (${variant})`,
        keywords: `image png card og share visualization ${variant}`,
        group: 'ai',
        run: () => void renderNoteAsImage(variant),
      }),
    ),
  ];
}

/** Run the AI for a structured spec, then render to PNG and download.
 *  Falls back to a best-effort spec when the proxy is unconfigured so
 *  the user still gets a card (without AI-generated copy). */
async function renderNoteAsImage(variant: ImageVariant): Promise<void> {
  const n = useTabs.getState().activeNote;
  if (!n) return;
  let specText = '';
  try {
    for await (const chunk of runAI({
      messages: [{ role: 'user', content: n.body || '(empty note)' }],
      system: specPromptFor(variant),
    })) {
      specText += chunk;
    }
    const spec = parseImageSpec(specText, variant, n.title, n.body);
    await downloadImage(spec, `${slugify(n.title || 'sveska')}-${variant}.png`);
    useAIRun.getState().setToast({ kind: 'info', text: 'Image downloaded.' });
  } catch (err) {
    const e = err as AIError;
    // Graceful degradation: render from a best-effort spec built from the
    // note itself when the proxy can't reach Anthropic.
    if (e.kind === 'unconfigured' || e.kind === 'upstream' || e.kind === 'network') {
      const spec = fallbackSpec(variant, n.title, n.body);
      await downloadImage(spec, `${slugify(n.title || 'sveska')}-${variant}.png`);
      useAIRun.getState().setToast({
        kind: 'warn',
        text: 'AI offline — rendered a basic card from the note.',
      });
      return;
    }
    useAIRun.getState().setToast({ kind: 'error', text: 'Image render failed.' });
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function slugForCanvas(s: string): string {
  return slugify(s) || 'sveska';
}
