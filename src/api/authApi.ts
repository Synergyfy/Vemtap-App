import { z } from 'zod';
import { apiClient, createIdempotencyKey, request, requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

export const loginInputSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});

export const sessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string().nullable().optional(),
  }),
  tokens: tokensSchema,
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type Session = z.infer<typeof sessionSchema>;

export const authApi = {
  async login(input: LoginInput, options: ApiRequestOptions = {}): Promise<Session> {
    return requestValidated<Session>(
      {
        method: 'POST',
        url: '/auth/login',
        data: input,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      sessionSchema,
    );
  },

  async register(
    input: LoginInput & { displayName: string },
    options: ApiRequestOptions = {},
  ): Promise<Session> {
    return requestValidated<Session>(
      {
        method: 'POST',
        url: '/auth/register',
        data: input,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      sessionSchema,
    );
  },

  async logout(options: ApiRequestOptions = {}): Promise<void> {
    await request<void>({
      method: 'POST',
      url: '/auth/logout',
      idempotencyKey: createIdempotencyKey(),
      ...options,
    });
  },

  async me(options: ApiRequestOptions = {}) {
    return apiClient.get('/auth/me', { signal: options.signal });
  },
};
