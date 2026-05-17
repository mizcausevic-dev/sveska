import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { closeTemplates, useTemplatesModal, type TemplatesTab } from './templatesModalStore';
import { createUserTemplate, deleteUserTemplate, listTemplates } from '@/notes/templatesRepo';
import { createSnippet, deleteSnippet, listSnippets } from '@/notes/snippetsRepo';
import { createNote } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { type Snippet, type Template } from '@/notes/db';

/**
 * Templates + Snippets modal (M3.T3.4). Two tabs:
 *   - **Templates** — built-in + user templates; "New note from template"
 *     creates a fresh note prefilled with the template body and opens it.
 *   - **Snippets** — trigger + body rows; in-editor typeahead expands the
 *     trigger to the body when typed. Add / delete inline.
 */
export function TemplatesModalHost(): React.JSX.Element {
  const open = useTemplatesModal((s) => s.open);
  const tab = useTemplatesModal((s) => s.tab);
  const setTab = useTemplatesModal((s) => s.setTab);
  const openNote = useTabs((s) => s.openNote);
  const refreshActiveNote = useTabs((s) => s.refreshActiveNote);

  return (
    <Modal open={open} onClose={closeTemplates} title="Templates" describedById="templates-hint">
      <p id="templates-hint" className="visually-hidden">
        Templates create new notes with a prefilled body. Snippets expand a typed trigger into a
        body in the editor.
      </p>
      <div className="templates-shell">
        <div className="templates-tabs" role="tablist">
          <TabBtn current={tab} value="templates" onChange={setTab}>
            Templates
          </TabBtn>
          <TabBtn current={tab} value="snippets" onChange={setTab}>
            Snippets
          </TabBtn>
        </div>
        {tab === 'templates' ? (
          <TemplatesPanel
            onApply={async (t) => {
              const note = await createNote({
                title: t.name,
                body: t.body,
                mode: t.body.includes('- [ ]') ? 'checklist' : 'md',
              });
              closeTemplates();
              await openNote(note.id);
              await refreshActiveNote();
            }}
          />
        ) : (
          <SnippetsPanel />
        )}
      </div>
    </Modal>
  );
}

function TabBtn({
  current,
  value,
  onChange,
  children,
}: {
  current: TemplatesTab;
  value: TemplatesTab;
  onChange: (v: TemplatesTab) => void;
  children: React.ReactNode;
}): React.JSX.Element {
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`templates-tab${active ? ' templates-tab--active' : ''}`}
      onClick={() => onChange(value)}
      data-testid={`templates-tab-${value}`}
    >
      {children}
    </button>
  );
}

function TemplatesPanel({
  onApply,
}: {
  onApply: (t: Template) => Promise<void>;
}): React.JSX.Element {
  const [items, setItems] = useState<Template[]>([]);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');

  async function refresh(): Promise<void> {
    setItems(await listTemplates());
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function onCreate(): Promise<void> {
    if (!name.trim()) return;
    await createUserTemplate(name, body);
    setName('');
    setBody('');
    await refresh();
  }
  async function onDelete(id: string): Promise<void> {
    await deleteUserTemplate(id);
    await refresh();
  }

  return (
    <div className="templates-panel">
      <ul className="templates-list" data-testid="templates-list">
        {items.map((t) => (
          <li key={t.id} className="templates-row" data-testid={`template-row-${t.id}`}>
            <div className="templates-row-main">
              <span className="templates-row-name">{t.name}</span>
              <span className="templates-row-kind mono">{t.kind}</span>
            </div>
            <span className="templates-row-actions">
              <button
                type="button"
                className="snap-btn snap-btn--primary"
                onClick={() => void onApply(t)}
                data-testid={`template-apply-${t.id}`}
              >
                New note
              </button>
              {t.kind === 'user' && (
                <button
                  type="button"
                  className="snap-btn snap-btn--danger"
                  onClick={() => void onDelete(t.id)}
                  data-testid={`template-delete-${t.id}`}
                  title="Delete"
                >
                  ×
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="templates-form">
        <input
          type="text"
          className="search-input"
          placeholder="New template name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="template-name-input"
        />
        <textarea
          className="templates-body-input"
          placeholder="Template body — write Markdown or checklists here."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          data-testid="template-body-input"
        />
        <button
          type="button"
          className="snap-btn snap-btn--primary"
          onClick={() => void onCreate()}
          disabled={!name.trim()}
          data-testid="template-create"
        >
          Save template
        </button>
      </div>
    </div>
  );
}

function SnippetsPanel(): React.JSX.Element {
  const [items, setItems] = useState<Snippet[]>([]);
  const [trigger, setTrigger] = useState('');
  const [body, setBody] = useState('');

  async function refresh(): Promise<void> {
    setItems(await listSnippets());
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function onCreate(): Promise<void> {
    if (!trigger.trim()) return;
    await createSnippet(trigger, body);
    setTrigger('');
    setBody('');
    await refresh();
  }
  async function onDelete(id: string): Promise<void> {
    await deleteSnippet(id);
    await refresh();
  }

  return (
    <div className="templates-panel">
      <ul className="templates-list" data-testid="snippets-list">
        {items.map((s) => (
          <li key={s.id} className="templates-row" data-testid={`snippet-row-${s.id}`}>
            <div className="templates-row-main">
              <span className="templates-row-name mono">{s.trigger}</span>
              <span className="templates-row-kind">{s.body.slice(0, 40)}</span>
            </div>
            <button
              type="button"
              className="snap-btn snap-btn--danger"
              onClick={() => void onDelete(s.id)}
              data-testid={`snippet-delete-${s.id}`}
              title="Delete"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="templates-form">
        <input
          type="text"
          className="search-input"
          placeholder="Trigger (e.g. ;sig)"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          data-testid="snippet-trigger-input"
        />
        <textarea
          className="templates-body-input"
          placeholder="Expansion body — what the trigger gets replaced with."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          data-testid="snippet-body-input"
        />
        <button
          type="button"
          className="snap-btn snap-btn--primary"
          onClick={() => void onCreate()}
          disabled={!trigger.trim()}
          data-testid="snippet-create"
        >
          Save snippet
        </button>
      </div>
    </div>
  );
}
