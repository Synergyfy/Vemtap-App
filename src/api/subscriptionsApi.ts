import { z } from 'zod';
import type { ApiRequestOptions } from '@app-types/api';
import { requestValidated } from './client';
import {
  nullableArray,
  nullableFlag,
  nullableNumber,
  nullableText,
  nullableTimestamp,
} from './schemaHelpers';

/**
 * Plans, the free trial and paid subscriptions (see apps/backend/docs/
 * verification-and-trial-integration.md). Trials are free and never charged;
 * paying goes through Paystack and is confirmed by the backend webhook.
 */

/** Postgres decimals arrive as strings ("15000.00"). */
const money = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform(value => (value === null || value === undefined ? 0 : Number(value) || 0));

export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

export const planSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  description: nullableText(),
  monthlyPrice: money,
  quarterlyPrice: money,
  yearlyPrice: money,
  currency: nullableText('NGN'),
  isFree: nullableFlag(false),
  isActive: nullableFlag(true),
  trialDurationDays: nullableNumber(0),
  permissionsConfiguredAt: nullableTimestamp(),
  isPopular: nullableFlag(false),
  /** Marketing bullet points, e.g. "3 Branches". */
  features: nullableArray(z.unknown()).transform(items =>
    items.filter((item): item is string => typeof item === 'string'),
  ),
});
export type Plan = z.infer<typeof planSchema>;

export const activeSubscriptionSchema = z
  .looseObject({
    id: z.string(),
    planId: z.string(),
    status: z.enum(['active', 'trial', 'canceled', 'expired']),
    billingPeriod: z
      .string()
      .nullish()
      .transform(value => value ?? null),
    startDate: nullableTimestamp(),
    endDate: nullableTimestamp(),
    trialEndsAt: nullableTimestamp(),
    isTrial: nullableFlag(false),
    daysRemaining: z
      .number()
      .nullish()
      .transform(value => value ?? null),
    trialEligible: nullableFlag(false),
    trialUsedAt: nullableTimestamp(),
    plan: z
      .looseObject({
        id: z.string(),
        name: z.string(),
        monthlyPrice: money,
        isFree: nullableFlag(false),
        trialDurationDays: z.number().nullish(),
      })
      .nullish()
      .transform(value => value ?? null),
  })
  .nullable();
export type ActiveSubscription = z.infer<typeof activeSubscriptionSchema>;

export const checkoutSchema = z.looseObject({
  reference: z.string(),
  access_code: nullableText(),
  authorization_url: nullableText(),
});
export type Checkout = z.infer<typeof checkoutSchema>;

export const billingHistorySchema = z.looseObject({
  data: nullableArray(
    z.looseObject({
      id: z.string(),
      reference: nullableText(),
      amount: money,
      currency: nullableText('NGN'),
      status: nullableText(),
      purpose: nullableText(),
      planId: z.string().nullish(),
      billingPeriod: z.string().nullish(),
      subtotal: z.number().nullish(),
      taxAmount: z.number().nullish(),
      createdAt: nullableText(),
    }),
  ),
  total: nullableNumber(0),
  page: nullableNumber(1),
  limit: nullableNumber(20),
  hasNextPage: nullableFlag(false),
});
export type BillingHistory = z.infer<typeof billingHistorySchema>;

export const paymentMethodSchema = z.looseObject({
  hasCard: nullableFlag(false),
  card: z
    .looseObject({
      brand: z.string().nullish(),
      last4: z.string().nullish(),
      expMonth: z.string().nullish(),
      expYear: z.string().nullish(),
      bank: z.string().nullish(),
    })
    .nullish()
    .transform(value => value ?? null),
  autoRenews: nullableFlag(false),
});
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const pricePreviewSchema = z.looseObject({
  subtotal: money,
  taxAmount: money,
  total: money,
  taxRule: z
    .looseObject({
      name: nullableText('VAT'),
      rate: nullableNumber(0),
      isEnabled: nullableFlag(false),
    })
    .nullish()
    .transform(value => value ?? null),
});
export type PricePreview = z.infer<typeof pricePreviewSchema>;

export const addonSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  description: nullableText(),
  price: money,
  currency: nullableText('NGN'),
  durationDays: nullableNumber(30),
  isOneTime: nullableFlag(false),
});
export type Addon = z.infer<typeof addonSchema>;

export const businessAddonSchema = z.looseObject({
  id: z.string(),
  addonId: z.string(),
  status: nullableText('active'),
  quantity: nullableNumber(1),
  totalPaid: money,
  purchasedAt: nullableTimestamp(),
  expiresAt: nullableTimestamp(),
  addon: addonSchema.nullish().transform(value => value ?? null),
});
export type BusinessAddon = z.infer<typeof businessAddonSchema>;

export const paymentVerificationSchema = z.looseObject({
  success: nullableFlag(false),
  status: nullableText('failed'),
});
export type PaymentVerification = z.infer<typeof paymentVerificationSchema>;

/** Plans a business can actually trial or buy (admin finished configuring them). */
export function purchasablePlans(plans: Plan[]): Plan[] {
  return plans.filter(
    plan => plan.isActive && (plan.isFree || Boolean(plan.permissionsConfiguredAt)),
  );
}

export function planPrice(plan: Plan, period: BillingPeriod): number {
  return period === 'yearly'
    ? plan.yearlyPrice
    : period === 'quarterly'
      ? plan.quarterlyPrice
      : plan.monthlyPrice;
}

export const subscriptionsApi = {
  plans(options: ApiRequestOptions = {}) {
    return requestValidated<Plan[]>(
      { method: 'GET', url: '/plans', params: { onlyActive: true }, ...options },
      z.array(planSchema),
    );
  },

  active(options: ApiRequestOptions = {}) {
    return requestValidated<ActiveSubscription>(
      { method: 'GET', url: '/subscriptions/active', ...options },
      activeSubscriptionSchema,
    );
  },

  startTrial(
    planId: string,
    billingPeriod: BillingPeriod = 'monthly',
    options: ApiRequestOptions = {},
  ) {
    return requestValidated<ActiveSubscription>(
      {
        method: 'POST',
        url: '/subscriptions/trial',
        data: { planId, billingPeriod },
        ...options,
      },
      activeSubscriptionSchema,
    );
  },

  pricePreview(
    params: { planId: string; billingPeriod: BillingPeriod; promoCode?: string },
    options: ApiRequestOptions = {},
  ) {
    return requestValidated<PricePreview>(
      { method: 'GET', url: '/subscriptions/price-preview', params, ...options },
      pricePreviewSchema,
    );
  },

  initializePayment(
    input: {
      planId: string;
      billingPeriod: BillingPeriod;
      promoCode?: string;
      addonIds?: string[];
      callbackUrl?: string;
    },
    options: ApiRequestOptions = {},
  ) {
    return requestValidated<Checkout>(
      {
        method: 'POST',
        url: '/subscriptions/initialize-payment',
        data: input,
        ...options,
      },
      checkoutSchema,
    );
  },

  /** Paystack's view of a payment: `success`, `abandoned`, `failed`, … */
  verifyPayment(reference: string, options: ApiRequestOptions = {}) {
    return requestValidated<PaymentVerification>(
      {
        method: 'GET',
        url: `/payments/verify/${encodeURIComponent(reference)}`,
        ...options,
      },
      paymentVerificationSchema,
    );
  },

  billingHistory(page = 1, options: ApiRequestOptions = {}) {
    return requestValidated<BillingHistory>(
      {
        method: 'GET',
        url: '/subscriptions/billing-history',
        params: { page },
        ...options,
      },
      billingHistorySchema,
    );
  },

  paymentMethod(options: ApiRequestOptions = {}) {
    return requestValidated<PaymentMethod>(
      { method: 'GET', url: '/subscriptions/payment-method', ...options },
      paymentMethodSchema,
    );
  },

  addons(options: ApiRequestOptions = {}) {
    return requestValidated<Addon[]>(
      { method: 'GET', url: '/addons', ...options },
      z.array(addonSchema),
    );
  },

  myAddons(options: ApiRequestOptions = {}) {
    return requestValidated<BusinessAddon[]>(
      { method: 'GET', url: '/addons/my', ...options },
      z.array(businessAddonSchema),
    );
  },

  cancel(options: ApiRequestOptions = {}) {
    return requestValidated<unknown>(
      { method: 'POST', url: '/subscriptions/cancel', ...options },
      z.unknown(),
    );
  },
};
