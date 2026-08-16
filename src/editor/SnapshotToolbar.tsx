import { type SnapshotsAPI } from './useSnapshots';
import { openVersions } from './versionsModalStore';

interface Props {
  snapshots: SnapshotsAPI;
  /** Receives the restored body when the user picks a snapshot in the history modal. */
  onAfterRestore: (body: string) => void;
}

export function SnapshotToolbar({ snapshots, onAfterRestore }: Props): React.JSX.Element {
  // Mark intentionally-unused-here — VersionsModalHost in Editor.tsx owns
  // the restore + body-update flow now. Retained on the API so the editor
  // can still feed setBody into the modal host.
  void onAfterRestore;
  const { latest, count, pending, save, clearAll } = snapshots;

  const stamp =
    latest === null
      ? 'no snapshot yet'
      : `last · ${new Date(latest.snapshotAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`;

  return (
    <div className="snap-toolbar" role="toolbar" aria-label="Snapshots">
      <span
        className={`snap-dot snap-dot--${pending ? 'pending' : latest === null ? 'idle' : 'saved'}`}
        aria-hidden="true"
        data-testid="snap-dot"
      />
      <span className="snap-label mono">
        snapshot · <span className="snap-stamp">{stamp}</span>
        {count > 0 && <span className="snap-count"> · {count} total</span>}
      </span>
      <span className="snap-spacer" />
      <button
        type="button"
        className="snap-btn fx-layer fx-scanline snap-btn--primary"
        onClick={() => void save()}
        disabled={!pending}
        data-testid="snap-save"
      >
        Save snapshot
      </button>
      <button
        type="button"
        className="snap-btn fx-layer fx-scanline"
        onClick={openVersions}
        disabled={count === 0}
        data-testid="snap-history"
        title="Browse version history + diff"
      >
        History {count > 0 && `(${count})`}
      </button>
      <button
        type="button"
        className="snap-btn fx-layer fx-scanline snap-btn--danger"
        onClick={() => void clearAll()}
        disabled={count === 0}
        data-testid="snap-clear"
      >
        Clear
      </button>
    </div>
  );
}
