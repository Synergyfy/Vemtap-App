import { z } from 'zod';
import { nullableFlag } from '@api/schemaHelpers';
import { requestValidated } from '@api/client';
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
  total: z.number().default(0),
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
  total: z.number().default(0),
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

export const businessCatalogueFeedSchema = z.object({
  data: z.array(businessCatalogueItemSchema),
  total: z.number().default(0),
  page: z.number().nullish(),
  limit: z.number().nullish(),
  totalPages: z.number().nullish(),
  hasNextPage: nullableFlag(false),
  hasPrevPage: nullableFlag(false),
});
export type BusinessCatalogueFeed = z.infer<typeof businessCatalogueFeedSchema>;

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

  async getItem(
    itemId: string,
    branchId: string,
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
   * The owner's own catalogue: every item at the branch, any status. Requires a
   * business-owner token.
   */
  async listBusinessItems(
    branchId: string,
    query: Omit<CatalogueItemQuery, 'categoryId'> & { categoryId?: string } = {},
    options: ApiRequestOptions = {},
  ): Promise<BusinessCatalogueFeed> {
    return requestValidated<BusinessCatalogueFeed>(
      {
        method: 'GET',
        url: '/catalogue/items',
        // branchId is a required query parameter here, not part of the path.
        params: { ...query, branchId },
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
};
