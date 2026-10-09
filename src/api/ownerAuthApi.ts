import { z } from 'zod';
import { messageResponseSchema, sessionSchema } from '@api/authApi';
import type { Session } from '@api/authApi';
import { createIdempotencyKey, requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Business-owner registration. Schemas come from live probes on the test API.
 *
 * The important discovery: `registerOwner` takes **no OTP code**, yet the
 * endpoint refuses to run until the email's OTP has been verified by a
 * separate call. So the flow is three requests, in order:
 *
 *   1. `requestOwnerOtp`  — identity only, keyed by email + role
 *   2. `verifyOtp`        — email + a **4-character** code (longer codes are
 *                           rejected outright by the API, not merely invalid)
 *   3. `registerOwner`    — 400 "OTP must be verified before completing
 *                           registration" if step 2 has not happened
 *
 * Because the gate lives on the server, there is no client-side flag to track:
 * `registerOwner` failing with that message means the user needs step 2, so
 * `isOtpVerifiedError` exists to recognise it rather than matching on copy at
 * the call site.
 *
 * Everything in the DTO beyond the credentials is business profile data, so the
 * profile screens are pre-signup collection that batches into one payload — the
 * API has no separate "create business profile" step for an owner who has not
 * registered yet (`POST /business-profiling` is a different, unmapped flow).
 */

/** Only `email` is required; everything else is rejected or ignored. */
export const ownerOtpRequestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
});
export type OwnerOtpRequest = z.infer<typeof ownerOtpRequestSchema>;

/**
 * The code is exactly 4 characters. The API validates length before value, so a
 * 6-digit code fails with "code must be shorter than or equal to 4 characters"
 * rather than "Invalid OTP" — the length is a hard constraint, not a hint.
 */
export const ownerOtpVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(4),
});
export type OwnerOtpVerify = z.infer<typeof ownerOtpVerifySchema>;

/** Loose on purpose: the API accepts a wide business profile in one payload. */
export const ownerRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),

  businessName: z.string().optional(),
  businessLogo: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  otherSubcategoryName: z.string().optional(),
  visitors: z.string().optional(),
  goals: z.array(z.string()).optional(),

  whatsappNumber: z.string().optional(),
  officialEmail: z.string().optional(),
  businessNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  businessWebsite: z.string().optional(),
  isRegistered: z.boolean().optional(),
  engagement: z.record(z.string(), z.unknown()).optional(),
  referralCode: z.string().optional(),
});
export type OwnerRegistration = z.infer<typeof ownerRegistrationSchema>;

/**
 * Business fields the upgrade endpoint accepts. Credentials are not
 * re-collected — the caller already has a session — but local-auth accounts
 * must confirm their password.
 */
export type UpgradeToOwnerInput = Omit<OwnerRegistration, 'email' | 'password'> & {
  password?: string;
};

/**
 * `check-status` is what an owner polls while waiting for admin approval.
 *
 * Only `exists` comes back when the account is unknown. For an account that does
 * exist, the API adds `role`, `email`, `isPasswordChanged` and `hasRealEmail` —
 * which is what lets a returning owner be routed straight to sign-in rather than
 * back through registration.
 */
export const accountStatusSchema = z.object({
  exists: z.boolean(),
  role: z.string().nullish(),
  email: z.string().nullish(),
  isPasswordChanged: z.boolean().nullish(),
  hasRealEmail: z.boolean().nullish(),
});
export type AccountStatus = z.infer<typeof accountStatusSchema>;

const OTP_GATE_MESSAGE = 'OTP must be verified before completing registration';

/**
 * Reads the server message out of either shape this can arrive as:
 *
 *  - an `ApiError`, which is what every caller actually receives. Its `message`
 *    is a plain `Error` property and there is no `success`/`statusCode`, so
 *    matching only on the raw envelope would never fire — the gate would be
 *    treated as a generic failure and the screen would not route back to OTP
 *    verification.
 *  - the raw `{success:false, statusCode:400, message}` envelope, if a caller
 *    ever gets one before the client wraps it.
 */
function serverMessage(error: unknown): unknown {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message?: unknown }).message;
  }
  return undefined;
}

export function isOtpVerifiedError(error: unknown): boolean {
  const message = serverMessage(error);
  if (typeof message === 'string') return message === OTP_GATE_MESSAGE;
  // The envelope may carry `message` as an array of reasons.
  if (Array.isArray(message)) return message.includes(OTP_GATE_MESSAGE);
  return false;
}

export const ownerAuthApi = {
  /** Step 1. Returns `{message}`; the code goes to the given email. */
  async requestOwnerOtp(
    payload: OwnerOtpRequest,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await requestValidated(
      {
        method: 'POST',
        url: '/auth/register/owner/request-otp',
        data: payload,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      messageResponseSchema,
    );
  },

  /** Step 2. `code` is exactly 4 characters. Returns `{message}`. */
  async verifyOtp(
    payload: OwnerOtpVerify,
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await requestValidated(
      {
        method: 'POST',
        url: '/auth/otp/verify',
        data: payload,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      messageResponseSchema,
    );
  },

  /** Step 3. 400s with `isOtpVerifiedError` unless step 2 has succeeded. */
  async registerOwner(
    payload: OwnerRegistration,
    options: ApiRequestOptions = {},
  ): Promise<Session> {
    return requestValidated(
      {
        method: 'POST',
        url: '/auth/register/owner',
        data: payload,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      sessionSchema,
    );
  },

  /**
   * Turn an already-authenticated customer into an owner in place. Keeps the
   * customer side intact so the account can switch between both apps.
   */
  async upgradeToOwner(
    payload: UpgradeToOwnerInput,
    options: ApiRequestOptions = {},
  ): Promise<Session> {
    return requestValidated(
      {
        method: 'POST',
        url: '/auth/upgrade-to-owner',
        data: payload,
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      sessionSchema,
    );
  },

  /** Poll while an owner waits on admin approval. */
  async checkStatus(
    identifier: string,
    options: ApiRequestOptions = {},
  ): Promise<AccountStatus> {
    return requestValidated(
      {
        method: 'POST',
        url: '/auth/check-status',
        data: { identifier },
        idempotencyKey: createIdempotencyKey(),
        ...options,
      },
      accountStatusSchema,
    );
  },
};
