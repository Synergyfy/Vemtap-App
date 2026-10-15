import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@api/authApi';
import { ownerAuthApi } from '@api/ownerAuthApi';
import { setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';
import { useBusinessOnboardingStore } from '@store/businessOnboardingStore';
import { useRegisterOwner } from '@features/business/hooks/useOwnerRegistration';
import { logger } from '@utils/logger';

/**
 * Account-only owner setup for the wizard's entry gate.
 *
 * The gate runs before the profile screens, so there is no business to send
 * yet — only the account is created (new user) or upgraded (customer). The
 * business is created once, at the account step after Contact, from the
 * finished draft via `PATCH /businesses/my-business` (it auto-creates for an
 * owner without one). Sending the empty draft here is what produced
 * `No API category matches ""`.
 */

/** New user: verified email + password → owner account with no business yet. */
export function useRegisterOwnerAccount() {
  const registerOwner = useRegisterOwner();
  const setCredentials = useBusinessOnboardingStore(state => state.setCredentials);

  const register = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const session = await registerOwner.mutateAsync({ email, password });
      // The persisted draft no longer needs the password once the account exists.
      setCredentials({ password: undefined });
      return session;
    },
    [registerOwner, setCredentials],
  );

  return {
    register,
    isPending: registerOwner.isPending,
    error: registerOwner.error ?? null,
  };
}

/** Signed-in customer: confirm the password → the same account becomes an owner. */
export function useUpgradeToOwnerAccount() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  return useMutation<Session, Error, { password?: string }>({
    mutationFn: async ({ password }) => {
      const session = await ownerAuthApi.upgradeToOwner(password ? { password } : {});
      await setTokenPair({ accessToken: session.access_token });
      return session;
    },
    onSuccess: session => {
      setSession(session);
      // The new owner continues the wizard on the business side.
      useAuthStore.getState().setActiveMode('business');
      queryClient.invalidateQueries();
      logger.info('business', 'Customer upgraded to owner (account only)', {
        user: session.user.uniqueCode,
      });
    },
  });
}
