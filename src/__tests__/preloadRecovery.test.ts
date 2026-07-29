import { describe, expect, it, vi } from 'vitest';
import {
  buildRecoveryUrl,
  createPreloadErrorHandler,
  wasRecentlyRecovered,
} from '@/app/preloadRecovery';

function memoryStorage(): {
  storage: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
  };
  values: Map<string, string>;
} {
  const values = new Map<string, string>();
  return {
    values,
    storage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        values.set(key, value);
      },
    },
  };
}

describe('stale lazy-chunk recovery', () => {
  it('adds a cache-busting recovery marker without dropping existing query state', () => {
    expect(buildRecoveryUrl('https://sveska.studio/?source=pwa', 1234)).toBe(
      'https://sveska.studio/?source=pwa&sveska-reload=1234',
    );
  });

  it('recognizes a recent recovery from either the URL or session storage', () => {
    const { storage, values } = memoryStorage();
    expect(wasRecentlyRecovered('https://sveska.studio/?sveska-reload=900', storage, 1000)).toBe(
      true,
    );

    values.set('sveska:preload-recovery-at', '950');
    expect(wasRecentlyRecovered('https://sveska.studio/', storage, 1000)).toBe(true);
    expect(wasRecentlyRecovered('https://sveska.studio/', storage, 61_001)).toBe(false);
  });

  it('cancels the first Vite preload error and starts one recovery', async () => {
    const { storage, values } = memoryStorage();
    const recover = vi.fn().mockResolvedValue(undefined);
    const handler = createPreloadErrorHandler({
      now: () => 10_000,
      href: () => 'https://sveska.studio/',
      storage,
      recover,
    });
    const event = new Event('vite:preloadError', { cancelable: true });

    handler(event);
    await Promise.resolve();

    expect(event.defaultPrevented).toBe(true);
    expect(values.get('sveska:preload-recovery-at')).toBe('10000');
    expect(recover).toHaveBeenCalledWith(10_000);
  });

  it('does not cancel or repeat a second failure inside the recovery window', () => {
    const { storage, values } = memoryStorage();
    values.set('sveska:preload-recovery-at', '10000');
    const recover = vi.fn().mockResolvedValue(undefined);
    const handler = createPreloadErrorHandler({
      now: () => 10_500,
      href: () => 'https://sveska.studio/',
      storage,
      recover,
    });
    const event = new Event('vite:preloadError', { cancelable: true });

    handler(event);

    expect(event.defaultPrevented).toBe(false);
    expect(recover).not.toHaveBeenCalled();
  });
});
