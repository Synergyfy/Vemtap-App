import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

export const adWalletBalanceSchema = z.object({
  balance: z.number(),
  reserved: z.number().optional(),
  spendable: z.number().optional(),
  walletRef: z.string().optional(),
  virtualAccount: z
    .object({
      bank: z.string().optional(),
      number: z.string().optional(),
    })
    .optional(),
});
export type AdWalletBalance = z.infer<typeof adWalletBalanceSchema>;

export const adWalletTransactionSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  amount: z.number().optional(),
  createdAt: z.string().nullish(),
  description: z.string().optional(),
});
export type AdWalletTransaction = z.infer<typeof adWalletTransactionSchema>;

export const adWalletPrepackSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
});
export type AdWalletPrepack = z.infer<typeof adWalletPrepackSchema>;

export const adWalletInvoiceSchema = z.object({
  id: z.string(),
  reference: z.string().optional(),
  amount: z.number().optional(),
  status: z.string().optional(),
  issuedAt: z.string().nullish(),
});
export type AdWalletInvoice = z.infer<typeof adWalletInvoiceSchema>;

export const adWalletApi = {
  async getWallet(options: ApiRequestOptions = {}): Promise<AdWalletBalance> {
    return requestValidated<AdWalletBalance>(
      { method: 'GET', url: '/ad-wallet', ...options },
      adWalletBalanceSchema,
    );
  },

  async listTransactions(
    params: { type?: string; page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<AdWalletTransaction[]> {
    return requestValidated<AdWalletTransaction[]>(
      {
        method: 'GET',
        url: '/ad-wallet/transactions',
        params,
        ...options,
      },
      z.array(adWalletTransactionSchema),
    );
  },

  async listPrepacks(options: ApiRequestOptions = {}): Promise<AdWalletPrepack[]> {
    return requestValidated<AdWalletPrepack[]>(
      { method: 'GET', url: '/ad-wallet/prepacks', ...options },
      z.array(adWalletPrepackSchema),
    );
  },

  async topUpWallet(
    input: { amount?: number; prepackId?: string },
    options: ApiRequestOptions = {},
  ): Promise<{ paymentUrl?: string; status?: string; invoiceId?: string }> {
    return requestValidated<{ paymentUrl?: string; status?: string; invoiceId?: string }>(
      {
        method: 'POST',
        url: '/ad-wallet/top-up',
        data: input,
        ...options,
      },
      z.object({
        paymentUrl: z.string().optional(),
        status: z.string().optional(),
        invoiceId: z.string().optional(),
      }),
    );
  },

  async getInvoice(
    invoiceId: string,
    options: ApiRequestOptions = {},
  ): Promise<AdWalletInvoice> {
    return requestValidated<AdWalletInvoice>(
      { method: 'GET', url: `/ad-wallet/invoices/${invoiceId}`, ...options },
      adWalletInvoiceSchema,
    );
  },
};
