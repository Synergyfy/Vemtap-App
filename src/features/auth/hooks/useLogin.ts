import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginInput, type Session } from '@api/authApi';
import { getSecureItem, setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

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
