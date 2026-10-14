import { z } from 'zod';
import type { ApiRequestOptions } from '@app-types/api';
import { requestValidated } from './client';
import { nullableArray, nullableText, nullableTimestamp } from './schemaHelpers';

/**
 * Business verification on bytID (see apps/backend/docs/
 * verification-and-trial-integration.md). Identity = the person running the
 * account (ID + selfie); business = CAC registration, or an unregistered
 * business reviewed by a person.
 */

export const IDENTITY_ID_TYPES = [
  'nin',
  'drivers_license',
  'voters_card',
  'passport',
] as const;
export type IdentityIdType = (typeof IDENTITY_ID_TYPES)[number];

export type VerificationCheckStatus = 'pending' | 'verified' | 'needs_review' | 'failed';
export type BusinessVerificationStatus =
  'unverified' | 'in_progress' | 'needs_review' | 'verified' | 'rejected';

export const verificationCheckSchema = z.looseObject({
  id: z.string(),
  kind: z.enum(['identity', 'business']),
  idType: z.string(),
  status: z.enum(['pending', 'verified', 'needs_review', 'failed']),
  maskedId: z
    .string()
    .nullish()
    .transform(value => value ?? null),
  recordName: z
    .string()
    .nullish()
    .transform(value => value ?? null),
  reasons: nullableArray(z.string()),
  faceMatch: z
    .looseObject({ status: z.string(), score: z.number().nullish() })
    .nullish()
    .transform(value => value ?? null),
  createdAt: nullableText(),
  reviewedAt: nullableTimestamp(),
  reviewNote: z
    .string()
    .nullish()
    .transform(value => value ?? null),
});
export type VerificationCheck = z.infer<typeof verificationCheckSchema>;

export const verificationStatusSchema = z.looseObject({
  status: z.enum(['unverified', 'in_progress', 'needs_review', 'verified', 'rejected']),
  isVerified: z.boolean(),
  verifiedAt: nullableTimestamp(),
  nextStep: z.enum(['identity', 'business', 'review', 'done']),
  identity: verificationCheckSchema.nullish().transform(value => value ?? null),
  business: verificationCheckSchema.nullish().transform(value => value ?? null),
});
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export const livenessSessionSchema = z.looseObject({
  sessionId: z.string(),
  url: z.string(),
  status: nullableText('pending'),
  expiresAt: nullableTimestamp(),
});
export type LivenessSession = z.infer<typeof livenessSessionSchema>;

export interface VerifyIdentityInput {
  idType: IdentityIdType;
  idNumber?: string;
  firstName: string;
  lastName: string;
  dob?: string;
  livenessSessionId: string;
  /** Passport only: uploaded data-page photo. */
  documentUrl?: string;
}

/** Friendly copy for each reason code the backend can return. */
export const VERIFICATION_REASON_COPY: Record<string, string> = {
  id_not_found: "We couldn't find that ID number. Check it and try again.",
  face_not_matched: "Your selfie didn't match the photo on the ID.",
  face_unavailable: "We couldn't compare your selfie with the ID photo.",
  name_mismatch: "The name on the ID doesn't match your account name.",
  registry_unavailable: 'The ID registry was not responding. Please try again shortly.',
  provider_error: 'Something went wrong while checking. Please try again.',
  cac_not_found: "We couldn't find that CAC number.",
  business_name_mismatch: "The registered name doesn't match your business name.",
  owner_not_listed: "You aren't listed as a director or owner on the CAC record.",
  company_not_active: 'The company is not active on the CAC register.',
  unregistered_business: 'Our team will review your business details.',
  manual_review_requested: 'You asked our team to review this.',
};

export function reasonCopy(reasons: string[]): string[] {
  return reasons.map(
    reason => VERIFICATION_REASON_COPY[reason] ?? reason.replace(/_/g, ' '),
  );
}

export const verificationApi = {
  status(options: ApiRequestOptions = {}) {
    return requestValidated<VerificationStatus>(
      { method: 'GET', url: '/verification/status', ...options },
      verificationStatusSchema,
    );
  },

  startLiveness(redirectUrl: string, options: ApiRequestOptions = {}) {
    return requestValidated<LivenessSession>(
      {
        method: 'POST',
        url: '/verification/liveness-sessions',
        data: { redirectUrl },
        ...options,
      },
      livenessSessionSchema,
    );
  },

  verifyIdentity(input: VerifyIdentityInput, options: ApiRequestOptions = {}) {
    return requestValidated<VerificationCheck>(
      { method: 'POST', url: '/verification/identity', data: input, ...options },
      verificationCheckSchema,
    );
  },

  verifyBusiness(registrationNumber: string, options: ApiRequestOptions = {}) {
    return requestValidated<VerificationCheck>(
      {
        method: 'POST',
        url: '/verification/business',
        data: { registrationNumber },
        ...options,
      },
      verificationCheckSchema,
    );
  },

  submitUnregistered(
    input: { note?: string; documentUrls?: string[] },
    options: ApiRequestOptions = {},
  ) {
    return requestValidated<VerificationCheck>(
      {
        method: 'POST',
        url: '/verification/business/unregistered',
        data: input,
        ...options,
      },
      verificationCheckSchema,
    );
  },

  requestManualReview(
    input: { checkId?: string; note?: string },
    options: ApiRequestOptions = {},
  ) {
    return requestValidated<VerificationCheck>(
      { method: 'POST', url: '/verification/manual-review', data: input, ...options },
      verificationCheckSchema,
    );
  },
};
