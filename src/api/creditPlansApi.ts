import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';
import { decimal } from '@api/schemaHelpers';

/**
 * Messaging and AI credit bundles (`/credit-plans`). A bundle is bought by
 * card: start a checkout, open its Paystack page, then confirm the reference
 * (the webhook awards it too, exactly once).
 */
export const creditPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  price: decimal(),
  currency: z.string().nullish(),
  smsAmount: z.number().catch(0),
  emailAmount: z.number().catch(0),
  whatsappAmount: z.number().catch(0),
  aiAmount: z.number().catch(0),
});
export type CreditPlan = z.infer<typeof creditPlanSchema>;

export const creditCheckoutSchema = z.object({
  reference: z.string(),
  amount: decimal(),
  authorizationUrl: z.string().nullish(),
});
export type CreditCheckout = z.infer<typeof creditCheckoutSchema>;

export const creditCheckoutConfirmationSchema = z.object({
  reference: z.string(),
  status: z.enum(['completed', 'pending']),
});

export const creditPlansApi = {
  async list(options: ApiRequestOptions = {}): Promise<CreditPlan[]> {
    return requestValidated(
      { method: 'GET', url: '/credit-plans', ...options },
      z.array(creditPlanSchema),
    );
  },

  async startCheckout(
    planId: string,
    callbackUrl: string,
    options: ApiRequestOptions = {},
  ): Promise<CreditCheckout> {
    return requestValidated(
      {
        method: 'POST',
        url: `/credit-plans/${encodeURIComponent(planId)}/checkout`,
        data: { callbackUrl },
        ...options,
      },
      creditCheckoutSchema,
    );
  },

  async confirmCheckout(reference: string, options: ApiRequestOptions = {}) {
    return requestValidated(
      {
        method: 'POST',
        url: `/credit-plans/checkout/${encodeURIComponent(reference)}/confirm`,
        ...options,
      },
      creditCheckoutConfirmationSchema,
    );
  },
};
