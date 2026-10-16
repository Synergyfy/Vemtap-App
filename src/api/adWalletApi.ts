import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';
import { decimal } from '@api/schemaHelpers';

/**
 * The prepaid naira ad wallet that funds boosts and promotion campaigns
 * (`/ad-wallet`). Shapes follow `apps/backend/src/modules/ad-wallet`. Launching
 * a campaign reserves its budget; spend is settled daily and unspent money is
 * released when it ends. Not `/credits` (messaging credits).
 */

/** The saved card, display fields only (the API never returns the authorization). */
export const adWalletCardSchema = z.object({
  brand: z.string().nullish(),
  last4: z.string().nullish(),
  expMonth: z.string().nullish(),
  expYear: z.string().nullish(),
  bank: z.string().nullish(),
});
export type AdWalletCard = z.infer<typeof adWalletCardSchema>;

/** Top up from the saved card when spendable money drops below `threshold`. */
export const adWalletAutoReloadSchema = z.object({
  enabled: z.boolean(),
  threshold: decimal(),
  amount: decimal(),
  /** Why auto-reload switched itself off (a declined card). */
  lastError: z.string().nullish(),
});
export type AdWalletAutoReload = z.infer<typeof adWalletAutoReloadSchema>;

export const adWalletBalanceSchema = z.object({
  walletRef: z.string(),
  balance: decimal(),
  reserved: decimal(),
  spendable: decimal(),
  currency: z.string().optional(),
  // Optional: servers before saved cards do not send these.
  card: adWalletCardSchema.nullish(),
  autoReload: adWalletAutoReloadSchema.nullish(),
});
export type AdWalletBalance = z.infer<typeof adWalletBalanceSchema>;

export const AD_WALLET_TRANSACTION_TYPES = [
  'topup',
  'bonus',
  'reserve',
  'spend',
  'release',
  'adjustment',
] as const;
export type AdWalletTransactionType = (typeof AD_WALLET_TRANSACTION_TYPES)[number];

export const adWalletTransactionSchema = z.object({
  id: z.string(),
  type: z.string(),
  amount: decimal(),
  direction: z.enum(['credit', 'debit', 'adjustment']),
  description: z.string().nullish(),
  reference: z.string().nullish(),
  campaignId: z.string().nullish(),
  balanceAfter: decimal(),
  reservedAfter: decimal(),
  createdAt: z.string(),
});
export type AdWalletTransaction = z.infer<typeof adWalletTransactionSchema>;

export const adWalletTransactionsPageSchema = z.object({
  data: z.array(adWalletTransactionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
});
export type AdWalletTransactionsPage = z.infer<typeof adWalletTransactionsPageSchema>;

/** A top-up bundle: pay `amount`, receive `amount + bonus` ad credit. */
export const adWalletPrepackSchema = z.object({
  id: z.string(),
  amount: decimal(),
  bonus: decimal(),
  label: z.string(),
  tier: z.string().nullish(),
});
export type AdWalletPrepack = z.infer<typeof adWalletPrepackSchema>;

/** A started card top-up: open `authorizationUrl`, then confirm `reference`. */
export const adWalletTopUpSchema = z.object({
  reference: z.string(),
  amount: decimal(),
  bonus: decimal(),
  accessCode: z.string().nullish(),
  authorizationUrl: z.string().nullish(),
});
export type AdWalletTopUp = z.infer<typeof adWalletTopUpSchema>;

export const adWalletTopUpConfirmationSchema = z.object({
  reference: z.string(),
  status: z.enum(['completed', 'pending']),
  wallet: adWalletBalanceSchema,
});
export type AdWalletTopUpConfirmation = z.infer<typeof adWalletTopUpConfirmationSchema>;

export const adWalletSavedCardTopUpSchema = z.object({
  reference: z.string(),
  status: z.enum(['completed', 'failed']),
  reason: z.string().nullish(),
  wallet: adWalletBalanceSchema,
});
export type AdWalletSavedCardTopUp = z.infer<typeof adWalletSavedCardTopUpSchema>;

/** One invoice per launched boost or campaign (no VAT is charged). */
export const adWalletInvoiceSchema = z.object({
  id: z.string(),
  invoiceNo: z.string().nullish(),
  /** `Ad wallet`, `Card top-up` or `Saved card`. */
  paymentMethod: z.string().nullish(),
  amount: decimal(),
  currency: z.string().optional(),
  status: z.string(),
  date: z.string(),
  campaign: z
    .object({ id: z.string(), name: z.string().nullish(), kind: z.string() })
    .nullish(),
});
export type AdWalletInvoice = z.infer<typeof adWalletInvoiceSchema>;

export const adWalletInvoicesPageSchema = z.object({
  data: z.array(adWalletInvoiceSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
});
export type AdWalletInvoicesPage = z.infer<typeof adWalletInvoicesPageSchema>;

export const adWalletApi = {
  async getWallet(options: ApiRequestOptions = {}): Promise<AdWalletBalance> {
    return requestValidated<AdWalletBalance>(
      { method: 'GET', url: '/ad-wallet', ...options },
      adWalletBalanceSchema,
    );
  },

  async listTransactions(
    params: { type?: AdWalletTransactionType; page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<AdWalletTransactionsPage> {
    return requestValidated<AdWalletTransactionsPage>(
      { method: 'GET', url: '/ad-wallet/transactions', params, ...options },
      adWalletTransactionsPageSchema,
    );
  },

  async listPrepacks(options: ApiRequestOptions = {}): Promise<AdWalletPrepack[]> {
    return requestValidated<AdWalletPrepack[]>(
      { method: 'GET', url: '/ad-wallet/prepacks', ...options },
      z.array(adWalletPrepackSchema),
    );
  },

  /** Start a card top-up for a bundle or a custom amount (₦2,000+, no bonus). */
  async topUpWallet(
    input: {
      prepackId?: string;
      amount?: number;
      callbackUrl?: string;
      /** Keep the card for later top-ups (owner consent). */
      saveCard?: boolean;
    },
    options: ApiRequestOptions = {},
  ): Promise<AdWalletTopUp> {
    return requestValidated<AdWalletTopUp>(
      { method: 'POST', url: '/ad-wallet/top-up', data: input, ...options },
      adWalletTopUpSchema,
    );
  },

  /** Ask Paystack (through the API) whether a top-up paid; safe to repeat. */
  async confirmTopUp(
    reference: string,
    options: ApiRequestOptions = {},
  ): Promise<AdWalletTopUpConfirmation> {
    return requestValidated<AdWalletTopUpConfirmation>(
      { method: 'POST', url: `/ad-wallet/top-up/${reference}/confirm`, ...options },
      adWalletTopUpConfirmationSchema,
    );
  },

  /** Charge the saved card directly; no checkout. */
  async topUpWithSavedCard(
    input: { prepackId?: string; amount?: number },
    options: ApiRequestOptions = {},
  ): Promise<AdWalletSavedCardTopUp> {
    return requestValidated<AdWalletSavedCardTopUp>(
      { method: 'POST', url: '/ad-wallet/top-up/saved-card', data: input, ...options },
      adWalletSavedCardTopUpSchema,
    );
  },

  /** Forget the saved card (auto-reload switches off with it). */
  async removeCard(options: ApiRequestOptions = {}): Promise<AdWalletBalance> {
    return requestValidated<AdWalletBalance>(
      { method: 'DELETE', url: '/ad-wallet/card', ...options },
      adWalletBalanceSchema,
    );
  },

  async setAutoReload(
    input: { enabled: boolean; threshold: number; amount: number },
    options: ApiRequestOptions = {},
  ): Promise<AdWalletBalance> {
    return requestValidated<AdWalletBalance>(
      { method: 'PUT', url: '/ad-wallet/auto-reload', data: input, ...options },
      adWalletBalanceSchema,
    );
  },

  async listInvoices(
    params: { page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<AdWalletInvoicesPage> {
    return requestValidated<AdWalletInvoicesPage>(
      { method: 'GET', url: '/ad-wallet/invoices', params, ...options },
      adWalletInvoicesPageSchema,
    );
  },

  async getInvoice(
    id: string,
    options: ApiRequestOptions = {},
  ): Promise<AdWalletInvoice> {
    return requestValidated<AdWalletInvoice>(
      { method: 'GET', url: `/ad-wallet/invoices/${id}`, ...options },
      adWalletInvoiceSchema,
    );
  },
};
