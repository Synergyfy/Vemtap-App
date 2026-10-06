import { useCallback, useState } from 'react';
import { claimApi } from '@api/claimApi';
import { ApiError } from '@api/ApiError';
import { logger } from '@utils/logger';

/**
 * Claiming a real offer.
 *
 * Two steps, and the hook owns the state machine so a screen can render the
 * steps without knowing the API:
 *
 *   1. `requestCode` emails an OTP to the claimant.
 *   2. `submitCode` trades it for a claim code the merchant redeems in person.
 *
 * A claim only counts once step 2 returns — that is the whole point of the
 * change. Previously the screen set `claimed` locally and navigated to a success
 * page for any offer, so a user could "claim" a promotion that was never issued.
 */
export type ClaimStatus =
  | { phase: 'idle' }
  | { phase: 'requesting' }
  | { phase: 'awaitingCode'; email: string }
  | { phase: 'verifying' }
  | { phase: 'claimed'; claimCode: string; expiresAt?: string }
  | { phase: 'error'; message: string; retryable: boolean };

export type ClaimIdentity = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export function useOfferClaim(offerId: string) {
  const [status, setStatus] = useState<ClaimStatus>({ phase: 'idle' });

  const requestCode = useCallback(
    async (identity: ClaimIdentity) => {
      setStatus({ phase: 'requesting' });
      try {
        await claimApi.requestClaimOtp({ offerId, ...identity });
        setStatus({ phase: 'awaitingCode', email: identity.email });
      } catch (error) {
        logger.warn('api', 'Claim OTP request failed', { offerId, error });
        setStatus({
          phase: 'error',
          message: readableMessage(error, 'We could not send the code. Try again.'),
          retryable: true,
        });
      }
    },
    [offerId],
  );

  const submitCode = useCallback(
    async (code: string) => {
      const { email } = status.phase === 'awaitingCode' ? status : { email: null };
      if (!email) {
        setStatus({
          phase: 'error',
          message: 'Request a code first.',
          retryable: true,
        });
        return;
      }

      setStatus({ phase: 'verifying' });
      try {
        const verified = await claimApi.verifyClaim({ email, offerId, code });
        setStatus({
          phase: 'claimed',
          claimCode: verified.claim.claimCode,
          expiresAt: verified.claim.expiresAt ?? undefined,
        });
      } catch (error) {
        logger.warn('api', 'Claim code rejected', { offerId, error });
        // A rejected code is recoverable: the user can retype it.
        setStatus({
          phase: 'error',
          message: readableMessage(error, 'That code was not accepted. Try again.'),
          retryable: true,
        });
      }
    },
    [offerId, status],
  );

  const reset = useCallback(() => setStatus({ phase: 'idle' }), []);

  return { status, requestCode, submitCode, reset };
}

/**
 * The server's own wording where it is useful ("Invalid OTP"), and a calm
 * fallback otherwise — an internal 500 string is not something to show a user.
 */
function readableMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const { message } = error;
    if (!error.status || error.status < 500) {
      return typeof message === 'string' && message.trim() ? message : fallback;
    }
  }
  return fallback;
}
