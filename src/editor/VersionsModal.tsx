import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/ui/Modal';
import { type Version } from '@/notes/db';
import { listSnapshots, restoreSnapshot } from '@/notes/snapshotRepo';
import { useTabs } from '@/notes/tabsStore';
import { diffLines, summarizeDiff, type DiffRow } from '@/lib/diff';
import { closeVersions, useVersionsModal } from './versionsModalStore';

interface VersionsModalHostProps {
  /** The current live body in the textarea (right-hand side of the diff). */
  liveBody: string;
  /** Callback so the editor can update its body when the user restores. */
  onRestore: (body: string) => void;
}

export function VersionsModalHost({
  liveBody,
  onRestore,
}: VersionsModalHostProps): React.JSX.Element {
  const open = useVersionsModal((s) => s.open);
  const activeNote = useTabs((s) => s.activeNote);
  const refreshActiveNote = useTabs((s) => s.refreshActiveNote);

  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load snapshots whenever the modal opens or the active note changes.
  useEffect(() => {
    if (!open || !activeNote) return;
    void (async () => {
      const all = await listSnapshots(activeNote.id);
      setVersions(all);
      setSelectedId(all[0]?.id ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeNote?.id]);

  const selected = useMemo(
    () => versions.find((v) => v.id === selectedId) ?? null,
    [versions, selectedId],
  );

  const rows = useMemo<DiffRow[]>(() => {
    if (!selected) return [];
    return diffLines(selected.body, liveBody);
    // selected.id is the stable identity; we don't want to re-diff on every
    // re-render that produces a new `selected` object reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, liveBody]);

  const summary = useMemo(() => summarizeDiff(rows), [rows]);

  async function handleRestore(): Promise<void> {
    if (!selected) return;
    const result = await restoreSnapshot(selected.id);
    if (result) {
      onRestore(result.body);
      await refreshActiveNote();
      closeVersions();
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeVersions}
      title="Version history"
      describedById="versions-hint"
    >
      <p id="versions-hint" className="visually-hidden">
        Snapshots of the current note. Select one to compare against the live body and restore.
      </p>
      {versions.length === 0 ? (
        <div className="versions-empty" data-testid="versions-empty">
          <p className="lead" style={{ margin: 0 }}>
            No snapshots yet for this note. Save one via the toolbar to start a history.
          </p>
        </div>
      ) : (
        <div className="versions" data-testid="versions">
          <ol className="versions-list" data-testid="versions-list">
            {versions.map((v) => {
              const isSel = v.id === selectedId;
              const firstLine = v.body.split('\n')[0]?.slice(0, 60) || '(empty)';
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    className={`versions-item${isSel ? ' versions-item--active' : ''}`}
                    onClick={() => setSelectedId(v.id)}
                    data-testid={`version-${v.id}`}
                  >
                    <span className="versions-stamp mono">
                      {new Date(v.snapshotAt).toLocaleString([], {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="versions-preview">{firstLine}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="versions-diff">
            <header className="versions-diff-head">
              <span className="mono">
                <span style={{ color: 'var(--danger)' }}>− {summary.removed}</span>{' '}
                <span style={{ color: 'var(--ok)' }}>+ {summary.added}</span>{' '}
                <span className="dim">/ {summary.unchanged} unchanged</span>
              </span>
              <button
                type="button"
                className="snap-btn snap-btn--primary"
                onClick={() => void handleRestore()}
                disabled={!selected}
                data-testid="versions-restore"
              >
                Restore this version
              </button>
            </header>
            <div className="versions-diff-body" data-testid="versions-diff-body">
              <div className="versions-diff-col">
                <div className="versions-diff-label mono">snapshot</div>
                {rows.map((r, i) => (
                  <DiffSideRow key={`L${i}`} side={r.left} kind="left" />
                ))}
              </div>
              <div className="versions-diff-col">
                <div className="versions-diff-label mono">live</div>
                {rows.map((r, i) => (
                  <DiffSideRow key={`R${i}`} side={r.right} kind="right" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DiffSideRow({
  side,
  kind,
}: {
  side: { text: string | null; type: 'eq' | 'del' | 'add' | null; num: number | null };
  kind: 'left' | 'right';
}): React.JSX.Element {
  const cls = side.type ? `diff-line diff-line--${side.type}` : 'diff-line diff-line--gap';
  const marker = side.type === 'del' ? '−' : side.type === 'add' ? '+' : ' ';
  return (
    <div className={cls} data-kind={kind}>
      <span className="diff-gutter">{side.num ?? ''}</span>
      <span className="diff-marker" aria-hidden="true">
        {marker}
      </span>
      <span className="diff-text">{side.text}</span>
    </div>
  );
}
