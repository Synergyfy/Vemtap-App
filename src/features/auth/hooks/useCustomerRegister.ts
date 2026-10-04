import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  customerAuthApi,
  type MessageResponse,
  type RequestSignupOtpInput,
  type ResetPinInput,
  type Session,
  type VerifyAndSetPinInput,
} from '@api/authApi';
import { setTokenPair } from '@utils/secureStorage';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

export function useRequestSignupOtp() {
  return useMutation<MessageResponse, Error, RequestSignupOtpInput>({
    mutationFn: input => customerAuthApi.requestSignupOtp(input),
  });
}

/**
 * Final customer-registration step: verifies the emailed code, sets the 6-digit
 * PIN and persists the session the API returns. This is the call that actually
 * creates the account, so it is the one that must succeed before onboarding.
 */
export function useVerifyAndSetPin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  return useMutation<Session, Error, VerifyAndSetPinInput>({
    mutationFn: async input => {
      const session = await customerAuthApi.verifyAndSetPin(input);
      await setTokenPair({ accessToken: session.access_token });
      return session;
    },
    onSuccess: session => {
      setSession(session);
      queryClient.invalidateQueries();
      logger.info('auth', 'Customer registration complete', {
        user: session.user.uniqueCode,
      });
    },
  });
}

export function useRequestPinReset() {
  return useMutation<MessageResponse, Error, { email: string }>({
    mutationFn: input => customerAuthApi.requestPinReset(input),
  });
}

/** Completes a PIN reset. The API returns no session, so the user signs in again. */
export function useResetPin() {
  return useMutation<MessageResponse, Error, ResetPinInput>({
    mutationFn: input => customerAuthApi.resetPin(input),
  });
}
