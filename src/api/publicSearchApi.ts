import { z } from 'zod';
import { requestValidated } from '@api/client';
import { offerSchema, publicBusinessSchema } from '@api/dealsApi';
import { namedCategorySchema } from '@api/businessProfileApi';
import { nullableArray, nullableFlag } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Unified public search: `GET /public/search?q=…&lat=…&lng=…&radius=…`
 * → `{deals, businesses, categories, products}`.
 *
 * This is the endpoint Home/Deals search uses. Deals, businesses and categories
 * are byte-for-byte the shapes their own endpoints return, so each reuses its
 * schema; the `products` group (active, non-suspended catalogue items of both
 * types — `product` and `service`) is declared here because no other consumer
 * endpoint returns this card.
 *
 * `lat`/`lng`/`radius` (km) narrow **all three** location-aware groups (deals,
 * businesses, products) and are ignored by the server unless both coordinates
 * are present. `limit` applies per group (max 20). An empty/blank `q` answers
 * four empty groups rather than an error.
 */

const money = z.union([z.string(), z.number()]).nullish();

/**
 * A search product card. Distinct from `catalogueItemSchema` (the `/products`
 * feed): search resolves the branch nearest the searcher and inlines the
 * business's display fields, so the card can show a merchant without a second
 * lookup.
 */
export const searchProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: money,
  shortDescription: z.string().nullable().optional(),
  mainImage: z.string().nullable().optional(),
  galleryImages: nullableArray(z.string()),
  itemType: z.string().nullable().optional(),
  discountType: z.string().nullable().optional(),
  discountValue: money,
  priceType: z.string().nullable().optional(),
  priceRangeMin: money,
  priceRangeMax: money,
  duration: z.string().nullable().optional(),
  isBookable: nullableFlag(false),
  tags: nullableArray(z.string()),
  sku: z.string().nullable().optional(),
  stockQuantity: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  businessId: z.string().nullable().optional(),
  businessName: z.string().nullable().optional(),
  businessLogo: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
  branchAddress: z.string().nullable().optional(),
});
export type SearchProduct = z.infer<typeof searchProductSchema>;

export const publicSearchResultSchema = z.object({
  deals: nullableArray(offerSchema),
  businesses: nullableArray(publicBusinessSchema),
  categories: nullableArray(namedCategorySchema),
  products: nullableArray(searchProductSchema),
});
export type PublicSearchResult = z.infer<typeof publicSearchResultSchema>;

export interface PublicSearchQuery {
  q: string;
  limit?: number;
  /** Discovery origin; proximity filtering only applies when both are sent. */
  lat?: number;
  lng?: number;
  /** Radius in kilometres. */
  radius?: number;
}

export const publicSearchApi = {
  /**
   * `q` is optional server-side (an empty query returns empty groups), but a
   * search screen has nothing to call it with, so the caller decides when to
   * fire and this simply forwards.
   *
   * `limit` applies **per group**, not to the combined result.
   */
  async search(
    query: PublicSearchQuery,
    options: ApiRequestOptions = {},
  ): Promise<PublicSearchResult> {
    return requestValidated<PublicSearchResult>(
      { method: 'GET', url: '/public/search', params: { ...query }, ...options },
      publicSearchResultSchema,
    );
  },
};
