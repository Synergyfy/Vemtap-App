import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type RegisterInput, type Session } from '@api/authApi';
import { setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';

export type { RegisterInput };

export function useRegister() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  return useMutation<Session, Error, RegisterInput>({
    mutationFn: async input => {
      const session = await authApi.register(input);
      await setTokenPair({ accessToken: session.access_token });
      return session;
    },
    onSuccess: session => {
      setSession(session);
      queryClient.invalidateQueries();
    },
  });
}
