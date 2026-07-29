import { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { closeTableModal, useTableModal } from './tableModalStore';

export function TableModalHost({
  onInsert,
}: {
  onInsert: (rows: number, columns: number) => void;
}): React.JSX.Element {
  const open = useTableModal((state) => state.open);
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);

  return (
    <Modal
      open={open}
      onClose={closeTableModal}
      title="Insert table"
      describedById="table-modal-hint"
    >
      <p id="table-modal-hint" className="table-modal-hint">
        Creates an editable Markdown table at the current cursor.
      </p>
      <div className="table-dimensions">
        <label>
          <span>Rows</span>
          <input
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(event) => setRows(Number(event.target.value))}
            data-testid="table-rows"
          />
        </label>
        <span aria-hidden="true">×</span>
        <label>
          <span>Columns</span>
          <input
            type="number"
            min={1}
            max={12}
            value={columns}
            onChange={(event) => setColumns(Number(event.target.value))}
            data-testid="table-columns"
          />
        </label>
      </div>
      <div className="table-modal-actions">
        <button type="button" className="snap-btn" onClick={closeTableModal}>
          Cancel
        </button>
        <button
          type="button"
          className="snap-btn snap-btn--primary"
          onClick={() => {
            onInsert(rows, columns);
            closeTableModal();
          }}
          data-testid="table-insert"
        >
          Insert table
        </button>
      </div>
    </Modal>
  );
}
