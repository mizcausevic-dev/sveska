import { clearDraft } from '@/notes/draftRepo';
import { saveNoteBody } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { useDraftRecovery } from './draftRecoveryStore';

interface Props {
  /** Editor passes its setBody so Keep can hydrate the textarea. */
  onKeep: (body: string) => void;
}

export function DraftRecoveryBanner({ onKeep }: Props): React.JSX.Element | null {
  const pending = useDraftRecovery((s) => s.pending);
  const clearPending = useDraftRecovery((s) => s.clear);
  const refreshActiveNote = useTabs((s) => s.refreshActiveNote);

  if (!pending) return null;

  const stamp = new Date(pending.savedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  async function keep(): Promise<void> {
    if (!pending) return;
    // Adopt the shadow body as the source of truth: write it back to the note
    // and clear the shadow so we don't prompt again on the next reload.
    onKeep(pending.draftBody);
    await saveNoteBody(pending.noteId, pending.draftBody);
    await clearDraft(pending.noteId);
    await refreshActiveNote();
    clearPending();
  }

  async function discard(): Promise<void> {
    if (!pending) return;
    await clearDraft(pending.noteId);
    clearPending();
  }

  return (
    <div
      className="draft-banner"
      role="status"
      aria-live="polite"
      data-testid="draft-recovery-banner"
    >
      <span className="draft-banner-text">
        Recovered an unsaved draft from <span className="mono">{stamp}</span>.
      </span>
      <span className="draft-banner-actions">
        <button
          type="button"
          className="snap-btn"
          onClick={() => void discard()}
          data-testid="draft-discard"
        >
          Discard
        </button>
        <button
          type="button"
          className="snap-btn snap-btn--primary"
          onClick={() => void keep()}
          data-testid="draft-keep"
        >
          Keep
        </button>
      </span>
    </div>
  );
}
