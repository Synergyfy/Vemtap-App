import { z } from 'zod';

/** Standard envelope returned by every Vemtap API endpoint. */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    meta: z
      .object({
        page: z.number().optional(),
        perPage: z.number().optional(),
        total: z.number().optional(),
        totalPages: z.number().optional(),
        hasNextPage: z.boolean().optional(),
        requestId: z.string().optional(),
      })
      .optional(),
  });

export const paginationMetaSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
});

/**
 * Error envelope as the live API returns it:
 * { success:false, statusCode, timestamp, path, method, error, message }
 * `message` is a string for auth/runtime errors and a string[] for validation
 * failures, so it is normalised to one readable string.
 */
export const apiErrorSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
  method: z.string().optional(),
  error: z.string().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

export const apiErrorResponseSchema = apiErrorSchema;

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ApiErrorShape = z.infer<typeof apiErrorSchema>;

export type ApiResponse<T> = z.infer<
  ReturnType<typeof apiResponseSchema<z.ZodType<T>>>
> & {
  data: T;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: PaginationMeta;
};

export interface ApiRequestOptions {
  /** UUID applied to non-idempotent mutations so retries are safe. */
  idempotencyKey?: string;
  signal?: AbortSignal;
  skipAuthRefresh?: boolean;
  timeoutMs?: number;
}
