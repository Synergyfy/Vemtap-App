import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableNumber, nullableText, nullableTimestamp } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Range-based business analytics (`/business-analytics/*`, Owner/Manager with
 * the `analytics` permission).
 *
 * Every endpoint takes the same `{ from, to, branchId }` query and answers
 * with raw numbers — naira amounts, counts and 0–1 ratios — plus
 * `{ current, previous }` pairs comparing the period with the one before it.
 * Formatting is the mappers' job.
 */
export interface AnalyticsQuery {
  /** ISO with offset; the start of the period. */
  from: string;
  /** ISO with offset; exclusive end of the period. */
  to: string;
  branchId?: string;
}

const num = nullableNumber();
const comparison = z.object({ current: num, previous: num });
export type AnalyticsComparison = z.infer<typeof comparison>;

const range = z.object({
  from: z.string(),
  to: z.string(),
  previousFrom: z.string(),
  previousTo: z.string(),
  days: num,
  branchId: z.string().nullable(),
});

const heatCell = z.object({ dow: num, hour: num, count: num });
export type AnalyticsHeatCell = z.infer<typeof heatCell>;

const cashier = z.object({
  userId: z.string(),
  name: nullableText(),
  role: z.string().nullable(),
  tickets: num,
  sales: num,
  activeMinutes: num,
  tillName: z.string().nullable(),
});
export type AnalyticsCashier = z.infer<typeof cashier>;

export const analyticsOverviewSchema = z.object({
  range,
  branchCount: num,
  revenue: comparison,
  orders: comparison,
  averageOrderValue: comparison,
  interactions: comparison,
  activity: z.object({
    dealViews: num,
    visits: num,
    claims: num,
    redemptions: num,
    saves: num,
    chats: num,
    reviews: num,
    newCustomers: num,
    returningCustomers: num,
  }),
  redemptionRate: comparison,
  customers: z.object({
    active: num,
    new: num,
    returning: num,
    repeatRate: num,
    previousActive: num,
    previousNew: num,
  }),
  channels: z.array(z.object({ id: z.string(), revenue: num, orders: num })),
  sources: z.array(z.object({ id: z.string(), count: num })),
  series: z.array(
    z.object({
      date: z.string(),
      revenue: num,
      orders: num,
      visits: num,
      customers: num,
      previousRevenue: num,
    }),
  ),
  hourly: z.array(z.object({ hour: num, orders: num, revenue: num })),
  weekdays: z.array(z.object({ dow: num, revenue: num, orders: num })),
  topDeal: z
    .object({
      name: nullableText(),
      branchName: z.string().nullable(),
      claims: num,
      share: num,
    })
    .nullable(),
  topItems: z.array(
    z.object({ name: nullableText(), quantity: num, revenue: num, dealShare: num }),
  ),
  team: z.array(cashier),
});
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;

const segment = z.object({ count: num, share: num, spend: num });

export const analyticsCustomersSchema = z.object({
  range,
  total: comparison,
  active: comparison,
  new: comparison,
  returning: num,
  dormant: comparison,
  repeatRate: comparison,
  averageSpend: num,
  visitsPerActiveCustomer: num,
  segments: z.object({ vip: segment, regular: segment, new: segment, lapsed: segment }),
  growth: z.array(z.object({ weekStart: z.string(), new: num, returning: num })),
  acquisition: z.array(z.object({ kind: z.string(), count: num })),
  touchpoints: z.object({
    visits: num,
    claims: num,
    saves: num,
    chats: num,
    reviews: num,
    orders: num,
    pointsIssued: num,
  }),
  topCustomers: z.array(
    z.object({
      userId: z.string(),
      name: nullableText(),
      avatarUrl: z.string().nullable(),
      visits: num,
      spend: num,
      lastVisitAt: nullableTimestamp(),
      pointsBalance: num,
      tier: nullableText('Bronze'),
    }),
  ),
  heatmap: z.array(heatCell),
});
export type AnalyticsCustomers = z.infer<typeof analyticsCustomersSchema>;

export const analyticsDealsSchema = z.object({
  range,
  totals: z.object({
    views: num,
    claims: comparison,
    redeemed: num,
    revenue: num,
    claimRate: num,
    live: num,
    ended: num,
  }),
  funnel: z.object({ views: num, saves: num, claims: num, redeemed: num }),
  deals: z.array(
    z.object({
      id: z.string(),
      name: nullableText(),
      offerType: z.string().nullable(),
      pricingType: z.string().nullable(),
      discountValue: z.number().nullable(),
      price: z.number().nullable(),
      endDate: nullableTimestamp(),
      live: z.boolean(),
      branches: num,
      views: num,
      likes: num,
      saves: num,
      claims: num,
      previousClaims: num,
      redeemed: num,
      revenue: num,
      claimRate: num,
      averageBasket: num,
    }),
  ),
});
export type AnalyticsDeals = z.infer<typeof analyticsDealsSchema>;
export type AnalyticsDeal = AnalyticsDeals['deals'][number];

export const analyticsPosSchema = z.object({
  range,
  sales: comparison,
  tickets: comparison,
  averageTicket: comparison,
  itemsSold: num,
  itemsPerTicket: num,
  tips: num,
  discounts: num,
  refunds: z.object({ count: num, amount: num, rate: num }),
  drawer: z.object({ variance: num, countedSessions: num, sessions: num }),
  hourly: z.array(z.object({ hour: num, sales: num, tickets: num })),
  tenders: z.array(z.object({ method: z.string(), count: num, amount: num, share: num })),
  topItems: z.array(
    z.object({ name: nullableText(), quantity: num, revenue: num, tickets: num }),
  ),
  cashiers: z.array(cashier),
});
export type AnalyticsPos = z.infer<typeof analyticsPosSchema>;

export const analyticsBranchSchema = z.object({
  branchId: z.string(),
  name: nullableText(),
  code: z.string().nullable(),
  address: z.string().nullable(),
  isMainBranch: z.boolean(),
  isActive: z.boolean(),
  revenue: comparison,
  orders: comparison,
  averageOrderValue: num,
  posTickets: num,
  onlineOrders: num,
  customers: num,
  visits: num,
  claims: num,
  redemptions: num,
  dealViews: num,
  rating: z.number().nullable(),
  reviews: num,
  revenueShare: num,
  percentOfBest: num,
});
export type AnalyticsBranch = z.infer<typeof analyticsBranchSchema>;

export const analyticsLocationsSchema = z.object({
  range,
  totals: z.object({
    branches: num,
    revenue: comparison,
    orders: num,
    visits: num,
    dealViews: num,
  }),
  branches: z.array(analyticsBranchSchema),
  heatmap: z.array(heatCell),
});
export type AnalyticsLocations = z.infer<typeof analyticsLocationsSchema>;

export const ANALYTICS_EXPORT_MODULES = [
  'overview',
  'customers',
  'deals',
  'locations',
  'pos',
  'audit',
] as const;
export type AnalyticsExportModule = (typeof ANALYTICS_EXPORT_MODULES)[number];
export type AnalyticsExportFormat = 'csv' | 'pdf';

export interface AnalyticsExportInput extends AnalyticsQuery {
  format: AnalyticsExportFormat;
  modules: AnalyticsExportModule[];
}

export const analyticsExportSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  contentBase64: z.string(),
  sizeBytes: num,
  records: num,
  modules: z.array(z.string()),
  range: z.object({ from: z.string(), to: z.string() }),
});
export type AnalyticsExportFile = z.infer<typeof analyticsExportSchema>;

const get =
  <T>(path: string, schema: z.ZodType<T>) =>
  (query: AnalyticsQuery, options: ApiRequestOptions = {}) =>
    requestValidated<T>(
      { method: 'GET', url: `/business-analytics/${path}`, params: query, ...options },
      schema,
    );

export const businessAnalyticsApi = {
  overview: get('overview', analyticsOverviewSchema),
  customers: get('customers', analyticsCustomersSchema),
  deals: get('deals', analyticsDealsSchema),
  pos: get('pos', analyticsPosSchema),
  locations: get('locations', analyticsLocationsSchema),
  /** `POST /business-analytics/export` — the file comes back base64-encoded. */
  export(input: AnalyticsExportInput, options: ApiRequestOptions = {}) {
    return requestValidated<AnalyticsExportFile>(
      { method: 'POST', url: '/business-analytics/export', data: input, ...options },
      analyticsExportSchema,
    );
  },
};
