import { useCallback, useEffect, useRef, useState } from 'react';

/** Returns `value` only after it has stayed stable for `delayMs`. */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/** Stable debounced callback with cancellation on unmount. */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delayMs = 400,
): ((...args: A) => void) & { cancel: () => void } {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const debounced = useCallback(
    (...args: A) => {
      cancel();
      timerRef.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [cancel, delayMs],
  );

  return Object.assign(debounced, { cancel });
}
