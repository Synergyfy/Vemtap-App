import { z } from 'zod';
import { requestValidated } from './client';

export const ninVerificationInputSchema = z.object({
  documentUrl: z.string().url(),
  nin: z.string().min(11).max(11),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
});

export type NinVerificationInput = z.infer<typeof ninVerificationInputSchema>;

export const cacVerificationInputSchema = z.object({
  documentUrl: z.string().url(),
  cacNumber: z.string().min(1),
  businessName: z.string().min(1),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
});

export type CacVerificationInput = z.infer<typeof cacVerificationInputSchema>;

export const verificationResultSchema = z.object({
  success: z.boolean(),
  verificationId: z.string(),
  status: z.enum(['verified', 'failed', 'pending']),
  message: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type VerificationResult = z.infer<typeof verificationResultSchema>;

export const verificationApi = {
  async verifyNin(
    input: NinVerificationInput,
    options: { signal?: AbortSignal } = {},
  ): Promise<VerificationResult> {
    return requestValidated<VerificationResult>(
      {
        method: 'POST',
        url: '/verification/nin',
        data: ninVerificationInputSchema.parse(input),
        signal: options.signal,
      },
      verificationResultSchema,
    );
  },

  async verifyCac(
    input: CacVerificationInput,
    options: { signal?: AbortSignal } = {},
  ): Promise<VerificationResult> {
    return requestValidated<VerificationResult>(
      {
        method: 'POST',
        url: '/verification/cac',
        data: cacVerificationInputSchema.parse(input),
        signal: options.signal,
      },
      verificationResultSchema,
    );
  },
};
