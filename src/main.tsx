import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/tokens.css';
import './styles/fonts.css';
import './styles/global.css';

import { App } from '@/app/App';
import { bootstrapTheme } from '@/notes/themeStore';
import { bootstrapUI } from '@/notes/uiStore';

async function bootstrap(): Promise<void> {
  // Hydrate theme from Dexie before first paint to avoid a flash when the user
  // has explicitly chosen a non-default theme. Default render is dark — if IDB
  // is unavailable or empty, we stay on dark, which is the default anyway.
  try {
    await Promise.all([bootstrapTheme(), bootstrapUI()]);
  } catch (err) {
    console.warn('[sveska] bootstrap failed, falling back to defaults:', err);
  }

  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Sveska: #root not found in index.html');

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
