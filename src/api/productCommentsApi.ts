import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import { nullableFlag, nullableNumber } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Comments on catalogue products.
 *
 * Customers read them publicly (`GET /public/catalogue/items/:itemId/comments`)
 * and, signed in, post one comment per product, then edit or delete it. Comments
 * publish immediately; the business answers with a public reply or removes the
 * comment from `/catalogue/business/comments`.
 */

export const productCommentSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  comment: z.string(),
  rating: z.number().nullable().optional(),
  merchantReply: z.string().nullable().optional(),
  repliedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
  /** True on the caller's own comment when the request carried a token. */
  isMine: nullableFlag(false),
});
export type ProductComment = z.infer<typeof productCommentSchema>;

export const productCommentsPageSchema = z.object({
  comments: z.array(productCommentSchema),
  total: nullableNumber(0),
  page: nullableNumber(1),
  limit: nullableNumber(10),
  averageRating: z.number().nullable().optional(),
  ratingCount: nullableNumber(0),
});
export type ProductCommentsPage = z.infer<typeof productCommentsPageSchema>;

/** Likes on a catalogue product or service. */
export const productLikeStatusSchema = z.object({
  liked: nullableFlag(false),
  likesCount: nullableNumber(0),
});
export type ProductLikeStatus = z.infer<typeof productLikeStatusSchema>;

export interface ProductCommentInput {
  comment: string;
  rating?: number;
}

export const businessProductCommentSchema = productCommentSchema.extend({
  itemId: z.string(),
  itemName: z.string().nullable().optional(),
  itemImage: z.string().nullable().optional(),
});
export type BusinessProductComment = z.infer<typeof businessProductCommentSchema>;

export const businessProductCommentsPageSchema = z.object({
  comments: z.array(businessProductCommentSchema),
  total: nullableNumber(0),
  page: nullableNumber(1),
  limit: nullableNumber(20),
});

export type ProductCommentReplyFilter = 'all' | 'unreplied' | 'replied';

const distributionSchema = z.object({
  1: nullableNumber(0),
  2: nullableNumber(0),
  3: nullableNumber(0),
  4: nullableNumber(0),
  5: nullableNumber(0),
});

export const productCommentsSummarySchema = z.object({
  total: nullableNumber(0),
  unreplied: nullableNumber(0),
  averageRating: z.number().nullable().optional(),
  ratingCount: nullableNumber(0),
  ratingDistribution: distributionSchema,
});
export type ProductCommentsSummary = z.infer<typeof productCommentsSummarySchema>;

export const productCommentsApi = {
  /** Public; `liked` is only true when the request carries the caller's token. */
  async getLikeStatus(
    itemId: string,
    options: ApiRequestOptions = {},
  ): Promise<ProductLikeStatus> {
    return requestValidated<ProductLikeStatus>(
      { method: 'GET', url: `/public/catalogue/items/${itemId}/likes`, ...options },
      productLikeStatusSchema,
    );
  },

  /** Authenticated and idempotent: like (`true`) or unlike (`false`). */
  async setLiked(
    itemId: string,
    liked: boolean,
    options: ApiRequestOptions = {},
  ): Promise<ProductLikeStatus> {
    return requestValidated<ProductLikeStatus>(
      {
        method: liked ? 'POST' : 'DELETE',
        url: `/catalogue/items/${itemId}/like`,
        ...options,
      },
      productLikeStatusSchema,
    );
  },

  async list(
    itemId: string,
    query: { page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<ProductCommentsPage> {
    return requestValidated(
      {
        method: 'GET',
        url: `/public/catalogue/items/${itemId}/comments`,
        params: query,
        ...options,
      },
      productCommentsPageSchema,
    );
  },

  async create(
    itemId: string,
    input: ProductCommentInput,
    options: ApiRequestOptions = {},
  ): Promise<ProductComment> {
    return requestValidated(
      {
        method: 'POST',
        url: `/catalogue/items/${itemId}/comments`,
        data: input,
        ...options,
      },
      productCommentSchema,
    );
  },

  async update(
    itemId: string,
    commentId: string,
    input: Partial<ProductCommentInput>,
    options: ApiRequestOptions = {},
  ): Promise<ProductComment> {
    return requestValidated(
      {
        method: 'PATCH',
        url: `/catalogue/items/${itemId}/comments/${commentId}`,
        data: input,
        ...options,
      },
      productCommentSchema,
    );
  },

  async remove(
    itemId: string,
    commentId: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/catalogue/items/${itemId}/comments/${commentId}`,
      ...options,
    });
  },

  async listForBusiness(
    query: { replied?: ProductCommentReplyFilter; itemId?: string; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<BusinessProductComment[]> {
    const page = await requestValidated(
      {
        method: 'GET',
        url: '/catalogue/business/comments',
        params: { limit: 50, ...query },
        ...options,
      },
      businessProductCommentsPageSchema,
    );
    return page.comments;
  },

  async summaryForBusiness(
    options: ApiRequestOptions = {},
  ): Promise<ProductCommentsSummary> {
    return requestValidated(
      { method: 'GET', url: '/catalogue/business/comments/summary', ...options },
      productCommentsSummarySchema,
    );
  },

  async reply(
    commentId: string,
    reply: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'POST',
      url: `/catalogue/business/comments/${commentId}/reply`,
      data: { reply },
      ...options,
    });
  },

  async removeReply(commentId: string, options: ApiRequestOptions = {}): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/catalogue/business/comments/${commentId}/reply`,
      ...options,
    });
  },

  async removeByBusiness(
    commentId: string,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/catalogue/business/comments/${commentId}`,
      ...options,
    });
  },
};
