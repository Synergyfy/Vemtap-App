import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  verificationApi,
  type VerificationCheck,
  type VerificationStatus,
  type VerifyIdentityInput,
} from '@api/verificationApi';
import { businessDashboardKeys } from '@features/business/hooks/useBusinessDashboardData';

/** Where bytID sends the person after the selfie check. */
export const LIVENESS_RETURN_URL = 'vemtap://verification/liveness';

export const verificationKeys = {
  status: () => ['verification', 'status'] as const,
};

export function useVerificationStatus(enabled = true) {
  return useQuery<VerificationStatus>({
    queryKey: verificationKeys.status(),
    queryFn: () => verificationApi.status(),
    enabled,
    staleTime: 30_000,
  });
}

/**
 * Run the hosted bytID selfie check and resolve with its session id. The
 * session is judged when the ID is submitted, so a person who closes the page
 * early gets a clear "take the selfie again" error from that call.
 */
export function useLivenessCheck() {
  return useMutation({
    mutationFn: async (): Promise<{ sessionId: string; completed: boolean }> => {
      const session = await verificationApi.startLiveness(LIVENESS_RETURN_URL);
      const result = await WebBrowser.openAuthSessionAsync(
        session.url,
        LIVENESS_RETURN_URL,
      );
      return { sessionId: session.sessionId, completed: result.type === 'success' };
    },
  });
}

function useVerificationMutation<TInput>(
  run: (input: TInput) => Promise<VerificationCheck>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.status() });
      // The business badge on the dashboard follows verification.
      queryClient.invalidateQueries({
        queryKey: businessDashboardKeys.myBusiness(),
      });
    },
  });
}

export function useVerifyIdentity() {
  return useVerificationMutation((input: VerifyIdentityInput) =>
    verificationApi.verifyIdentity(input),
  );
}

export function useVerifyBusiness() {
  return useVerificationMutation((registrationNumber: string) =>
    verificationApi.verifyBusiness(registrationNumber),
  );
}

export function useSubmitUnregisteredBusiness() {
  return useVerificationMutation((input: { note?: string; documentUrls?: string[] }) =>
    verificationApi.submitUnregistered(input),
  );
}

export function useRequestManualReview() {
  return useVerificationMutation((input: { checkId?: string; note?: string }) =>
    verificationApi.requestManualReview(input),
  );
}
