import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { giftApi, type SendDealGiftPayload } from '@api/giftApi';
import { ApiError } from '@api/ApiError';
import { logger } from '@utils/logger';

/**
 * Gifting a deal to someone else.
 *
 * The hook owns the state machine so the confirm sheet can render any outcome
 * without knowing the API — the same contract as `useOfferClaim`, and for the
 * same reason: the gift flow used to navigate straight to its success screen
 * without calling the endpoint at all, so a user could be told "gift sent" for
 * something that was never dispatched.
 *
 * A send only counts once the mutation resolves. The API *deletes* the gift row
 * and throws when the recipient email cannot be dispatched, so there is no
 * "queued" middle state to model — a failure means nothing was recorded.
 */
export type GiftSendStatus =
  | { phase: 'idle' }
  | { phase: 'sending' }
  | { phase: 'sent' }
  | { phase: 'error'; message: string; retryable: boolean };

export type GiftIdentity = {
  offerId: string;
  recipientEmail: string;
  recipientName?: string;
  note?: string;
  branchId?: string;
};

export function useSendGift() {
  const [status, setStatus] = useState<GiftSendStatus>({ phase: 'idle' });
  const queryClient = useQueryClient();

  const send = useCallback(
    async (identity: GiftIdentity): Promise<boolean> => {
      setStatus({ phase: 'sending' });
      try {
        const payload: SendDealGiftPayload = {
          offerId: identity.offerId,
          recipientEmail: identity.recipientEmail,
          recipientName: identity.recipientName,
          note: identity.note,
          branchId: identity.branchId,
        };
        await giftApi.sendDealGift(payload);
        setStatus({ phase: 'sent' });
        // The gift now exists server-side, so the Gifted tab's cached "nothing
        // gifted yet" is stale.
        queryClient.invalidateQueries({ queryKey: ['me', 'gifts'] });
        return true;
      } catch (error) {
        logger.warn('api', 'Deal gift send failed', {
          offerId: identity.offerId,
          error,
        });
        setStatus({
          phase: 'error',
          message: readableMessage(
            error,
            'We could not send that gift. Try again in a moment.',
          ),
          // Every failure here is retryable: the API leaves no partial state.
          retryable: true,
        });
        return false;
      }
    },
    [queryClient],
  );

  const reset = useCallback(() => setStatus({ phase: 'idle' }), []);

  return { status, send, reset };
}

/**
 * The server's own wording where it is useful, and a calm fallback otherwise —
 * an internal 500 string is not something to show a user.
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
