import { useNavigation, type NavigationProp } from '@react-navigation/native';

/**
 * React Navigation throws when a screen is rendered outside a NavigationContainer.
 * Some route wrappers are reused in tests and app boot flows before their owning
 * navigator is mounted, so fall back to no-op navigation instead of crashing the
 * shell.
 */
export function useOptionalNavigation<T extends NavigationProp<any>>(): T {
  try {
    return useNavigation<T>();
  } catch {
    return {
      navigate: () => undefined,
      goBack: () => undefined,
      push: () => undefined,
      replace: () => undefined,
      reset: () => undefined,
      setParams: () => undefined,
      dispatch: () => undefined,
      canGoBack: () => false,
      isFocused: () => false,
      getParent: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      getState: () => undefined,
    } as unknown as T;
  }
}
