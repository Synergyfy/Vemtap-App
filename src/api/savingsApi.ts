import { z } from 'zod';
import { apiClient, requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Customer savings ledger — `GET /me/savings`.
 *
 * The server computes these rows live from **redeemed** claims, so an entry
 * exists only once a merchant actually redeemed the pass. `savedAmount` is
 * always `originalAmount - paidAmount` (never negative server-side).
 */

/** Money from the API is always numeric; treat an explicit null as 0. */
const amountSchema = z
  .number()
  .nullish()
  .transform(value => value ?? 0);

export const savingsEntrySchema = z.object({
  id: z.string(),
  redeemedAt: z.string().nullish(),
  merchantName: z
    .string()
    .nullish()
    .transform(value => value ?? ''),
  merchantImageUrl: z.string().nullable().optional(),
  offerName: z
    .string()
    .nullish()
    .transform(value => value ?? ''),
  claimCode: z.string().nullish(),
  originalAmount: amountSchema,
  paidAmount: amountSchema,
  savedAmount: amountSchema,
  currency: z
    .string()
    .nullish()
    .transform(value => value ?? 'NGN'),
  /** Catalogue category of the merchant — `null` for uncategorised spend. */
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
});
export type SavingsEntry = z.infer<typeof savingsEntrySchema>;

export const savingsPageSchema = z.object({
  data: z.array(savingsEntrySchema).nullish().default([]),
  total: z.number().nullish().default(0),
  page: z.number().nullish().default(1),
  limit: z.number().nullish().default(10),
  /** Naira saved across every matching redemption, not just this page. */
  totalSavedAmount: z.number().nullish().default(0),
});
export type SavingsPage = z.infer<typeof savingsPageSchema>;

export const savingsCategorySchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string(),
  redemptions: z.number().nullish().default(0),
  savedAmount: amountSchema,
  sharePercent: z.number().nullish().default(0),
});
export type SavingsCategory = z.infer<typeof savingsCategorySchema>;

export const savingsBreakdownSchema = z.object({
  data: z.array(savingsCategorySchema).nullish().default([]),
  totalSavedAmount: z.number().nullish().default(0),
  totalRedemptions: z.number().nullish().default(0),
});
export type SavingsBreakdown = z.infer<typeof savingsBreakdownSchema>;

export interface SavingsQuery {
  page?: number;
  limit?: number;
  /** Restrict to the past N days. Omit for all-time. */
  days?: number;
}

export const savingsApi = {
  /** Paginated redemption ledger. */
  async getSavings(
    query: SavingsQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<SavingsPage> {
    return requestValidated<SavingsPage>(
      {
        method: 'GET',
        url: '/me/savings',
        params: query,
        ...options,
      },
      savingsPageSchema,
    );
  },

  /** Spend rolled up by category, largest first. */
  async getSavingsByCategory(
    query: { days?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<SavingsBreakdown> {
    return requestValidated<SavingsBreakdown>(
      {
        method: 'GET',
        url: '/me/savings/categories',
        params: query,
        ...options,
      },
      savingsBreakdownSchema,
    );
  },

  /**
   * CSV statement URL for `GET /me/savings/export`.
   *
   * The response is a `text/csv` attachment, not JSON, so it cannot go through
   * the validated-JSON helpers. The app has no filesystem/share dependency, so
   * the caller opens this URL in the system browser — the server sets
   * `Content-Disposition: attachment`, which makes it download.
   */
  exportUrl(query: { days?: number } = {}): string {
    const base = apiClient.defaults.baseURL ?? '';
    const params = new URLSearchParams({ format: 'csv' });
    if (query.days != null) params.set('days', String(query.days));
    return `${base}/me/savings/export?${params.toString()}`;
  },
};
