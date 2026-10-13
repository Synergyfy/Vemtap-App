import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type Session } from '@api/authApi';
import { setTokenPair } from '@utils/secureStorage';
import { useAuthStore, type ActiveMode } from '@store/authStore';
import { logger } from '@utils/logger';

/**
 * Flip a dual-role account between its customer and business sides.
 *
 * The API returns a scoped session — CUSTOMER tokens carry no business context
 * so customer-only endpoints authorize correctly — and the new token replaces
 * the stored one. The auth store keeps `ownerAccount: true` so the UI still
 * offers the way back.
 */
export function useSwitchRole() {
  const queryClient = useQueryClient();
  const applyRoleSwitch = useAuthStore(state => state.applyRoleSwitch);

  return useMutation<Session, Error, ActiveMode>({
    mutationFn: async mode => {
      const session = await authApi.switchRole({
        role: mode === 'business' ? 'Owner' : 'Customer',
      });
      await setTokenPair({ accessToken: session.access_token });
      useAuthStore.getState().setTokenRole(session.user.role ?? null);
      return session;
    },
    onSuccess: (session, mode) => {
      applyRoleSwitch(session.user, mode);
      queryClient.invalidateQueries();
      logger.info('auth', 'Role switched', { mode, user: session.user.uniqueCode });
    },
  });
}
