import { z } from 'zod';
import { requestValidated, createIdempotencyKey } from '@api/client';
import { nullableText } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Consumer promotion claims: `POST /catalogue/offers/claim/request` and
 * `.../claim/verify`. Both are public and unauthenticated.
 *
 * This is the whole consumer claim flow — two calls:
 *
 *   1. `requestClaimOtp` emails a code to the claimant (name + phone required).
 *   2. `verifyClaim` trades that code for a **claim code**, which the merchant
 *      redeems in person.
 *
 * `POST /catalogue/offers/claim/redeem/:code` is deliberately absent: it is the
 * staff-side POS redemption (bearer + `pos` permission), not a consumer action.
 * The gift endpoint is also absent — it requires authentication, unlike these.
 *
 * Two contract details verified live, both of which the docs get wrong or omit:
 *
 *  - `requestClaimOtp` answers **200**, not the documented 201.
 *  - The OTP is validated as **4 to 6 characters**: a 3-character code is
 *    rejected with "code must be longer than or equal to 4 characters" and a
 *    7-character one with "…shorter than or equal to 6 characters", so the UI
 *    cannot assume a fixed width. Anything in range passes length validation and
 *    then fails as an invalid OTP.
 */
export const claimOtpRequestSchema = z.object({
  offerId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});
export type ClaimOtpRequest = z.infer<typeof claimOtpRequestSchema>;

export const claimOtpVerifySchema = z.object({
  email: z.string().email(),
  offerId: z.string().uuid(),
  /** 4–6 characters; the API validates length before value. */
  code: z.string().min(4).max(6),
  giftToken: z.string().optional(),
});
export type ClaimOtpVerify = z.infer<typeof claimOtpVerifySchema>;

const claimSchema = z.object({
  id: z.string(),
  claimCode: z.string(),
  expiresAt: z.string().nullable().optional(),
  status: nullableText(),
});

export const claimVerifiedResponseSchema = z.object({
  message: nullableText(),
  claim: claimSchema,
});
export type ClaimVerified = z.infer<typeof claimVerifiedResponseSchema>;

export const claimApi = {
  /** Step 1. Emails the code; returns void because only a message comes back. */
  async requestClaimOtp(
    payload: ClaimOtpRequest,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await requestValidated(
      {
        method: 'POST',
        url: '/catalogue/offers/claim/request',
        data: payload,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      z.object({ message: z.string().optional() }),
    );
  },

  /** Step 2. Trades the emailed code for a redeemable claim. */
  async verifyClaim(
    payload: ClaimOtpVerify,
    options: ApiRequestOptions = {},
  ): Promise<ClaimVerified> {
    return requestValidated<ClaimVerified>(
      {
        method: 'POST',
        url: '/catalogue/offers/claim/verify',
        data: payload,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      claimVerifiedResponseSchema,
    );
  },
};
