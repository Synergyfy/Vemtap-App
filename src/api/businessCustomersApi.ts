import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableNumber, nullableText, nullableTimestamp } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * The business's customer directory and dossier (`/business-customers`):
 * everyone who bought, visited, booked, claimed a deal or chatted, plus the
 * private note the business keeps on each.
 */
export type CustomerSegmentFilter = 'all' | 'frequent' | 'returning' | 'new' | 'inactive';
export type CustomerSort = 'recent' | 'spend' | 'visits' | 'name';

export interface CustomerDirectoryQuery {
  search?: string;
  segment?: CustomerSegmentFilter;
  branchId?: string;
  sort?: CustomerSort;
  page?: number;
  limit?: number;
}

const num = nullableNumber();

export const customerCardSchema = z.object({
  userId: z.string(),
  name: nullableText(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  segment: z.string(),
  visits: num,
  orders: num,
  claims: num,
  bookings: num,
  spend: num,
  pointsBalance: num,
  tier: nullableText('Bronze'),
  firstSeenAt: z.string(),
  lastSeenAt: z.string(),
  lastInteraction: z.object({ kind: z.string(), reference: z.string().nullable() }),
});
export type CustomerCard = z.infer<typeof customerCardSchema>;

export const customerDirectorySchema = z.object({
  data: z.array(customerCardSchema),
  total: num,
  page: num,
  limit: num,
  hasNextPage: z.boolean(),
  meta: z.object({
    segmentCounts: z.object({
      all: num,
      frequent: num,
      returning: num,
      new: num,
      inactive: num,
    }),
    insight: z.object({
      customers: num,
      frequentCustomers: num,
      frequentSpendShare: num,
      dormant: num,
    }),
  }),
});
export type CustomerDirectory = z.infer<typeof customerDirectorySchema>;

const noteSchema = z.object({
  note: z.string(),
  tags: z.array(z.string()),
  updatedAt: z.string(),
});

export const customerDossierSchema = customerCardSchema.extend({
  memberSince: nullableTimestamp(),
  preferredBranch: z.object({ id: z.string(), name: z.string() }).nullable(),
  firstInteraction: z.object({ kind: z.string(), at: z.string() }),
  metrics: z.object({
    visitsPerMonth: num,
    averageOrder: num,
    redeemed: num,
    redemptionRate: num,
  }),
  recentPurchases: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      reference: z.string(),
      total: num,
      paymentMethod: z.string().nullable(),
      items: z.string(),
      at: z.string(),
      branchName: z.string().nullable(),
    }),
  ),
  recentClaims: z.array(
    z.object({
      id: z.string(),
      offerName: nullableText(),
      status: z.string(),
      claimCode: nullableText(),
      saved: num,
      claimedAt: z.string(),
      redeemedAt: nullableTimestamp(),
      branchName: z.string().nullable(),
    }),
  ),
  loyaltyLedger: z.array(
    z.object({
      id: z.string(),
      points: num,
      reason: z.string().nullable(),
      at: z.string(),
    }),
  ),
  note: noteSchema.extend({ updatedBy: z.string().nullable() }).nullable(),
});
export type CustomerDossier = z.infer<typeof customerDossierSchema>;

export const customersExportSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  contentBase64: z.string(),
  sizeBytes: num,
  records: num,
});

export interface SaveCustomerNoteInput {
  note?: string;
  tags?: string[];
}

export const businessCustomersApi = {
  directory(query: CustomerDirectoryQuery = {}, options: ApiRequestOptions = {}) {
    return requestValidated<CustomerDirectory>(
      { method: 'GET', url: '/business-customers', params: query, ...options },
      customerDirectorySchema,
    );
  },
  dossier(userId: string, options: ApiRequestOptions = {}) {
    return requestValidated<CustomerDossier>(
      { method: 'GET', url: `/business-customers/${userId}`, ...options },
      customerDossierSchema,
    );
  },
  saveNote(
    userId: string,
    input: SaveCustomerNoteInput,
    options: ApiRequestOptions = {},
  ) {
    return requestValidated(
      {
        method: 'PUT',
        url: `/business-customers/${userId}/note`,
        data: input,
        ...options,
      },
      noteSchema,
    );
  },
  export(
    query: Omit<CustomerDirectoryQuery, 'page' | 'limit'>,
    options: ApiRequestOptions = {},
  ) {
    return requestValidated(
      { method: 'POST', url: '/business-customers/export', data: query, ...options },
      customersExportSchema,
    );
  },
};
