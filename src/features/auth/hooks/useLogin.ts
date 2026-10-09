import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginInput, type Session } from '@api/authApi';
import { getSecureItem, setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';
import { navigationRef } from '@navigation/navigationRef';
import { logger } from '@utils/logger';

/**
 * Restore the side of a dual-role account the user last used. Only owners have
 * two sides: a pure customer login ignores `activeMode` entirely.
 */
async function reconcileActiveMode(session: Session) {
  const isOwner = session.user.role?.toLowerCase() === 'owner';
  if (!isOwner) return;

  const { activeMode } = useAuthStore.getState();

  if (activeMode === 'business') {
    if (navigationRef?.isReady()) {
      navigationRef.navigate('BusinessTabs', { screen: 'BusinessOverview' });
    }
    return;
  }

  // Last used the customer side: swap to a customer-scoped token so
  // customer-only endpoints authorize (the login token carries the DB role).
  try {
    const scoped = await authApi.switchRole({ role: 'Customer' });
    await setTokenPair({ accessToken: scoped.access_token });
    useAuthStore.getState().applyRoleSwitch(scoped.user, 'customer');
  } catch (error) {
    logger.warn('auth', 'Could not restore last-used customer mode after login', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  const mutation = useMutation<Session, Error, LoginInput>({
    mutationFn: async input => {
      const session = await authApi.login(input);
      await setTokenPair({ accessToken: session.access_token });
      return session;
    },
    onSuccess: session => {
      setSession(session);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      logger.info('auth', 'Login succeeded', { user: session.user.uniqueCode });
      reconcileActiveMode(session).catch(error =>
        logger.warn('auth', 'Active-mode reconciliation failed', {
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    },
  });

  return mutation;
}

export function useBootstrapSession() {
  const markUnauthenticated = useAuthStore(state => state.markUnauthenticated);

  return useCallback(async () => {
    const token = await getSecureItem('accessToken');
    if (!token) {
      markUnauthenticated();
      return false;
    }
    return true;
  }, [markUnauthenticated]);
}
