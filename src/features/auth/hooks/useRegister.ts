import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type Session } from '@api/authApi';
import { setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';

interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  return useMutation<Session, Error, RegisterInput>({
    mutationFn: async input => {
      const session = await authApi.register(input);
      await setTokenPair({
        accessToken: session.tokens.accessToken,
        refreshToken: session.tokens.refreshToken,
      });
      return session;
    },
    onSuccess: session => {
      setSession(session);
      queryClient.invalidateQueries();
    },
  });
}
