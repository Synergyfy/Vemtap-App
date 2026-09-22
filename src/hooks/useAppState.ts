import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/** Fires `onChange` whenever the app moves between active/background/inactive. */
export function useAppState(onChange?: (status: AppStateStatus) => void): AppStateStatus {
  const [status, setStatus] = useState<AppStateStatus>(
    () => (AppState.currentState as AppStateStatus | null | undefined) ?? 'active',
  );
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      setStatus(next);
      onChangeRef.current?.(next);
    });
    return () => subscription.remove();
  }, []);

  return status;
}

/** True while the app is in the foreground. */
export function useIsAppActive(): boolean {
  return useAppState() === 'active';
}

export function useAppReadyCallback(callback: () => void): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  useAppState(status => {
    if (status === 'active') {
      cbRef.current();
    }
  });
}

export function useStableCallback<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: A) => ref.current(...args), []);
}
