import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from '@/routes/Home';
import { Glossary } from '@/routes/Glossary';
import { ShareTarget } from '@/routes/ShareTarget';
import { NotFound } from '@/routes/NotFound';
import { PrefsModalHost } from '@/ui/PrefsModal';
import { ShortcutsModalHost } from '@/ui/ShortcutsModal';
import { KeyBindings } from './KeyBindings';
import { UpdateBanner } from './UpdateBanner';
import { ConsentBar } from '@/platform/ConsentBar';

export function App(): React.JSX.Element {
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
      <UpdateBanner />
      <ConsentBar />
    </BrowserRouter>
  );
}
