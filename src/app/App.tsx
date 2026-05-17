import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from '@/routes/Home';
import { Glossary } from '@/routes/Glossary';
import { ShareTarget } from '@/routes/ShareTarget';
import { NotFound } from '@/routes/NotFound';
import { PrefsModalHost } from '@/ui/PrefsModal';
import { ShortcutsModalHost } from '@/ui/ShortcutsModal';
import { SearchModalHost } from '@/ui/SearchModal';
import { InboxModalHost } from '@/ui/InboxModal';
import { CommandPaletteHost } from '@/ui/CommandPalette';
import { TemplatesModalHost } from '@/ui/TemplatesModal';
import { useEffect } from 'react';
import { seedBuiltinTemplates } from '@/notes/templatesRepo';
import { seedBuiltinSnippets } from '@/notes/snippetsRepo';
import { parseShareHash } from '@/lib/hashShare';
import { createNote } from '@/notes/noteRepo';
import { useTabs } from '@/notes/tabsStore';
import { KeyBindings } from './KeyBindings';
import { UpdateBanner } from './UpdateBanner';
import { ConsentBar } from '@/platform/ConsentBar';

export function App(): React.JSX.Element {
  // T3.4 — seed built-in templates + snippets once on mount. Both seeders are
  // idempotent (stable IDs / dedupe by trigger), so re-runs are no-ops.
  useEffect(() => {
    void seedBuiltinTemplates();
    void seedBuiltinSnippets();
  }, []);

  // T3.7 — share-via-URL hash: if the page loaded with #note=<...>, decode
  // the payload, create a fresh note, open it in a tab, then strip the
  // hash so a refresh doesn't re-import. Hash never hits the server.
  useEffect(() => {
    const shared = parseShareHash(window.location.hash);
    if (!shared) return;
    void (async () => {
      const note = await createNote({
        title: shared.title || 'Shared note',
        body: shared.body,
        mode: shared.mode,
      });
      // Make sure the tabs store is bootstrapped before we openNote.
      if (!useTabs.getState().ready) await useTabs.getState().bootstrap();
      await useTabs.getState().openNote(note.id);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    })();
  }, []);
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/share-target" element={<ShareTarget />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <KeyBindings />
      <PrefsModalHost />
      <ShortcutsModalHost />
      <SearchModalHost />
      <InboxModalHost />
      <CommandPaletteHost />
      <TemplatesModalHost />
      <UpdateBanner />
      <ConsentBar />
    </BrowserRouter>
  );
}
