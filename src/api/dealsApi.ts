import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import {
  nullableArray,
  nullableDecimal,
  nullableFlag,
  nullableNumber,
} from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * The validated sort vocabulary of the public offers feed (Phase 2). Sending
 * anything outside this union is a `400`, so callers must pick from it.
 * `popular`/`featured` keep offset pagination and return no cursor.
 */
export type OfferSortBy =
  'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'trending' | 'popular' | 'featured';

/**
 * Audience eligibility, evaluated server-side with the same rule claim time
 * enforces. `everyone_nearby`/`all` apply no filter; anything else (`vip`) is a
 * `400`.
 */
export type OfferAudience =
  'everyone_nearby' | 'all' | 'new_customers' | 'returning_customers';

/** Query inputs of the public offers feed. */
type PaginatedQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: OfferSortBy;
  /**
   * Proximity filter. `radius` is in **kilometres** — verified live against the
   * test API, where `lat`/`lng` of Apo with `radius=1` returns nothing and
   * `radius=5` returns the nearby offers. The server compares against each
   * offer's business coordinates, so businesses without coordinates never match.
   */
  lat?: number;
  lng?: number;
  radius?: number;
  /** Price/discount narrowing, applied server-side (Phase 2). */
  minPrice?: number;
  maxPrice?: number;
  /** 0–100, computed from the offer's effective discount. */
  minDiscount?: number;
  audience?: OfferAudience;
  /** Pass the previous response's `nextCursor` to fetch the next page. */
  cursor?: string;
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
  /** Business 9-character code; equals `slug` on the feed. */
  uniqueCode: z.string().nullable().optional(),
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
  /** The deal's own photo — what every card and the deal page should show. */
  mainImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).nullable().optional(),
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
  terms: nullableArray(z.string()),
  claimCodePrefix: z.string().nullable().optional(),
});
export type Offer = z.infer<typeof offerSchema>;

/**
 * The business as it appears *inside* an offer. Deliberately separate from
 * `offerBusinessSchema` (the feed's shape): this one carries `isVerified`,
 * which the feed omits entirely.
 *
 * Field naming is a trap on this payload: `slug` is the **branch** code
 * (branch deep links), while `uniqueCode` is the **business** code — the key
 * `GET /public/businesses/code/:code` accepts. Use `uniqueCode` for the
 * merchant profile link; the branch slug 404s there.
 */
export const publicOfferBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The branch code, NOT the business code — never link a profile with this. */
  slug: z.string().nullable().optional(),
  /** Business 9-character code; the key for `GET /public/businesses/code/:code`. */
  uniqueCode: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  isVerified: nullableFlag(false),
});
export type PublicOfferBusiness = z.infer<typeof publicOfferBusinessSchema>;

/**
 * The single-offer payload behind `GET /catalogue/offers/public/details/:id`.
 *
 * Richer than the feed row on purpose: the detail page needs `endDate`,
 * `longDescription`, the engagement counts and `business.isVerified`, none of
 * which the feed carries. Verified live, including two shape quirks worth
 * remembering:
 *
 *  - Money arrives as **strings** here (`"200.00"`) while the feed sends
 *    numbers, so every price field reuses the `money` union.
 *  - `averageRating` is null until an offer has been reviewed.
 *
 * Fields we do not render are simply absent, and zod strips the rest — which
 * matters here, because this public endpoint also returns `owner`, `balance`
 * and `posSettings` that a consumer client has no business holding.
 */
export const publicOfferDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  longDescription: z.string().nullable().optional(),
  mainImage: z.string().nullable().optional(),
  galleryImages: nullableArray(z.string()),
  status: z.string(),
  pricingType: z.string().nullable().optional(),
  offerType: z.string().nullable().optional(),

  // The detail payload names its prices differently from the feed.
  calculatedPrice: money,
  dealPrice: money,
  originalPrice: money,
  discountValue: money,
  fixedPrice: money,
  discountPercent: z.number().nullable().optional(),

  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isExpired: nullableFlag(false),
  isFeatured: nullableFlag(false),
  isTrending: nullableFlag(false),

  items: nullableArray(offerItemSchema),
  terms: nullableArray(z.string()),

  claimedCount: nullableNumber(),
  maxClaims: nullableNumber(),
  maxClaimsPerCustomer: nullableNumber(),
  likesCount: nullableNumber(),
  dislikesCount: nullableNumber(),
  reviewsCount: nullableNumber(),
  averageRating: nullableDecimal(),
  views: nullableNumber(),
  visits: nullableNumber(),

  businessId: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  business: publicOfferBusinessSchema.nullable().optional(),
});
export type PublicOfferDetail = z.infer<typeof publicOfferDetailSchema>;

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
  averageRating: nullableDecimal(),
});
export type DealEngagement = z.infer<typeof dealEngagementSchema>;

export const publicBusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The business's own code, resolved by `GET /public/businesses/code/:code`. */
  uniqueCode: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  isVerified: nullableFlag(false),
  /** The main branch's username or code — not accepted by the business lookup. */
  slug: z.string().nullable().optional(),
  branchCode: z.string().nullable().optional(),
});
export type PublicBusiness = z.infer<typeof publicBusinessSchema>;

/** Not wrapped in `data`, unlike the offers feed. */
export const publicBusinessesSchema = z.object({
  businesses: z.array(publicBusinessSchema),
});

/**
 * The filter contract of `GET /public/businesses` (Phase 2). The response is
 * unchanged — no pagination — so this is a query type, not a new envelope.
 *
 *  - `search` matches name/description.
 *  - `categoryId` is a taxonomy UUID (the consumer filter chips use names).
 *  - `lat`/`lng`/`radius` (km) match a business when any active branch
 *    (falling back to the business coordinates) is inside the radius.
 *  - `sortBy` is validated server-side now; invalid values are a `400`.
 */
export type PublicBusinessSortBy = 'newest' | 'name_asc';

export interface PublicBusinessQuery {
  search?: string;
  categoryId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sortBy?: PublicBusinessSortBy;
}

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
export type ReactionStatus = z.infer<typeof reactionStatusSchema>;

/**
 * Deal reviews.
 *
 * Shapes come from the live backend service (`deal-engagement.service.ts`):
 *
 *  - The list is `{ reviews, total, page }` — note it does **not** echo
 *    `limit`, and list rows carry no `isAuthor` (only the detail route does,
 *    and only when the request was authenticated as the author).
 *  - `POST` answers `201` with the created row; a second review by the same
 *    account is rejected with `409`.
 *  - `PATCH`/`DELETE` are author-only (`403`), `404` for unknown reviews, and
 *    `400` for unknown fields (the global pipe rejects them).
 *  - Editing re-enters moderation when the business requires approval, so the
 *    returned `status` may be `pending`; the page should say so rather than
 *    assume the edit is live.
 */
export const dealReviewSchema = z.object({
  id: z.string(),
  reviewerName: z.string(),
  comment: z.string(),
  rating: z.number().nullable().optional(),
  likesCount: nullableNumber(0),
  status: z.string().nullable().optional(),
  isLiked: nullableFlag(false),
  createdAt: z.string(),
});
export type DealReview = z.infer<typeof dealReviewSchema>;

export const dealReviewsPageSchema = z.object({
  reviews: z.array(dealReviewSchema),
  total: z.number(),
  page: z.number().nullable().optional(),
});
export type DealReviewsPage = z.infer<typeof dealReviewsPageSchema>;

export const dealReviewDetailSchema = dealReviewSchema.extend({
  offerId: z.string(),
  isAuthor: nullableFlag(false),
  updatedAt: z.string(),
});
export type DealReviewDetail = z.infer<typeof dealReviewDetailSchema>;

export const createDealReviewSchema = z.object({
  comment: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5).optional(),
  /** Required only for anonymous reviewers; authenticated names come from the token. */
  name: z.string().optional(),
});
export type CreateDealReviewInput = z.infer<typeof createDealReviewSchema>;

export const updateDealReviewSchema = z.object({
  comment: z.string().min(1).max(1000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});
export type UpdateDealReviewInput = z.infer<typeof updateDealReviewSchema>;

/** Moderation state of a review; the same three values the public routes use. */
export type BusinessReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * Business-side review rows.
 *
 * Unlike the public rows these carry the moderation state, the offer they were
 * written against and the author id, because the merchant screen is a moderation
 * queue first: `status` decides which actions are offered.
 *
 * `rating` is nullable (a reviewer may leave a comment with no score), `ipHash`
 * is returned but meaningless to the UI, and `createdAt` arrives as an ISO
 * string.
 */
export const businessReviewSchema = z.object({
  id: z.string(),
  offerId: z.string(),
  offerName: z.string().nullable().optional(),
  reviewerName: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  likesCount: nullableNumber(0),
  status: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  ipHash: z.string().nullable().optional(),
  /** The business's public reply, when it has answered the review. */
  merchantReply: z.string().nullable().optional(),
  repliedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type BusinessReview = z.infer<typeof businessReviewSchema>;

/**
 * `GET /deals/business/reviews` echoes `limit` alongside `page`; the public list
 * omits it. `status` filters server-side, so the chips can be honest about what
 * they show instead of pretending to filter what the server already sent.
 */
export const businessReviewsPageSchema = z.object({
  reviews: z.array(businessReviewSchema),
  total: z.number(),
  page: z.number().nullable().optional(),
  limit: z.number().nullable().optional(),
});
export type BusinessReviewsPage = z.infer<typeof businessReviewsPageSchema>;

/**
 * Score + counts for the merchant's reputation panel. `ratingDistribution` is the
 * fixed 1–5 bucket map the server returns; unrated approved reviews contribute to
 * nothing.
 */
export const businessReviewsSummarySchema = z.object({
  totalReviews: z.number(),
  averageRating: z.number().nullable().optional(),
  pendingReviews: z.number().nullable().optional(),
  ratingDistribution: z
    .object({
      1: z.number(),
      2: z.number(),
      3: z.number(),
      4: z.number(),
      5: z.number(),
    })
    .nullable()
    .optional(),
});
export type BusinessReviewsSummary = z.infer<typeof businessReviewsSummarySchema>;

export type ReactionType = 'like' | 'dislike';

export const dealsApi = {
  /** Active offers at one branch (`GET /catalogue/offers/public/:branchId`). */
  async listBranchOffers(
    branchId: string,
    query: { limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<OfferFeed> {
    return requestValidated<OfferFeed>(
      {
        method: 'GET',
        url: `/catalogue/offers/public/${branchId}`,
        params: { limit: query.limit },
        ...options,
      },
      offerFeedSchema,
    );
  },

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
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          minDiscount: query.minDiscount,
          audience: query.audience,
          cursor: query.cursor,
        },
        ...options,
      },
      offerFeedSchema,
    );
  },

  /**
   * Customer-only ranked offers: `GET /recommendations`.
   *
   * Rows are identical to the public offers feed (`mapPublicOffers` on the
   * server), so `offerSchema`/`offerFeedSchema` are reused as-is, with one
   * caveat worth keeping: the endpoint filters by proximity but does **not**
   * return `distanceKm`, so nothing here may render a distance.
   *
   * The server also excludes offers this customer already claimed (matched on
   * userId, email or phone), which is the whole point of the endpoint over the
   * plain feed, and it accepts a CUSTOMER token only — an owner gets a 403.
   */
  async getRecommendations(
    query: { lat?: number; lng?: number; radius?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<OfferFeed> {
    return requestValidated<OfferFeed>(
      {
        method: 'GET',
        url: '/recommendations',
        params: {
          lat: query.lat,
          lng: query.lng,
          radius: query.radius,
          limit: query.limit,
        },
        ...options,
      },
      offerFeedSchema,
    );
  },

  /**
   * A single offer by id. Public and unauthenticated.
   *
   * Verified live: a real UUID returns 200, an unknown UUID returns 404, and a
   * non-UUID returns 400. That last case is why callers must resolve the
   * screen's fictional deals locally and only reach for this on a miss —
   * asking about `urban-grill-lunch` is a validation error, not a 404.
   */
  async getPublicOfferDetails(
    offerId: string,
    options: ApiRequestOptions = {},
  ): Promise<PublicOfferDetail> {
    return requestValidated<PublicOfferDetail>(
      { method: 'GET', url: `/catalogue/offers/public/details/${offerId}`, ...options },
      publicOfferDetailSchema,
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

  async listPublicBusinesses(
    query: PublicBusinessQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<PublicBusiness[]> {
    const response = await requestValidated<z.infer<typeof publicBusinessesSchema>>(
      { method: 'GET', url: '/public/businesses', params: { ...query }, ...options },
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

  /**
   * Authenticated; toggles the reaction (the same type again removes it) and
   * returns the resulting `type` (`null` when removed) and the live counts.
   */
  async setReaction(
    offerId: string,
    type: ReactionType,
    options: ApiRequestOptions = {},
  ): Promise<ReactionStatus> {
    return requestValidated<ReactionStatus>(
      {
        method: 'POST',
        url: `/deals/${offerId}/reactions`,
        data: { type },
        ...options,
      },
      reactionStatusSchema,
    );
  },

  /** Authenticated; the caller's reaction (`type`) and the deal's counts. */
  async getReactionStatus(
    offerId: string,
    options: ApiRequestOptions = {},
  ): Promise<ReactionStatus> {
    return requestValidated<ReactionStatus>(
      { method: 'GET', url: `/deals/${offerId}/reaction-status`, ...options },
      reactionStatusSchema,
    );
  },

  /**
   * Authenticated; toggles the saved state and returns the **resulting**
   * state. The server (not the client) decides the direction, so read the
   * response — do not assume a flip (`savedApi.toggleBusinessSave` follows the
   * same contract).
   */
  async toggleSave(
    offerId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ saved: boolean }> {
    return requestValidated<{ saved: boolean }>(
      {
        method: 'POST',
        url: `/deals/${offerId}/save`,
        ...options,
      },
      z.object({ saved: z.boolean() }),
    );
  },

  /** Authenticated; returns save status for a deal. Note `isSaved`, not `saved`. */
  async getSaveStatus(
    offerId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ isSaved: boolean }> {
    return requestValidated<{ isSaved: boolean }>(
      { method: 'GET', url: `/deals/${offerId}/save-status`, ...options },
      z.object({ isSaved: z.boolean() }),
    );
  },

  /**
   * Paginated approved reviews, newest first. Public; sending the token adds
   * `isLiked` to each row and (on the detail route) `isAuthor`.
   */
  async listReviews(
    offerId: string,
    query: { page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<DealReviewsPage> {
    return requestValidated<DealReviewsPage>(
      {
        method: 'GET',
        url: `/deals/${offerId}/reviews`,
        params: { page: query.page, limit: query.limit },
        ...options,
      },
      dealReviewsPageSchema,
    );
  },

  /** Submit a review. Public; an authenticated token links the author. */
  async createReview(
    offerId: string,
    input: CreateDealReviewInput,
    options: ApiRequestOptions = {},
  ): Promise<DealReview> {
    return requestValidated<DealReview>(
      { method: 'POST', url: `/deals/${offerId}/reviews`, data: input, ...options },
      dealReviewSchema,
    );
  },

  /**
   * One review. Public for approved reviews; a pending/rejected review is only
   * visible to its author, so callers must send the token for `isAuthor` to be
   * true (everyone else gets `404`, never a leak of the moderation state).
   */
  async getReview(
    offerId: string,
    reviewId: string,
    options: ApiRequestOptions = {},
  ): Promise<DealReviewDetail> {
    return requestValidated<DealReviewDetail>(
      { method: 'GET', url: `/deals/${offerId}/reviews/${reviewId}`, ...options },
      dealReviewDetailSchema,
    );
  },

  /** Author-only edit; sends `PATCH` with at least one changed field. */
  async updateReview(
    offerId: string,
    reviewId: string,
    input: UpdateDealReviewInput,
    options: ApiRequestOptions = {},
  ): Promise<DealReviewDetail> {
    return requestValidated<DealReviewDetail>(
      {
        method: 'PATCH',
        url: `/deals/${offerId}/reviews/${reviewId}`,
        data: input,
        ...options,
      },
      dealReviewDetailSchema,
    );
  },

  /** Author-only soft delete; answers `204` with no body. */
  async deleteReview(
    offerId: string,
    reviewId: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/deals/${offerId}/reviews/${reviewId}`,
      ...options,
    });
  },

  /**
   * The merchant's own reviews, newest first.
   *
   * `status` is the server-side filter the moderation chips use — sending it
   * means a "Pending" chip really shows the moderation queue, not a slice of the
   * last page the client happened to fetch.
   */
  async listBusinessReviews(
    query: {
      status?: BusinessReviewStatus;
      offerId?: string;
      page?: number;
      limit?: number;
    } = {},
    options: ApiRequestOptions = {},
  ): Promise<BusinessReviewsPage> {
    return requestValidated<BusinessReviewsPage>(
      {
        method: 'GET',
        url: '/deals/business/reviews',
        params: {
          status: query.status,
          offerId: query.offerId,
          page: query.page,
          limit: query.limit,
        },
        ...options,
      },
      businessReviewsPageSchema,
    );
  },

  /** Score, approved/pending counts and the star distribution for one business. */
  async getBusinessReviewsSummary(
    options: ApiRequestOptions = {},
  ): Promise<BusinessReviewsSummary> {
    return requestValidated<BusinessReviewsSummary>(
      { method: 'GET', url: '/deals/business/reviews/summary', ...options },
      businessReviewsSummarySchema,
    );
  },

  /** Publish a pending review; answers with the review's new state. */
  async approveBusinessReview(
    reviewId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ id: string; status: string }> {
    return requestValidated<{ id: string; status: string }>(
      {
        method: 'POST',
        url: `/deals/business/reviews/${reviewId}/approve`,
        ...options,
      },
      z.object({ id: z.string(), status: z.string() }),
    );
  },

  /** Take a review back down; answers with the review's new state. */
  async rejectBusinessReview(
    reviewId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ id: string; status: string }> {
    return requestValidated<{ id: string; status: string }>(
      {
        method: 'POST',
        url: `/deals/business/reviews/${reviewId}/reject`,
        ...options,
      },
      z.object({ id: z.string(), status: z.string() }),
    );
  },

  /** Set or replace the business's public reply (trimmed, 1–1000 chars). */
  async replyToBusinessReview(
    reviewId: string,
    reply: string,
    options: ApiRequestOptions = {},
  ): Promise<{ id: string; merchantReply: string | null; repliedAt?: string | null }> {
    return requestValidated(
      {
        method: 'POST',
        url: `/deals/business/reviews/${reviewId}/reply`,
        data: { reply },
        ...options,
      },
      z.object({
        id: z.string(),
        merchantReply: z.string().nullable(),
        repliedAt: z.string().nullable().optional(),
      }),
    );
  },

  /** Remove the business's reply; answers `204`. */
  async removeBusinessReviewReply(
    reviewId: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/deals/business/reviews/${reviewId}/reply`,
      ...options,
    });
  },

  /** Delete a review outright; answers `204` with no body. */
  async deleteBusinessReview(
    reviewId: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/deals/business/reviews/${reviewId}`,
      ...options,
    });
  },
};
