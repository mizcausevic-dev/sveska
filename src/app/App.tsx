import { Layout } from './Layout';

export function App(): React.JSX.Element {
  return (
    <Layout>
      <article>
        <h1>
          Prazna sveska. <span className="amb">Najbolji početak.</span>
        </h1>
        <p className="lead">
          Sveska is a studio-grade, local-first, offline-first notepad. Your notes will live in your
          browser&rsquo;s storage — no account, no telemetry, no sync until you ask for it.
        </p>
        <p className="lead">
          M0/T0.1 is the boot scaffold. Theme switch lands in T0.2; routing and SEO surface land in
          T0.3.
        </p>
      </article>
    </Layout>
  );
}
