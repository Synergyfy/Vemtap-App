import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import type { ApiRequestOptions, PaginatedResponse, PaginationMeta } from '@app-types/api';
import { paginationMetaSchema } from '@app-types/api';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

const userListSchema = z.object({
  users: z.array(userSchema),
  meta: paginationMetaSchema,
});

export interface FetchUsersParams {
  page?: number;
  perPage?: number;
  query?: string;
}

export const userApi = {
  async fetchUsers(
    params: FetchUsersParams = {},
    options: ApiRequestOptions = {},
  ): Promise<PaginatedResponse<User>> {
    const payload = await requestValidated<{ users: User[]; meta: PaginationMeta }>(
      {
        method: 'GET',
        url: '/users',
        params: {
          page: params.page ?? 1,
          perPage: params.perPage ?? 20,
          ...(params.query ? { q: params.query } : {}),
        },
        ...options,
      },
      userListSchema,
    );

    return {
      success: true,
      data: payload.users,
      meta: payload.meta,
    };
  },

  async fetchUserById(id: string, options: ApiRequestOptions = {}): Promise<User> {
    const result = await request<{ user: User }>({
      method: 'GET',
      url: `/users/${id}`,
      ...options,
    });
    return userSchema.parse(result.user);
  },
};
