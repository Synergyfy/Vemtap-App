import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/types';

type NavigationRef = ReturnType<typeof createNavigationContainerRef<RootStackParamList>>;

/**
 * Root navigation handle for side effects that outlive a screen (login
 * reconciliation, role switching). Kept out of hooks so services can navigate
 * without importing React Navigation hooks.
 *
 * Some unit tests mock `@react-navigation/native` with only the hooks they use,
 * so the ref creation is guarded — importing a screen must never crash a test.
 */
export const navigationRef: NavigationRef | undefined =
  typeof createNavigationContainerRef === 'function'
    ? createNavigationContainerRef<RootStackParamList>()
    : undefined;
