import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import { nullableArray, nullableFlag, nullableNumber } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/** Cursor pagination inputs shared by the list endpoints. */
type PaginatedQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  /**
   * Proximity filter. `radius` is in **kilometres** — verified live against the
   * test API, where `lat`/`lng` of Apo with `radius=1` returns nothing and
   * `radius=5` returns the nearby offers. The server compares against each
   * offer's business coordinates, so businesses without coordinates never match.
   */
  lat?: number;
  lng?: number;
  radius?: number;
};

/**
 * Consumer-facing deals/catalogue endpoints.
 *
 * The published OpenAPI document declares these paths but leaves every 2xx
 * response undocumented (the response objects carry only a `description`, with
 * no `content`). The schemas below were therefore captured from live responses
 * on the test API rather than from the spec, and the envelope is deliberately
 * inconsistent upstream: the offers feed is `{ data, total, ... }`, the
 * business list is `{ businesses: [...] }`, engagement is a flat object and
 * review previews are `{ reviews: [...] }`. Model each response as it actually
 * arrives instead of assuming a single wrapper.
 */

/**
 * The API omits keys rather than sending null (an item without a discount has no
 * `discountValue` key at all), and numeric amounts arrive as a mix of numbers
 * and numeric strings, so money must tolerate both.
 */
const money = z.union([z.string(), z.number()]).nullish();

export const offerBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const offerItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: money,
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  mainImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).nullable().optional(),
  businessId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  itemType: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  discountType: z.string().nullable().optional(),
  discountValue: money,
  stockQuantity: z.number().nullable().optional(),
  brand: z.string().nullable().optional(),
  loyaltyPoints: z.number().nullable().optional(),
  isBookable: z.boolean().nullable().optional(),
});

export const offerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  pricingType: z.string().nullable().optional(),
  fixedPrice: money,
  percentageOff: money,
  calculatedPrice: money,
  originalPrice: money,
  discountPercent: z.number().nullable().optional(),
  status: z.string(),
  branchId: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  business: offerBusinessSchema.nullable().optional(),
  items: nullableArray(offerItemSchema),
  claimedCount: nullableNumber(),
  totalLimit: z.number().nullable().optional(),
  remainingLimit: z.number().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isExpired: nullableFlag(false),
  maxClaimsPerCustomer: z.number().nullable().optional(),
  audienceTarget: z.string().nullable().optional(),
  terms: nullableArray(z.unknown()),
  claimCodePrefix: z.string().nullable().optional(),
});
export type Offer = z.infer<typeof offerSchema>;

/** The feed endpoint returns a cursor-paginated envelope. */
export const offerFeedSchema = z.object({
  data: z.array(offerSchema),
  total: nullableNumber(0),
  page: z.number().nullable().optional(),
  limit: z.number().nullable().optional(),
  cursor: z.string().nullable().optional(),
  nextCursor: z.string().nullable().optional(),
  prevCursor: z.string().nullable().optional(),
  hasNextPage: nullableFlag(false),
});
export type OfferFeed = z.infer<typeof offerFeedSchema>;

export const dealEngagementSchema = z.object({
  likesCount: nullableNumber(),
  dislikesCount: nullableNumber(),
  reviewsCount: nullableNumber(),
  averageRating: z.number().nullable().optional(),
});
export type DealEngagement = z.infer<typeof dealEngagementSchema>;

export const publicBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  isVerified: nullableFlag(false),
  slug: z.string().nullable().optional(),
  branchCode: z.string().nullable().optional(),
});
export type PublicBusiness = z.infer<typeof publicBusinessSchema>;

/** Not wrapped in `data`, unlike the offers feed. */
export const publicBusinessesSchema = z.object({
  businesses: z.array(publicBusinessSchema),
});

export const platformStatsSchema = z.object({
  totalBusinesses: nullableNumber(0),
  totalActiveDeals: nullableNumber(0),
  totalClaims: nullableNumber(0),
  totalBranches: nullableNumber(0),
});
export type PlatformStats = z.infer<typeof platformStatsSchema>;

export const reactionStatusSchema = z.object({
  type: z.string().nullable().optional(),
  likesCount: nullableNumber(0),
  dislikesCount: nullableNumber(0),
  reviewsCount: nullableNumber(0),
});

export type ReactionType = 'like' | 'dislike';

export const dealsApi = {
  async listPublicOffers(
    query: PaginatedQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<OfferFeed> {
    return requestValidated<OfferFeed>(
      {
        method: 'GET',
        url: '/catalogue/offers/public',
        params: {
          page: query.page,
          limit: query.limit,
          search: query.search,
          sortBy: query.sortBy,
          lat: query.lat,
          lng: query.lng,
          radius: query.radius,
        },
        ...options,
      },
      offerFeedSchema,
    );
  },

  /** Public, unauthenticated. */
  async getEngagement(
    offerId: string,
    options: ApiRequestOptions = {},
  ): Promise<DealEngagement> {
    return requestValidated<DealEngagement>(
      { method: 'GET', url: `/deals/${offerId}/engagement`, ...options },
      dealEngagementSchema,
    );
  },

  async listPublicBusinesses(options: ApiRequestOptions = {}): Promise<PublicBusiness[]> {
    const response = await requestValidated<z.infer<typeof publicBusinessesSchema>>(
      { method: 'GET', url: '/public/businesses', ...options },
      publicBusinessesSchema,
    );
    return response.businesses;
  },

  async getPlatformStats(options: ApiRequestOptions = {}): Promise<PlatformStats> {
    return requestValidated<PlatformStats>(
      { method: 'GET', url: '/public/stats', ...options },
      platformStatsSchema,
    );
  },

  /** Authenticated; the spec documents no response body for this toggle. */
  async setReaction(
    offerId: string,
    type: ReactionType,
    options: ApiRequestOptions = {},
  ): Promise<unknown> {
    return request<unknown>({
      method: 'POST',
      url: `/deals/${offerId}/reactions`,
      data: { type },
      ...options,
    });
  },

  /** Authenticated; no response body is documented for this toggle. */
  async toggleSave(offerId: string, options: ApiRequestOptions = {}): Promise<unknown> {
    return request<unknown>({
      method: 'POST',
      url: `/deals/${offerId}/save`,
      ...options,
    });
  },
};
