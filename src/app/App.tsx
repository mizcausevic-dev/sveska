import { Layout } from './Layout';
import { KeyBindings } from './KeyBindings';
import { PrefsModalHost } from '@/ui/PrefsModal';

export function App(): React.JSX.Element {
  return (
    <>
      <Layout>
        <article>
          <h1>
            Prazna sveska. <span className="amb">Najbolji početak.</span>
          </h1>
          <p className="lead">
            Sveska is a studio-grade, local-first, offline-first notepad. Your notes will live in
            your browser&rsquo;s storage — no account, no telemetry, no sync until you ask for it.
          </p>
          <p className="lead">
            M0/T0.2 wires the theme switch and the <span className="kbd">Ctrl + ,</span> preferences
            shell. Routing and the platform surface land in T0.3.
          </p>
        </article>
      </Layout>
      <KeyBindings />
      <PrefsModalHost />
    </>
  );
}
