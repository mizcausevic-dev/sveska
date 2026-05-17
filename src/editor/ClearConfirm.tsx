import { Modal } from '@/ui/Modal';
import { useClearConfirm } from './clearConfirmStore';

export function ClearConfirmHost(): React.JSX.Element {
  const open = useClearConfirm((s) => s.open);
  const resolve = useClearConfirm((s) => s.resolve);
  return (
    <Modal open={open} onClose={() => resolve(false)} title="Clear note?">
      <p style={{ margin: '0 0 18px', color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.55 }}>
        This deletes all text in the current note. The most recent snapshot stays intact, so you can
        restore it after.
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button
          type="button"
          className="snap-btn"
          onClick={() => resolve(false)}
          data-testid="clear-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          className="snap-btn snap-btn--danger"
          onClick={() => resolve(true)}
          data-testid="clear-confirm"
        >
          Clear note
        </button>
      </div>
    </Modal>
  );
}
