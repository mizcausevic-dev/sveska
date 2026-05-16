export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms: number,
): ((...args: Args) => void) & { flush: () => void; cancel: () => void } {
  let t: ReturnType<typeof setTimeout> | null = null;
  let pending: Args | null = null;

  function wrapped(...args: Args): void {
    pending = args;
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      const a = pending;
      pending = null;
      if (a) fn(...a);
    }, ms);
  }

  wrapped.flush = (): void => {
    if (t) {
      clearTimeout(t);
      t = null;
    }
    if (pending) {
      const a = pending;
      pending = null;
      fn(...a);
    }
  };

  wrapped.cancel = (): void => {
    if (t) {
      clearTimeout(t);
      t = null;
    }
    pending = null;
  };

  return wrapped;
}
