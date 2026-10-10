import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableText, nullableTimestamp, nullableNumber } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Deal gifting: the deals a customer has *sent* (`GET /me/gifts`) and the send
 * action itself (`POST /catalogue/offers/claim/gift`).
 *
 * The recipient side is deliberately absent. Claiming a gifted deal is the same
 * public OTP flow as a normal claim (`claimApi.verifyClaim` with `giftToken`),
 * and reading or declining a gift by token (`GET /catalogue/offers/gift/:token`)
 * is likewise public — none of it belongs to the sender's authenticated client.
 */
export const myGiftStatusSchema = z.enum(['pending', 'accepted', 'rejected']);
export type MyGiftStatus = z.infer<typeof myGiftStatusSchema>;

export const myGiftOfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  mainImage: nullableText().nullable().optional(),
  calculatedPrice: z.number(),
  /** Sum of the offer's item prices, `null` when the offer has none. */
  originalPrice: nullableNumber().nullable(),
});
export type MyGiftOffer = z.infer<typeof myGiftOfferSchema>;

export const myGiftSchema = z.object({
  id: z.string(),
  recipientEmail: z.string(),
  recipientName: nullableText().nullable().optional(),
  note: nullableText().nullable().optional(),
  status: myGiftStatusSchema,
  createdAt: z.string(),
  acceptedAt: nullableTimestamp(),
  /**
   * Only present on `rejected` rows. Declining soft-removes the gift so the
   * branch dashboard stops seeing the recipient, so this endpoint opts them
   * back in — the sender is who the row is not being hidden from.
   */
  rejectedAt: nullableTimestamp(),
  rejectionReason: nullableText().nullable().optional(),
  offer: myGiftOfferSchema,
  businessName: nullableText().nullable().optional(),
  branchName: nullableText().nullable().optional(),
});
export type MyGift = z.infer<typeof myGiftSchema>;

export const myGiftsPageSchema = z.object({
  data: z.array(myGiftSchema),
  total: z.number(),
  page: nullableNumber(1).optional(),
  limit: nullableNumber(10).optional(),
});
export type MyGiftsPage = z.infer<typeof myGiftsPageSchema>;

export const sendDealGiftSchema = z.object({
  success: z.boolean().optional(),
  message: nullableText().optional(),
});
export type SendDealGiftResult = z.infer<typeof sendDealGiftSchema>;

export type MyGiftsQuery = {
  page?: number;
  limit?: number;
  status?: MyGiftStatus;
  /** Match on recipient email/name, sender name or offer name. */
  q?: string;
};

export type SendDealGiftPayload = {
  offerId: string;
  recipientEmail: string;
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  note?: string;
  branchId?: string;
};

export const giftApi = {
  /**
   * The authenticated customer's outgoing gifts, newest first.
   * `data: []` + `total: 0` is a valid empty state (nothing gifted yet).
   */
  async listMyGifts(
    query: MyGiftsQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<MyGiftsPage> {
    return requestValidated<MyGiftsPage>(
      {
        method: 'GET',
        url: '/me/gifts',
        params: {
          page: query.page,
          limit: query.limit,
          status: query.status,
          q: query.q,
        },
        ...options,
      },
      myGiftsPageSchema,
    );
  },

  /**
   * Emails the recipient a claim link for `offerId`.
   *
   * The API **deletes the gift row and throws** when the email cannot be
   * dispatched, so a failure here means nothing was recorded — the success
   * screen must only be reached when this resolves.
   */
  async sendDealGift(
    payload: SendDealGiftPayload,
    options: ApiRequestOptions = {},
  ): Promise<SendDealGiftResult> {
    return requestValidated<SendDealGiftResult>(
      {
        method: 'POST',
        url: '/catalogue/offers/claim/gift',
        data: payload,
        ...options,
      },
      sendDealGiftSchema,
    );
  },
};
