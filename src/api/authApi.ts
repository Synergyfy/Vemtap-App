import { z } from 'zod';
import {
  nullableFlag,
  nullableRelation,
  nullableStringArray,
  nullableText,
  nullableTimestamp,
} from '@api/schemaHelpers';
import { createIdempotencyKey, request, requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Schemas mirror the live test API (testapi.vemtap.com/api-docs, OpenAPI 3.0.0).
 * The API issues a single access token — there is no refresh token in any DTO —
 * so the session is `{ access_token, user }`, not a nested `tokens` object.
 */

export const loginInputSchema = z.object({
  /** Email, phone or unique code — the API resolves all three. */
  identifier: z.string().min(1, 'Enter your email or phone'),
  password: z.string().min(1, 'Enter your password'),
  twoFactorCode: z.string().optional(),
});

export const registerInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.string().optional(),
  referralCode: z.string().optional(),
  businessName: z.string().optional(),
  category: z.string().optional(),
  monthlyVisitors: z.string().optional(),
  goal: z.string().optional(),
  businessId: z.string().optional(),
});

/** `User` DTO. Only the fields the app reads are required; the API sends "" for unset ones. */
/**
 * The `User` entity.
 *
 * Fields the API's `User` DTO marks nullable are coerced rather than defaulted:
 * the database columns are genuinely null and the API sends an explicit `null`,
 * which `z.string().default('')` rejects (a default only fills an *absent* key).
 * Required columns — `email`, `firstName`, `lastName`, `role`, `status`,
 * `authProvider` — stay strict, so a genuinely malformed user still fails.
 */
export const userSchema = z.object({
  // Required by the API; kept strict so real contract breaks are caught.
  email: z.string(),
  firstName: z.string().default(''),
  lastName: z.string().default(''),
  role: z.string().default('customer'),
  status: z.string().default(''),
  authProvider: z.string().default('customer'),

  // Nullable columns.
  roleTag: nullableText(),
  uniqueCode: nullableText(),
  referralCode: nullableText(),
  avatar: nullableText(),
  phone: nullableText(),
  jobTitle: nullableText(),
  googleId: nullableText(),
  businessId: nullableText(),
  branchId: nullableText(),
  lastActive: nullableTimestamp(),
  twoFactorSecret: nullableText(),

  // Nullable flags and arrays.
  isPasswordChanged: nullableFlag(false),
  twoFactorEnabled: nullableFlag(false),
  optOut: nullableFlag(false),
  emailVerified: nullableFlag(false),
  permissions: nullableStringArray(),
  optInChannels: nullableStringArray(),

  /**
   * `business` / `branch` are full entities the API embeds when it wants to,
   * and omits otherwise. The app does not read them — it uses `businessId` /
   * `branchId` and fetches the entity from its own endpoint — so they stay loose
   * rather than being pinned to a schema that would reject a partial relation.
   */
  business: nullableRelation(z.record(z.string(), z.unknown())),
  branch: nullableRelation(z.record(z.string(), z.unknown())),
});

export const sessionSchema = z.object({
  access_token: z.string().min(1),
  user: userSchema,
  isNewUser: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type User = z.infer<typeof userSchema>;
/** Session as the API returns it. The access token is stored in secure storage, not here. */
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
    input: RegisterInput,
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

  async fetchProfile(options: ApiRequestOptions = {}): Promise<User> {
    return requestValidated<User>(
      { method: 'GET', url: '/auth/profile', ...options },
      userSchema,
    );
  },

  async changePassword(
    input: { currentPassword: string; newPassword: string },
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'POST',
      url: '/auth/change-password',
      data: input,
      idempotencyKey: createIdempotencyKey(),
      ...options,
    });
  },

  async me(options: ApiRequestOptions = {}): Promise<User> {
    return authApi.fetchProfile(options);
  },
};

/** Endpoints the customer registration flow uses, mirroring the live API. */
export const messageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponse = z.infer<typeof messageResponseSchema>;

export const requestSignupOtpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  branchId: z.string().optional(),
});

export const verifyAndSetPinSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1, 'Enter the code we sent you'),
  pin: z.string().length(6, 'PIN must be 6 digits'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const resetPinSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(1),
  newPin: z.string().length(6),
});

export type RequestSignupOtpInput = z.infer<typeof requestSignupOtpSchema>;
export type VerifyAndSetPinInput = z.infer<typeof verifyAndSetPinSchema>;
export type ResetPinInput = z.infer<typeof resetPinSchema>;

export const customerAuthApi = {
  /** Step 1 — emails the 6-digit code. */
  async requestSignupOtp(
    input: RequestSignupOtpInput,
    options: ApiRequestOptions = {},
  ): Promise<MessageResponse> {
    return requestValidated<MessageResponse>(
      {
        method: 'POST',
        url: '/auth/customer/register/request-otp',
        data: input,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      messageResponseSchema,
    );
  },

  /** Step 2 — verifies the code, sets the 6-digit PIN and returns the session. */
  async verifyAndSetPin(
    input: VerifyAndSetPinInput,
    options: ApiRequestOptions = {},
  ): Promise<Session> {
    return requestValidated<Session>(
      {
        method: 'POST',
        url: '/auth/customer/register/verify-and-set-pin',
        data: input,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      sessionSchema,
    );
  },

  async requestPinReset(
    input: { email: string },
    options: ApiRequestOptions = {},
  ): Promise<MessageResponse> {
    return requestValidated<MessageResponse>(
      {
        method: 'POST',
        url: '/auth/customer/pin/forgot',
        data: input,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      messageResponseSchema,
    );
  },

  async resetPin(
    input: ResetPinInput,
    options: ApiRequestOptions = {},
  ): Promise<MessageResponse> {
    return requestValidated<MessageResponse>(
      {
        method: 'POST',
        url: '/auth/customer/pin/reset',
        data: input,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      messageResponseSchema,
    );
  },

  async completeSetup(
    input: { identifier: string; email: string },
    options: ApiRequestOptions = {},
  ): Promise<MessageResponse> {
    return requestValidated<MessageResponse>(
      {
        method: 'POST',
        url: '/auth/customer/complete-setup',
        data: input,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      messageResponseSchema,
    );
  },
};
