import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginInput, type Session } from '@api/authApi';
import { setTokenPair, getSecureItem } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  const mutation = useMutation<Session, Error, LoginInput>({
    mutationFn: async input => {
      const session = await authApi.login(input);
      // Tokens → Keychain only (never MMKV / Zustand / Redux).
      await setTokenPair({
        accessToken: session.tokens.accessToken,
        refreshToken: session.tokens.refreshToken,
      });
      return session;
    },
    onSuccess: session => {
      setSession(session);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      logger.info('auth', 'Login succeeded', { userId: session.user.id });
    },
  });

  return mutation;
}

export function useBootstrapSession() {
  const markUnauthenticated = useAuthStore(state => state.markUnauthenticated);

  return useCallback(async () => {
    const token = await getSecureItem('accessToken');
    if (token) {
      // Token present — hydrate profile from /auth/me here when available.
      // Until then, keep the user unauthenticated so AuthStack shows.
      markUnauthenticated();
      return;
    }
    markUnauthenticated();
  }, [markUnauthenticated]);
}
