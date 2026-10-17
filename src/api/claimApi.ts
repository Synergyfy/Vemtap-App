import { z } from 'zod';
import { request, requestValidated, createIdempotencyKey } from '@api/client';
import { decimal, nullableText } from '@api/schemaHelpers';
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

/**
 * The customer's claimed passes (`GET /me/claims`).
 *
 * CUSTOMER-only: an owner token gets `403` and anonymous `401`. `status` is the
 * **effective** status the server computed — `ACTIVE` means claimed and not
 * past `expiresAt`; `EXPIRED` covers persisted expired rows *and* claimed rows
 * past expiry — so the UI badges the row from this field, never from comparing
 * `expiresAt` locally. `redeemedAt` is null until a merchant redeems the pass.
 *
 * The optional `offer.discountValue`/`pricingType` are not rendered by the
 * cards, but are kept because the same payload feeds the pass screen.
 * `discountValue` reuses the `money` union like every other offer price: the
 * server reads it straight off a TypeORM `numeric` column, so it arrives as a
 * string ("1500.00") as often as a number.
 */
const money = z.union([z.string(), z.number()]).nullish();
export const myClaimStatusSchema = z.enum(['ACTIVE', 'REDEEMED', 'EXPIRED']);
export type MyClaimStatus = z.infer<typeof myClaimStatusSchema>;

export const myClaimOfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  mainImage: z.string().nullable().optional(),
  calculatedPrice: decimal(),
  originalPrice: decimal(),
  discountPercent: z.number(),
  pricingType: z.string().nullable().optional(),
  discountValue: money,
  businessId: z.string(),
  businessName: z.string(),
  businessLogo: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
  branchAddress: z.string().nullable().optional(),
  branchPhone: z.string().nullable().optional(),
  branchLatitude: z.number().nullable().optional(),
  branchLongitude: z.number().nullable().optional(),
  endDate: z.string().nullable().optional(),
});
export type MyClaimOffer = z.infer<typeof myClaimOfferSchema>;

export const myClaimSchema = z.object({
  id: z.string(),
  claimCode: z.string(),
  status: myClaimStatusSchema,
  expiresAt: z.string(),
  claimedAt: z.string(),
  redeemedAt: z.string().nullable().optional(),
  offer: myClaimOfferSchema,
});
export type MyClaim = z.infer<typeof myClaimSchema>;

export const myClaimsPageSchema = z.object({
  data: z.array(myClaimSchema),
  total: z.number(),
  page: z.number().nullable().optional(),
  limit: z.number().nullable().optional(),
});
export type MyClaimsPage = z.infer<typeof myClaimsPageSchema>;

type MyClaimsQuery = {
  page?: number;
  limit?: number;
  status?: MyClaimStatus;
  /**
   * Case-insensitive match on offer name, business name, branch name or claim
   * code. Server-side, and it narrows `total` with the page — the alternative
   * (filtering the page client-side) would silently hide matches past the
   * 50-row limit.
   */
  q?: string;
};

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

  /**
   * The authenticated customer's claimed passes, newest first. `data: []` +
   * `total: 0` is a valid empty state.
   *
   * `limit` is capped at 50 by the API. Sending it (or `page`) is what switches
   * the response from the legacy bare array to the `{ data, total }` envelope
   * this client parses, so both are always sent.
   */
  async listMyClaims(
    query: MyClaimsQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<MyClaimsPage> {
    return requestValidated<MyClaimsPage>(
      {
        method: 'GET',
        url: '/me/claims',
        params: {
          page: query.page,
          limit: query.limit,
          status: query.status,
          q: query.q,
        },
        ...options,
      },
      myClaimsPageSchema,
    );
  },

  /** The pass QR: an SVG that encodes the claim code (`GET /me/claims/:id/qr`). */
  async getClaimQr(
    claimId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ claimCode: string; svg: string }> {
    return requestValidated(
      { method: 'GET', url: `/me/claims/${claimId}/qr`, ...options },
      z.object({ claimCode: z.string(), svg: z.string() }),
    );
  },

  /** Gives an unused claim back (`DELETE /me/claims/:id`); answers 204. */
  async releaseClaim(claimId: string, options: ApiRequestOptions = {}): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/me/claims/${claimId}`,
      ...options,
    });
  },
};
