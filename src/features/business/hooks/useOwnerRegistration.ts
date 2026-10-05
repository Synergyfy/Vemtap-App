import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  isOtpVerifiedError,
  ownerAuthApi,
  type OwnerOtpRequest,
  type OwnerOtpVerify,
  type OwnerRegistration,
} from '@api/ownerAuthApi';
import type { Session } from '@api/authApi';
import { setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

/**
 * Business-owner registration, as three ordered steps. The API enforces the
 * ordering — `registerOwner` 400s with "OTP must be verified before completing
 * registration" unless `verifyOtp` has already run for that email — so callers
 * must not collapse these into one submit.
 *
 * The profile screens collect business fields that are *not* sent by steps 1 or
 * 2; they ride along on `ownerRegistration` at step 3.
 */

/** Step 1 — emails the code. The API requires the `Owner` role. */
export function useRequestOwnerOtp() {
  return useMutation<void, Error, OwnerOtpRequest>({
    mutationFn: input => ownerAuthApi.requestOwnerOtp(input),
  });
}

/** Step 2 — 4-character code. Does not create the account. */
export function useVerifyOwnerOtp() {
  return useMutation<void, Error, OwnerOtpVerify>({
    mutationFn: input => ownerAuthApi.verifyOtp(input),
  });
}

/**
 * Step 3 — creates the owner and their business in one call, and persists the
 * returned session. Like the customer equivalent this avoids `setSession`,
 * because that flips RootNavigator away from the setup stack before the
 * remaining setup screens can run.
 */
export function useRegisterOwner() {
  const queryClient = useQueryClient();
  const beginOnboarding = useAuthStore(state => state.beginOnboarding);

  return useMutation<Session, Error, OwnerRegistration>({
    mutationFn: async input => {
      const session = await ownerAuthApi.registerOwner(input);
      await setTokenPair({ accessToken: session.access_token });
      return session;
    },
    onSuccess: session => {
      beginOnboarding(session);
      queryClient.invalidateQueries();
      logger.info('auth', 'Owner registration complete', {
        user: session.user.uniqueCode,
      });
    },
  });
}

/**
 * The API's error for an unverified OTP is the only signal the client gets that
 * step 2 was skipped, so the screens use this to route the user back rather than
 * showing a generic failure.
 */
export function useOwnerRegistrationNeedsOtp(error: unknown): boolean {
  return isOtpVerifiedError(error);
}

/** Owner-facing "is my business approved yet" check, for the status centre. */
export function useAccountStatus(identifier: string | null) {
  return useQuery({
    queryKey: ['auth', 'account-status', identifier],
    queryFn: () => ownerAuthApi.checkStatus(identifier as string),
    enabled: Boolean(identifier),
    // An approval can land at any time, so poll rather than cache a stale 'no'.
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
