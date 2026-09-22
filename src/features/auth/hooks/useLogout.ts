import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@api/authApi';
import { clearSecureStorage } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        await clearSecureStorage();
      }
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
