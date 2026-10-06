import { z } from 'zod';
import { requestValidated } from '@api/client';
import { offerSchema, publicBusinessSchema } from '@api/dealsApi';
import { namedCategorySchema } from '@api/businessProfileApi';
import { nullableArray } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Unified public search: `GET /public/search?q=…` → `{deals, businesses, categories}`.
 *
 * This is the endpoint Home's search should use, and it needs no backend work —
 * verified live: `soft` → 1 deal, `tea` → 2 deals, `beauty` → 1 business +
 * 1 category, `Test store` → 2 deals + 1 business, and an unmatched term returns
 * three empty groups rather than an error.
 *
 * All three groups are byte-for-byte the shapes the existing endpoints return,
 * so each reuses its schema rather than declaring a near-duplicate. That also
 * means a search result renders through exactly the same mappers as a feed row.
 */
export const publicSearchResultSchema = z.object({
  deals: nullableArray(offerSchema),
  businesses: nullableArray(publicBusinessSchema),
  categories: nullableArray(namedCategorySchema),
});
export type PublicSearchResult = z.infer<typeof publicSearchResultSchema>;

export const publicSearchApi = {
  /**
   * `q` is optional server-side (an empty query returns empty groups), but a
   * search screen has nothing to call it with, so the caller decides when to
   * fire and this simply forwards.
   *
   * `limit` applies **per group**, not to the combined result.
   */
  async search(
    query: { q: string; limit?: number },
    options: ApiRequestOptions = {},
  ): Promise<PublicSearchResult> {
    return requestValidated<PublicSearchResult>(
      { method: 'GET', url: '/public/search', params: { ...query }, ...options },
      publicSearchResultSchema,
    );
  },
};
