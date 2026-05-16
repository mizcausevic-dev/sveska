/**
 * Analytics seam. M0 ships ONLY the interface + a no-op provider, gated behind consent.
 * Real provider (cookieless / self-host) is decided at M6 (parking lot §9 row 4).
 * No third-party scripts in the app shell — CLAUDE.md §5.
 */

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean | null>;
}

export interface AnalyticsProvider {
  readonly id: string;
  track(event: AnalyticsEvent): void;
  pageview(path: string): void;
}

class NoopProvider implements AnalyticsProvider {
  readonly id = 'noop';
  track(_event: AnalyticsEvent): void {
    // intentionally empty
  }
  pageview(_path: string): void {
    // intentionally empty
  }
}

let _provider: AnalyticsProvider = new NoopProvider();

export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  _provider = provider;
}

export function analytics(): AnalyticsProvider {
  return _provider;
}
