import { useMutation, useQueryClient } from '@tanstack/react-query';
// TODO(auth-api): re-enable server logout when the API is plugged in.
// import { authApi } from '@api/authApi';
import { clearSecureStorage } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      // Server logout disabled until the API is wired — local clear always runs
      // so the user is never stuck in AppStack.
      // try {
      //   await authApi.logout();
      // } finally {
      await clearSecureStorage();
      // }
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
