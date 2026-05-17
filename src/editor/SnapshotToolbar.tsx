import { type SnapshotsAPI } from './useSnapshots';

interface Props {
  snapshots: SnapshotsAPI;
  onAfterRestore: (body: string) => void;
}

export function SnapshotToolbar({ snapshots, onAfterRestore }: Props): React.JSX.Element {
  const { latest, count, pending, save, restoreLast, clearAll } = snapshots;

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
        className="snap-btn snap-btn--primary"
        onClick={() => void save()}
        disabled={!pending}
        data-testid="snap-save"
      >
        Save snapshot
      </button>
      <button
        type="button"
        className="snap-btn"
        onClick={() => {
          void restoreLast().then((body) => {
            if (body !== null) onAfterRestore(body);
          });
        }}
        disabled={latest === null}
        data-testid="snap-restore"
      >
        Restore last
      </button>
      <button
        type="button"
        className="snap-btn snap-btn--danger"
        onClick={() => void clearAll()}
        disabled={count === 0}
        data-testid="snap-clear"
      >
        Clear {count > 0 && `(${count})`}
      </button>
    </div>
  );
}
