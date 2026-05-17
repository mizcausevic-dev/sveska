import { Editor } from '@/editor/Editor';
import { useSeo } from '@/platform/useSeo';

export function Home(): React.JSX.Element {
  useSeo({
    title: 'Sveska — local-first notepad',
    description:
      'A studio-grade, offline-first notepad. Notes, Markdown, canvas — all local. No account required.',
    canonical: 'https://sveska.studio/',
  });
  return <Editor />;
}
