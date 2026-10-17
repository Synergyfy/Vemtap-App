import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableNumber, nullableText, nullableTimestamp } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';
import type { AnalyticsQuery } from '@api/businessAnalyticsApi';

/**
 * The business's own QR codes (`/business-qr/*`, Owner/Manager): the business
 * link, one per branch and one per tap device, each with its SVG artwork, plus
 * the scans those taps recorded in the period.
 */
const num = nullableNumber();
const comparison = z.object({ current: num, previous: num });
const art = z.object({ url: z.string(), svg: z.string() });
export type QrArt = z.infer<typeof art>;

export const businessQrSummarySchema = z.object({
  business: z.object({
    id: z.string(),
    name: nullableText(),
    logoUrl: z.string().nullable(),
    code: z.string(),
    qr: art,
  }),
  stats: z.object({ scans: comparison, newCustomers: comparison, claimRate: num }),
  branches: z.array(
    z.object({
      id: z.string(),
      name: nullableText(),
      address: z.string().nullable(),
      code: z.string(),
      username: z.string().nullable(),
      isMainBranch: z.boolean(),
      isActive: z.boolean(),
      scans: comparison,
      qr: art,
    }),
  ),
  points: z.array(
    z.object({
      id: z.string(),
      name: nullableText(),
      code: z.string(),
      type: nullableText('Card'),
      location: z.string().nullable(),
      branchId: z.string(),
      branchName: z.string().nullable(),
      active: z.boolean(),
      live: z.boolean(),
      lastActive: nullableTimestamp(),
      totalScans: num,
      scans: num,
      weekScans: num,
      qr: art,
    }),
  ),
  totals: z.object({
    branches: num,
    points: num,
    activePoints: num,
    livePoints: num,
    weekScans: num,
  }),
});
export type BusinessQrSummary = z.infer<typeof businessQrSummarySchema>;

export const businessQrKitSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  contentBase64: z.string(),
  sizeBytes: num,
  codes: num,
});
export type BusinessQrKit = z.infer<typeof businessQrKitSchema>;

export type BusinessQrQuery = Partial<AnalyticsQuery>;

export const businessQrApi = {
  summary(query: BusinessQrQuery = {}, options: ApiRequestOptions = {}) {
    return requestValidated<BusinessQrSummary>(
      { method: 'GET', url: '/business-qr/summary', params: query, ...options },
      businessQrSummarySchema,
    );
  },
  /** Printable PDF of every code, base64-encoded. */
  kit(query: BusinessQrQuery = {}, options: ApiRequestOptions = {}) {
    return requestValidated<BusinessQrKit>(
      { method: 'GET', url: '/business-qr/kit', params: query, ...options },
      businessQrKitSchema,
    );
  },
};
