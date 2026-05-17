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
