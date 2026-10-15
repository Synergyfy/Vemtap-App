import { z } from 'zod';
import { nullableDecimal, nullableFlag, nullableNumber } from '@api/schemaHelpers';
import { requestValidated } from '@api/client';
import { ApiError } from '@api/ApiError';
import { isPlanError } from '@api/planErrors';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Public catalogue (products and services) endpoints.
 *
 * As with the deals endpoints, the published OpenAPI document declares these
 * paths but documents no 2xx bodies, so the schemas were captured from live
 * responses on the test API. The envelope differs per endpoint and is modelled
 * accordingly: branch items use the same cursor envelope as the offers feed,
 * `GET /products` uses a page/totalPages envelope, and categories come back as
 * a bare array.
 *
 * Note the branch item carries an embedded `category` object as well as
 * `categoryId`; the offers feed's embedded items only had the id.
 */

const money = z.union([z.string(), z.number()]).nullish();

export const catalogueCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  businessId: z.string().nullable().optional(),
});
export type CatalogueCategory = z.infer<typeof catalogueCategorySchema>;

export const catalogueItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: money,
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  mainImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).nullish(),
  businessId: z.string().nullable().optional(),
  category: catalogueCategorySchema.nullish(),
  categoryId: z.string().nullable().optional(),
  status: z.string(),
  /** The API uses `service` for services; products arrive as `product`. */
  itemType: z.string(),
  sku: z.string().nullable().optional(),
  discountType: z.string().nullable().optional(),
  discountValue: money,
  stockQuantity: z.number().nullish(),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  /** `fixed`, `range` or `starting_from`. */
  priceType: z.string().nullable().optional(),
  priceRangeMin: money,
  priceRangeMax: money,
  /** Service duration, e.g. "1.5 hours". */
  duration: z.string().nullable().optional(),
  /** `customer`, `location` or `flexible`. */
  serviceMode: z.string().nullable().optional(),
  isBookable: z.boolean().nullish(),
  bookingMethod: z.string().nullable().optional(),
  externalBookingLink: z.string().nullable().optional(),
  allowBackOrder: z.boolean().nullish(),
  isSuspended: nullableFlag(false),
  loyaltyPoints: z.number().nullish(),
});
export type CatalogueItem = z.infer<typeof catalogueItemSchema>;

/** Cursor envelope, matching the offers feed. */
export const catalogueItemFeedSchema = z.object({
  data: z.array(catalogueItemSchema),
  total: nullableNumber(0),
  page: z.number().nullish(),
  limit: z.number().nullish(),
  cursor: z.string().nullish(),
  nextCursor: z.string().nullish(),
  prevCursor: z.string().nullish(),
  hasNextPage: nullableFlag(false),
});
export type CatalogueItemFeed = z.infer<typeof catalogueItemFeedSchema>;

/** Page envelope used by `GET /products`; no cursor fields. */
export const publishedProductFeedSchema = z.object({
  data: z.array(catalogueItemSchema),
  total: nullableNumber(0),
  page: z.number().nullish(),
  limit: z.number().nullish(),
  totalPages: z.number().nullish(),
  hasNextPage: nullableFlag(false),
  hasPrevPage: nullableFlag(false),
});

/** Categories arrive as a bare array, not wrapped. */
export const catalogueCategoryListSchema = z.array(catalogueCategorySchema);

export const productTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
});

/**
 * The business owner's own catalogue. Unlike the public list this returns every
 * item regardless of status, so drafts and suspended items stay visible to the
 * owner instead of silently disappearing. `status` is therefore explicit here
 * rather than defaulting to `active`.
 *
 * The spec declares this path as bearer-secured but documents no response body,
 * so the shape is the live-verified public item schema widened to cover the
 * extra statuses. It has not been checked against a live authenticated
 * response — that needs a business-owner token.
 */
export const businessCatalogueItemSchema = catalogueItemSchema.extend({
  status: z.string(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  deletedAt: z.string().nullish(),
  costPrice: money,
  minStock: z.number().nullish(),
  weight: money,
  barcode: z.string().nullish(),
  variants: z.unknown().nullish(),
  tags: z.array(z.string()).nullish(),
  suspensionNote: z.string().nullish(),
  loyaltyPointsValue: money,
  enableLoyaltyPoints: z.boolean().nullish(),
  dimensions: z.unknown().nullish(),
});
export type BusinessCatalogueItem = z.infer<typeof businessCatalogueItemSchema>;

/**
 * `GET /catalogue/items` answers with a **bare array** — verified live with an
 * owner token — not the `{ data, total }` envelope the public feeds use. Both
 * forms are accepted and normalised to a single feed shape so callers can always
 * read `.data` / `.total`; a bare array carries no page metadata, so `total`
 * falls back to the row count.
 */
const businessCatalogueEnvelopeSchema = z.object({
  data: z.array(businessCatalogueItemSchema),
  total: nullableNumber(0),
  page: z.number().nullish(),
  limit: z.number().nullish(),
  totalPages: z.number().nullish(),
  hasNextPage: nullableFlag(false),
  hasPrevPage: nullableFlag(false),
});

export const businessCatalogueFeedSchema = z.union([
  businessCatalogueEnvelopeSchema,
  // The page fields are filled with `undefined`/`false` so both union members
  // share one inferred shape; otherwise `.page` would not exist on the type.
  z.array(businessCatalogueItemSchema).transform(items => ({
    data: items,
    total: items.length,
    page: undefined,
    limit: undefined,
    totalPages: undefined,
    hasNextPage: false,
    hasPrevPage: false,
  })),
]);
export type BusinessCatalogueFeed = z.infer<typeof businessCatalogueFeedSchema>;

/**
 * `PATCH /catalogue/items/:id` echoes the saved entity, but deployed builds
 * drop every column the request did not send (the DTO's own `undefined`
 * fields are assigned over the entity), so a name/price edit comes back
 * without `status` or `itemType`. The write itself succeeded, so only `id` is
 * required here; callers refetch the list for the full row.
 */
export const updatedCatalogueItemSchema = businessCatalogueItemSchema
  .partial()
  .required({ id: true });
export type UpdatedCatalogueItem = z.infer<typeof updatedCatalogueItemSchema>;

/**
 * `GET /branches` is bearer-secured and has no documented response DTO. The
 * read fields below are taken from the branch entity as exposed by
 * `UpdateBranchDto`, with only id and name required, so an added or renamed
 * branch field cannot break parsing.
 */
export const businessBranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullish(),
  address: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  phone: z.string().nullish(),
  isActive: z.boolean().nullish(),
  businessId: z.string().nullish(),
});
export type BusinessBranch = z.infer<typeof businessBranchSchema>;

export type CatalogueItemQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  itemType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
};

export const businessOfferAdminSchema = z.looseObject({
  id: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  status: z.string().nullish(),
  branchId: z.string().nullish(),
  pricingType: z.string().nullish(),
  discountValue: nullableDecimal(),
  fixedPrice: nullableDecimal(),
  calculatedPrice: nullableDecimal(),
  quantity: z.number().nullish(),
  itemIds: z.array(z.string()).nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  terms: z.array(z.string()).nullish(),
  maxClaimsPerCustomer: z.number().nullish(),
  offerType: z.string().nullish(),
  loyaltyPoints: z.number().nullish(),
  rewardId: z.string().nullish(),
  branchName: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  maxClaims: z.number().nullish(),
  claimedCount: z.number().nullish(),
});
export type BusinessOfferAdmin = z.infer<typeof businessOfferAdminSchema>;

/** The admin list answers as a bare array or a `{ data }` envelope. */
export const businessOffersAdminSchema = z.union([
  z.array(businessOfferAdminSchema),
  z
    .object({ data: z.array(businessOfferAdminSchema) })
    .transform(response => response.data),
]);

/**
 * Mutations. Inputs mirror the backend class-validator DTOs field-for-field
 * (zod strips unknown keys, and the server rejects them with
 * `forbidNonWhitelisted`, so screens must not smuggle extra fields).
 */

export const catalogueItemStatusSchema = z.enum([
  'active',
  'inactive',
  'out_of_stock',
  'suspended',
  'low_stock',
  'archived',
]);

export const createCatalogueItemInputSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0).optional(),
  shortDescription: z.string().optional(),
  /** Backend requires a non-empty description; publish callers fall back to name. */
  description: z.string().min(1),
  mainImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  categoryId: z.string().uuid().optional(),
  sku: z.string().optional(),
  itemType: z.enum(['product', 'service']).optional(),
  discountType: z.enum(['percentage', 'fixed', 'none']).optional(),
  discountValue: z.number().min(0).optional(),
  stockQuantity: z.number().min(0).optional(),
  barcode: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  brand: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  variants: z.array(z.object({ type: z.string(), value: z.string() })).optional(),
  tags: z.array(z.string()).optional(),
  allowBackOrder: z.boolean().optional(),
  loyaltyPoints: z.number().min(0).optional(),
  enableLoyaltyPoints: z.boolean().optional(),
  loyaltyPointsValue: z.number().min(0).optional(),
  priceType: z.enum(['fixed', 'starting_from', 'range', 'contact']).optional(),
  priceRangeMin: z.number().min(0).optional(),
  priceRangeMax: z.number().min(0).optional(),
  duration: z.string().optional(),
  serviceMode: z.enum(['location', 'customer', 'online', 'flexible']).optional(),
  isBookable: z.boolean().optional(),
  bookingMethod: z.enum(['vemtap', 'call', 'whatsapp', 'external']).optional(),
  externalBookingLink: z.string().optional(),
  branchId: z.string().uuid(),
});
export type CreateCatalogueItemInput = z.input<typeof createCatalogueItemInputSchema>;

export const updateCatalogueItemInputSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().optional(),
  shortDescription: z.string().optional(),
  description: z.string().min(1).optional(),
  mainImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  categoryId: z.string().uuid().optional(),
  sku: z.string().optional(),
  itemType: z.enum(['product', 'service']).optional(),
  discountType: z.enum(['percentage', 'fixed', 'none']).optional(),
  discountValue: z.number().optional(),
  stockQuantity: z.number().optional(),
  barcode: z.string().optional(),
  costPrice: z.number().optional(),
  minStock: z.number().optional(),
  brand: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  variants: z.array(z.object({ type: z.string(), value: z.string() })).optional(),
  tags: z.array(z.string()).optional(),
  allowBackOrder: z.boolean().optional(),
  loyaltyPoints: z.number().optional(),
  enableLoyaltyPoints: z.boolean().optional(),
  priceType: z.enum(['fixed', 'starting_from', 'range', 'contact']).optional(),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
  duration: z.string().optional(),
  serviceMode: z.enum(['location', 'customer', 'online', 'flexible']).optional(),
  isBookable: z.boolean().optional(),
  bookingMethod: z.enum(['vemtap', 'call', 'whatsapp', 'external']).optional(),
  externalBookingLink: z.string().optional(),
  branchId: z.string().uuid().optional(),
  status: catalogueItemStatusSchema.optional(),
  applyGlobally: z.boolean().optional(),
});
export type UpdateCatalogueItemInput = z.input<typeof updateCatalogueItemInputSchema>;

export const createCatalogueOfferInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sourceProductId: z.string().uuid().optional(),
  mainImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  quantity: z.number().min(0).optional(),
  pricingType: z.enum([
    'sum',
    'percentage_discount',
    'fixed_discount_price',
    'fixed_discount_amount',
  ]),
  discountValue: z.number().min(0).optional(),
  fixedPrice: z.number().min(0).optional(),
  loyaltyPoints: z.number().min(0).optional(),
  rewardId: z.string().uuid().optional(),
  branchId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  offerType: z.string().optional(),
  audience: z.string().optional(),
  terms: z.array(z.string()).optional(),
  claimCodePrefix: z.string().max(20).optional(),
  maxClaimsPerCustomer: z.number().min(0).optional(),
  audienceTarget: z.string().optional(),
  deliveryScope: z.string().optional(),
  deliveryRadius: z.number().min(0).optional(),
  deliveryUnit: z.string().optional(),
  deliveryRegion: z.string().optional(),
  minOrderAmount: z.number().min(0).optional(),
  longDescription: z.string().optional(),
  isFeatured: z.boolean().optional(),
});
export type CreateCatalogueOfferInput = z.input<typeof createCatalogueOfferInputSchema>;

export const updateCatalogueOfferInputSchema = createCatalogueOfferInputSchema
  .partial()
  .extend({
    /** Publish/draft toggle: `active` goes live, `inactive` hides the deal. */
    status: z.enum(['active', 'inactive']).optional(),
  });
export type UpdateCatalogueOfferInput = z.input<typeof updateCatalogueOfferInputSchema>;

/** Create/update answer with the full offer row; extra keys pass through. */
export const catalogueOfferSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  branchId: z.string(),
  pricingType: z.string().nullish(),
  calculatedPrice: money,
});
export type CatalogueOfferDetail = z.infer<typeof catalogueOfferSchema>;

export const generateOfferTermsSchema = z.object({
  terms: z.array(z.string()),
});
export type GeneratedOfferTerms = z.infer<typeof generateOfferTermsSchema>;

// Re-export verification API
export * from './verificationApi';

export const catalogueApi = {
  /** Active items for one branch. Public. */
  async listBranchItems(
    branchId: string,
    query: CatalogueItemQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<CatalogueItemFeed> {
    return requestValidated<CatalogueItemFeed>(
      {
        method: 'GET',
        url: `/public/catalogue/items/branch/${branchId}`,
        params: { ...query },
        ...options,
      },
      catalogueItemFeedSchema,
    );
  },

  /**
   * One item, by uuid.
   *
   * `branchId` is optional because the endpoint treats it as such — without it
   * the item comes back at list price rather than branch price, so the booking
   * flow always sends it. The item payload carries `businessId` but no branch,
   * which is why the branch uuid travels in the route instead of being
   * recovered here.
   */
  async getItem(
    itemId: string,
    branchId?: string,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueItem> {
    return requestValidated<CatalogueItem>(
      {
        method: 'GET',
        url: `/public/catalogue/items/${itemId}`,
        params: { branchId },
        ...options,
      },
      catalogueItemSchema,
    );
  },

  /** A bare array of categories that have active items at the branch. */
  async listBranchCategories(
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueCategory[]> {
    return requestValidated<CatalogueCategory[]>(
      {
        method: 'GET',
        url: `/public/catalogue/categories/branch/${branchId}`,
        ...options,
      },
      catalogueCategoryListSchema,
    );
  },

  /** Published products across branches. Public. */
  async listPublishedProducts(
    query: CatalogueItemQuery & { sortOrder?: string } = {},
    options: ApiRequestOptions = {},
  ): Promise<z.infer<typeof publishedProductFeedSchema>> {
    return requestValidated(
      { method: 'GET', url: '/products', params: { ...query }, ...options },
      publishedProductFeedSchema,
    );
  },

  /**
   * The owner's own catalogue: every item at the branch (or every branch when
   * `branchId` is omitted), any status. Requires a business-owner token.
   */
  async listBusinessItems(
    branchId: string | undefined,
    query: Omit<CatalogueItemQuery, 'categoryId'> & { categoryId?: string } = {},
    options: ApiRequestOptions = {},
  ): Promise<BusinessCatalogueFeed> {
    return requestValidated<BusinessCatalogueFeed>(
      {
        method: 'GET',
        url: '/catalogue/items',
        // branchId is a query parameter, not part of the path; omitting it
        // returns every branch's items for the business.
        params: branchId ? { ...query, branchId } : { ...query },
        ...options,
      },
      businessCatalogueFeedSchema,
    );
  },

  /** Every branch for the signed-in business. Requires a business-owner token. */
  async listBusinessBranches(options: ApiRequestOptions = {}): Promise<BusinessBranch[]> {
    return requestValidated<BusinessBranch[]>(
      { method: 'GET', url: '/branches', ...options },
      z.array(businessBranchSchema),
    );
  },

  /** A bare array of product types. */
  async listProductTypes(
    options: ApiRequestOptions = {},
  ): Promise<z.infer<typeof productTypeSchema>[]> {
    return requestValidated(
      { method: 'GET', url: '/products/types', ...options },
      z.array(productTypeSchema),
    );
  },

  /**
   * Every offer for the business (any status), optionally branch-filtered.
   * Powers the Business hub's Deals module counts.
   */
  async listBusinessOffers(
    branchId?: string | null,
    options: ApiRequestOptions = {},
  ): Promise<BusinessOfferAdmin[]> {
    try {
      return await requestValidated<BusinessOfferAdmin[]>(
        {
          method: 'GET',
          url: '/catalogue/offers/admin',
          params: branchId ? { branchId } : {},
          ...options,
        },
        businessOffersAdminSchema,
      );
    } catch (error) {
      if (error instanceof ApiError && isPlanError(error)) {
        // Plan does not include offers/deals — return empty array so the UI
        // can show the plan‑limit CTA instead of a schema‑mismatch crash.
        return [];
      }
      throw error;
    }
  },

  /**
   * A bare array of the business's own catalogue categories (item placement,
   * not the platform taxonomy). Requires a business-owner token.
   */
  async listCatalogueCategories(
    options: ApiRequestOptions = {},
  ): Promise<CatalogueCategory[]> {
    return requestValidated<CatalogueCategory[]>(
      { method: 'GET', url: '/catalogue/categories', ...options },
      catalogueCategoryListSchema,
    );
  },

  async createCatalogueCategory(
    name: string,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueCategory> {
    return requestValidated<CatalogueCategory>(
      {
        method: 'POST',
        url: '/catalogue/categories',
        data: { name },
        ...options,
      },
      catalogueCategorySchema,
    );
  },

  /** Creates a product or service for one branch. Owner token. */
  async createCatalogueItem(
    input: CreateCatalogueItemInput,
    options: ApiRequestOptions = {},
  ): Promise<BusinessCatalogueItem> {
    return requestValidated<BusinessCatalogueItem>(
      {
        method: 'POST',
        url: '/catalogue/items',
        data: createCatalogueItemInputSchema.parse(input),
        ...options,
      },
      businessCatalogueItemSchema,
    );
  },

  async updateCatalogueItem(
    itemId: string,
    input: UpdateCatalogueItemInput,
    options: ApiRequestOptions = {},
  ): Promise<UpdatedCatalogueItem> {
    return requestValidated<UpdatedCatalogueItem>(
      {
        method: 'PATCH',
        url: `/catalogue/items/${itemId}`,
        data: updateCatalogueItemInputSchema.parse(input),
        ...options,
      },
      updatedCatalogueItemSchema,
    );
  },

  /**
   * Adds an existing item to another branch (`POST /catalogue/items/:id/import`).
   * Multi-branch creates are a create for the first branch plus one import per
   * remaining branch.
   */
  async importItemToBranch(
    itemId: string,
    targetBranchId: string,
    options: ApiRequestOptions = {},
  ): Promise<BusinessCatalogueItem> {
    return requestValidated<BusinessCatalogueItem>(
      {
        method: 'POST',
        url: `/catalogue/items/${itemId}/import`,
        data: { targetBranchId },
        ...options,
      },
      businessCatalogueItemSchema,
    );
  },

  /**
   * Removes an item everywhere (`DELETE /catalogue/items/:id?applyGlobally=true`).
   * The backend requires either `branchId` or `applyGlobally`; a permanent
   * delete means "gone", not "unlinked from one branch". The hub's own action
   * archives instead (PATCH status=archived) so history survives.
   */
  async deleteCatalogueItem(
    itemId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ id: string }> {
    return requestValidated<{ id: string }>(
      {
        method: 'DELETE',
        url: `/catalogue/items/${itemId}?applyGlobally=true`,
        ...options,
      },
      z.looseObject({ id: z.string() }),
    );
  },

  async updateCatalogueCategory(
    categoryId: string,
    name: string,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueCategory> {
    return requestValidated<CatalogueCategory>(
      {
        method: 'PATCH',
        url: `/catalogue/categories/${categoryId}`,
        data: { name },
        ...options,
      },
      catalogueCategorySchema,
    );
  },

  /**
   * Deletes a category (`DELETE /catalogue/categories/:id`). The backend
   * detaches the category from its items first, so the row can go even while
   * products still reference it.
   */
  async deleteCatalogueCategory(
    categoryId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ id: string }> {
    return requestValidated<{ id: string }>(
      {
        method: 'DELETE',
        url: `/catalogue/categories/${categoryId}`,
        ...options,
      },
      z.looseObject({ id: z.string() }),
    );
  },

  /**
   * Reorders categories (`PATCH /catalogue/categories/reorder`).
   * Sends the complete ordered list of category ids; backend assigns
   * sortOrder = index.
   */
  async reorderCatalogueCategories(
    orderedIds: string[],
    options: ApiRequestOptions = {},
  ): Promise<CatalogueCategory[]> {
    return requestValidated<CatalogueCategory[]>(
      {
        method: 'PATCH',
        url: '/catalogue/categories/reorder',
        data: { orderedIds },
        ...options,
      },
      z.array(catalogueCategorySchema),
    );
  },

  /** Creates a deal. The service requires `itemIds` or a `sourceProductId`. */
  async createCatalogueOffer(
    input: CreateCatalogueOfferInput,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueOfferDetail> {
    return requestValidated<CatalogueOfferDetail>(
      {
        method: 'POST',
        url: '/catalogue/offers',
        data: createCatalogueOfferInputSchema.parse(input),
        ...options,
      },
      catalogueOfferSchema,
    );
  },

  async updateCatalogueOffer(
    offerId: string,
    input: UpdateCatalogueOfferInput,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueOfferDetail> {
    return requestValidated<CatalogueOfferDetail>(
      {
        method: 'PATCH',
        url: `/catalogue/offers/${offerId}`,
        data: updateCatalogueOfferInputSchema.parse(input),
        ...options,
      },
      catalogueOfferSchema,
    );
  },

  /** AI-drafted deal terms; consumes one AI credit server-side. */
  async generateOfferTerms(
    input: { title?: string; name?: string; description?: string },
    options: ApiRequestOptions = {},
  ): Promise<GeneratedOfferTerms> {
    return requestValidated<GeneratedOfferTerms>(
      {
        method: 'POST',
        url: '/catalogue/offers/generate-terms',
        data: input,
        ...options,
      },
      generateOfferTermsSchema,
    );
  },
};
