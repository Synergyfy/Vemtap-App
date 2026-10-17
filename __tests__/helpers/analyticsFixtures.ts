import {
  businessAnalyticsApi,
  type AnalyticsCustomers,
  type AnalyticsDeals,
  type AnalyticsLocations,
  type AnalyticsOverview,
  type AnalyticsPos,
} from '@api/businessAnalyticsApi';

/**
 * `/business-analytics/*` payloads shaped like the API's, for screen and
 * navigation tests. Two branches, a week of activity, one live deal.
 */

const range = {
  from: '2026-10-01T00:00:00.000Z',
  to: '2026-10-08T00:00:00.000Z',
  previousFrom: '2026-09-24T00:00:00.000Z',
  previousTo: '2026-10-01T00:00:00.000Z',
  days: 7,
  branchId: null,
};

const hours = (values: Record<number, number>) =>
  Array.from({ length: 24 }, (_, hour) => values[hour] ?? 0);

export const overviewFixture: AnalyticsOverview = {
  range,
  branchCount: 2,
  revenue: { current: 485000, previous: 400000 },
  orders: { current: 40, previous: 32 },
  averageOrderValue: { current: 12125, previous: 12500 },
  interactions: { current: 130, previous: 100 },
  activity: {
    dealViews: 9140,
    visits: 38,
    claims: 30,
    redemptions: 12,
    saves: 10,
    chats: 6,
    reviews: 6,
    newCustomers: 14,
    returningCustomers: 21,
  },
  redemptionRate: { current: 0.4, previous: 0.3 },
  customers: {
    active: 35,
    new: 14,
    returning: 21,
    repeatRate: 0.6,
    previousActive: 30,
    previousNew: 10,
  },
  channels: [
    { id: 'pos', revenue: 300000, orders: 25 },
    { id: 'orders', revenue: 185000, orders: 15 },
  ],
  sources: [
    { id: 'deals', count: 40 },
    { id: 'visits', count: 38 },
    { id: 'pos', count: 25 },
    { id: 'orders', count: 15 },
    { id: 'chats', count: 6 },
  ],
  series: Array.from({ length: 7 }, (_, index) => ({
    date: `2026-10-0${index + 1}`,
    revenue: [50000, 60000, 70000, 80000, 90000, 75000, 60000][index] ?? 0,
    orders: 5 + index,
    visits: 4 + index,
    customers: 3 + index,
    previousRevenue: 50000,
  })),
  hourly: hours({ 12: 10, 13: 8, 19: 12, 20: 10 }).map((orders, hour) => ({
    hour,
    orders,
    revenue: orders * 12000,
  })),
  weekdays: [0, 1, 2, 3, 4, 5, 6].map(dow => ({
    dow,
    revenue: dow === 6 ? 135000 : 50000,
    orders: dow === 6 ? 10 : 5,
  })),
  topDeal: {
    name: 'Prime Lunch Combo',
    branchName: 'Wuse Flagship',
    claims: 18,
    share: 0.6,
  },
  topItems: [
    { name: 'Woodfire Ribeye', quantity: 24, revenue: 168000, dealShare: 0.5 },
    { name: 'Lunch Combo', quantity: 30, revenue: 120000, dealShare: 0.8 },
  ],
  team: [
    {
      userId: 'u-ada',
      name: 'Ada Obi',
      role: 'Cashier',
      tickets: 18,
      sales: 210000,
      activeMinutes: 462,
      tillName: 'Till 01',
    },
  ],
};

export const customersFixture: AnalyticsCustomers = {
  range,
  total: { current: 120, previous: 100 },
  active: { current: 35, previous: 30 },
  new: { current: 14, previous: 10 },
  returning: 21,
  dormant: { current: 9, previous: 12 },
  repeatRate: { current: 0.55, previous: 0.5 },
  averageSpend: 13850,
  visitsPerActiveCustomer: 2.4,
  segments: {
    vip: { count: 8, share: 0.07, spend: 900000 },
    regular: { count: 40, share: 0.33, spend: 1200000 },
    new: { count: 14, share: 0.12, spend: 150000 },
    lapsed: { count: 18, share: 0.15, spend: 220000 },
  },
  growth: [
    { weekStart: '2026-09-28', new: 6, returning: 10 },
    { weekStart: '2026-10-05', new: 8, returning: 14 },
  ],
  acquisition: [
    { kind: 'claim', count: 8 },
    { kind: 'pos', count: 4 },
    { kind: 'visit', count: 2 },
  ],
  touchpoints: {
    visits: 38,
    claims: 30,
    saves: 10,
    chats: 6,
    reviews: 6,
    orders: 40,
    pointsIssued: 18450,
  },
  topCustomers: [
    {
      userId: 'c-michael',
      name: 'Michael James',
      avatarUrl: null,
      visits: 12,
      spend: 84500,
      lastVisitAt: '2026-10-07T12:00:00.000Z',
      pointsBalance: 3200,
      tier: 'Platinum',
    },
    {
      userId: 'c-sarah',
      name: 'Sarah Adams',
      avatarUrl: null,
      visits: 6,
      spend: 41000,
      lastVisitAt: '2026-10-06T12:00:00.000Z',
      pointsBalance: 1200,
      tier: 'Silver',
    },
  ],
  heatmap: [
    { dow: 6, hour: 19, count: 12 },
    { dow: 2, hour: 9, count: 2 },
    { dow: 5, hour: 13, count: 6 },
  ],
};

export const dealsFixture: AnalyticsDeals = {
  range,
  totals: {
    views: 6000,
    claims: { current: 60, previous: 40 },
    redeemed: 24,
    revenue: 230400,
    claimRate: 0.01,
    live: 2,
    ended: 1,
  },
  funnel: { views: 6000, saves: 120, claims: 60, redeemed: 24 },
  deals: [
    {
      id: 'g-lunch',
      name: 'Prime Lunch Combo',
      offerType: 'discount',
      pricingType: 'percentage_discount',
      discountValue: 20,
      price: 9600,
      endDate: '2026-11-01T00:00:00.000Z',
      live: true,
      branches: 2,
      views: 4120,
      likes: 620,
      saves: 90,
      claims: 50,
      previousClaims: 30,
      redeemed: 20,
      revenue: 192000,
      claimRate: 0.0121,
      averageBasket: 9600,
    },
    {
      id: 'g-cocktails',
      name: 'Late Night Cocktails',
      offerType: 'bogo',
      pricingType: 'fixed_price',
      discountValue: null,
      price: 7200,
      endDate: '2026-09-01T00:00:00.000Z',
      live: false,
      branches: 1,
      views: 1880,
      likes: 176,
      saves: 30,
      claims: 10,
      previousClaims: 10,
      redeemed: 4,
      revenue: 28800,
      claimRate: 0.0053,
      averageBasket: 7200,
    },
  ],
};

export const posFixture: AnalyticsPos = {
  range,
  sales: { current: 300000, previous: 250000 },
  tickets: { current: 25, previous: 20 },
  averageTicket: { current: 12000, previous: 12500 },
  itemsSold: 65,
  itemsPerTicket: 2.6,
  tips: 4000,
  discounts: 10000,
  refunds: { count: 1, amount: 8000, rate: 0.04 },
  drawer: { variance: -500, countedSessions: 3, sessions: 4 },
  hourly: hours({ 14: 84000, 20: 98000, 12: 40000 }).map((sales, hour) => ({
    hour,
    sales,
    tickets: sales ? Math.round(sales / 12000) : 0,
  })),
  tenders: [
    { method: 'cash', count: 12, amount: 150000, share: 0.5 },
    { method: 'card', count: 9, amount: 105000, share: 0.35 },
    { method: 'transfer', count: 4, amount: 45000, share: 0.15 },
  ],
  topItems: [
    { name: 'Woodfire Ribeye Steak', quantity: 18, revenue: 126000, tickets: 15 },
  ],
  cashiers: overviewFixture.team,
};

const branch = (
  branchId: string,
  name: string,
  revenue: number,
  previous: number,
  extra: Partial<AnalyticsLocations['branches'][number]> = {},
): AnalyticsLocations['branches'][number] => ({
  branchId,
  name,
  code: name.toLowerCase().replace(/\s+/g, '-'),
  address: 'Abuja',
  isMainBranch: false,
  isActive: true,
  revenue: { current: revenue, previous },
  orders: {
    current: Math.round(revenue / 12000),
    previous: Math.round(previous / 12000),
  },
  averageOrderValue: 12000,
  posTickets: 10,
  onlineOrders: 5,
  customers: 20,
  visits: 15,
  claims: 8,
  redemptions: 3,
  dealViews: 3000,
  rating: 4.6,
  reviews: 12,
  revenueShare: 0,
  percentOfBest: 0,
  ...extra,
});

export const locationsFixture: AnalyticsLocations = {
  range,
  totals: {
    branches: 2,
    revenue: { current: 485000, previous: 400000 },
    orders: 40,
    visits: 38,
    dealViews: 9140,
  },
  branches: [
    branch('b-wuse', 'Wuse Flagship', 360000, 300000, {
      isMainBranch: true,
      revenueShare: 0.742,
      percentOfBest: 100,
    }),
    branch('b-garki', 'Garki Express', 125000, 160000, {
      revenueShare: 0.258,
      percentOfBest: 35,
      rating: null,
    }),
  ],
  heatmap: customersFixture.heatmap,
};

/** Point every analytics request at the fixtures. */
export function mockAnalyticsApis() {
  jest.spyOn(businessAnalyticsApi, 'overview').mockResolvedValue(overviewFixture);
  jest.spyOn(businessAnalyticsApi, 'customers').mockResolvedValue(customersFixture);
  jest.spyOn(businessAnalyticsApi, 'deals').mockResolvedValue(dealsFixture);
  jest.spyOn(businessAnalyticsApi, 'pos').mockResolvedValue(posFixture);
  jest.spyOn(businessAnalyticsApi, 'locations').mockResolvedValue(locationsFixture);
}
