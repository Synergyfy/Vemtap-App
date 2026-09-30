/**
 * Fixture data for the second-batch analytics surfaces (customer intelligence,
 * business performance, branch comparison) and the customer display / POS
 * payment, split-the-bill and receipt flows. Screens read from here so the
 * numbers, names and order lines are never inlined twice.
 */
import { type IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import type { BusinessAnalyticsTab } from '@features/business/components/BusinessAnalyticsPrimitives';

/* -------------------------------------------------------------------------- */
/* Shared analytics copy from strings                                         */
/* -------------------------------------------------------------------------- */

export const customerAnalyticsNavTabs = [
  {
    key: 'customers',
    label: strings.customerIntelligenceAnalytics.navTabs.customers,
    icon: 'group',
  },
  {
    key: 'loyalty',
    label: strings.customerIntelligenceAnalytics.navTabs.loyalty,
    icon: 'crown',
  },
  {
    key: 'deals',
    label: strings.customerIntelligenceAnalytics.navTabs.deals,
    icon: 'localOffer',
  },
  {
    key: 'feedback',
    label: strings.customerIntelligenceAnalytics.navTabs.feedback,
    icon: 'rateReview',
  },
] as const satisfies readonly BusinessAnalyticsTab[];

export const businessPerformanceNavTabs = [
  {
    key: 'deals',
    label: strings.businessAnalyticsPerformance.navTabs.deals,
    icon: 'localOffer',
  },
  {
    key: 'business',
    label: strings.businessAnalyticsPerformance.navTabs.business,
    icon: 'store',
  },
  {
    key: 'customers',
    label: strings.businessAnalyticsPerformance.navTabs.customers,
    icon: 'group',
  },
  {
    key: 'locations',
    label: strings.businessAnalyticsPerformance.navTabs.locations,
    icon: 'storefront',
  },
  {
    key: 'pos',
    label: strings.businessAnalyticsPerformance.navTabs.pos,
    icon: 'pointOfSale',
  },
] as const satisfies readonly BusinessAnalyticsTab[];

export const analyticsDateRanges = strings.businessAnalyticsPerformance.dateRanges;

/* -------------------------------------------------------------------------- */
/* Customer intelligence                                                      */
/* -------------------------------------------------------------------------- */

export interface CustomerMetricCell {
  label: string;
  value: string;
  delta: string;
  icon: IconName;
  tone: 'brand' | 'success' | 'tertiary' | 'neutral';
}

export const customerMetrics: readonly CustomerMetricCell[] = [
  {
    label: strings.customerIntelligenceAnalytics.totalCustomersLabel,
    value: strings.customerIntelligenceAnalytics.totalCustomersValue,
    delta: strings.customerIntelligenceAnalytics.totalCustomersDelta,
    icon: 'group',
    tone: 'brand',
  },
  {
    label: strings.customerIntelligenceAnalytics.repeatRateLabel,
    value: strings.customerIntelligenceAnalytics.repeatRateValue,
    delta: strings.customerIntelligenceAnalytics.repeatRateDelta,
    icon: 'repeatCustomers',
    tone: 'success',
  },
  {
    label: strings.customerIntelligenceAnalytics.avgSpendLabel,
    value: strings.customerIntelligenceAnalytics.avgSpendValue,
    delta: strings.customerIntelligenceAnalytics.avgSpendDelta,
    icon: 'payments',
    tone: 'tertiary',
  },
  {
    label: strings.customerIntelligenceAnalytics.churnRiskLabel,
    value: strings.customerIntelligenceAnalytics.churnRiskValue,
    delta: strings.customerIntelligenceAnalytics.churnRiskDelta,
    icon: 'personPin',
    tone: 'neutral',
  },
] as const;

export interface CustomerSegmentRow {
  id: string;
  name: string;
  count: string;
  share: string;
  tone: 'brand' | 'success' | 'tertiary' | 'secondary' | 'neutral';
  icon: IconName;
}

export const customerValueSegments: readonly CustomerSegmentRow[] = [
  {
    id: 'vip',
    name: 'VIP Regulars',
    count: '1,240',
    share: '42%',
    tone: 'brand',
    icon: 'starFilled',
  },
  {
    id: 'loyal',
    name: 'Loyal Members',
    count: '3,860',
    share: '28%',
    tone: 'success',
    icon: 'crown',
  },
  {
    id: 'rising',
    name: 'Rising Stars',
    count: '2,410',
    share: '17%',
    tone: 'tertiary',
    icon: 'trendingUp',
  },
  {
    id: 'at-risk',
    name: 'At Risk',
    count: '214',
    share: '9%',
    tone: 'secondary',
    icon: 'alert',
  },
  {
    id: 'new',
    name: 'First Visit',
    count: '640',
    share: '4%',
    tone: 'neutral',
    icon: 'personAdd',
  },
] as const;

export interface TopCustomerRow {
  id: string;
  name: string;
  initials: string;
  visits: string;
  spend: string;
  tier: 'platinum' | 'gold' | 'silver';
}

export const topCustomers: readonly TopCustomerRow[] = [
  {
    id: 'michael',
    name: 'Michael James',
    initials: 'MJ',
    visits: '48 visits',
    spend: '#284,500',
    tier: 'platinum',
  },
  {
    id: 'sarah',
    name: 'Sarah Adams',
    initials: 'SA',
    visits: '36 visits',
    spend: '#198,200',
    tier: 'gold',
  },
  {
    id: 'chidi',
    name: 'Dr. Chidi Okafor',
    initials: 'CO',
    visits: '31 visits',
    spend: '#164,900',
    tier: 'gold',
  },
  {
    id: 'amaka',
    name: 'Amaka Kalu',
    initials: 'AK',
    visits: '22 visits',
    spend: '#118,400',
    tier: 'silver',
  },
] as const;

export const customerTierLabel: Record<TopCustomerRow['tier'], string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
};

export const customerTierTone: Record<
  TopCustomerRow['tier'],
  'brand' | 'tertiary' | 'neutral'
> = {
  platinum: 'brand',
  gold: 'tertiary',
  silver: 'neutral',
};

/** Rows are daypart-ordered; cells are `heatmapLevels` tokens, peaks are labels. */
export const customerHeatmap = {
  columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const,
  rows: [
    { label: 'Morning', cells: ['mid', 'high', 'mid', 'low', 'mid', 'low', 'lowest'] },
    { label: 'Midday', cells: ['peak', 'peak', 'high', 'peak', 'high', 'high', 'mid'] },
    { label: 'Evening', cells: ['peak', 'high', 'peak', 'high', 'high', 'peak', 'mid'] },
  ] as const,
} as const;

export const customerGrowthSeries = [
  { label: 'W1', newValue: 240, returningValue: 420 },
  { label: 'W2', newValue: 310, returningValue: 480 },
  { label: 'W3', newValue: 285, returningValue: 520 },
  { label: 'W4', newValue: 390, returningValue: 610 },
] as const;

export const customerInsights = [
  {
    id: 'loyalty',
    icon: 'crown' as IconName,
    title: 'Loyalty members spend 2.4× more',
    body: 'Redeemed on 68% of their visits this period. Nudge first-visit guests into the programme to lift repeat rate.',
    cta: 'Open Loyalty',
  },
  {
    id: 'churn',
    icon: 'alert' as IconName,
    title: '214 customers trending toward churn',
    body: 'No visit in the last 45 days. A single targeted deal recovered 18% of them in the previous cycle.',
    cta: 'Create Deal',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Business performance                                                      */
/* -------------------------------------------------------------------------- */

export const performanceMetrics: readonly CustomerMetricCell[] = [
  {
    label: strings.businessAnalyticsPerformance.revenueLabel,
    value: strings.businessAnalyticsPerformance.revenueValue,
    delta: strings.businessAnalyticsPerformance.revenueDelta,
    icon: 'payments',
    tone: 'brand',
  },
  {
    label: strings.businessAnalyticsPerformance.ordersLabel,
    value: strings.businessAnalyticsPerformance.ordersValue,
    delta: strings.businessAnalyticsPerformance.ordersDelta,
    icon: 'receipt',
    tone: 'success',
  },
  {
    label: strings.businessAnalyticsPerformance.aovLabel,
    value: strings.businessAnalyticsPerformance.aovValue,
    delta: strings.businessAnalyticsPerformance.aovDelta,
    icon: 'shoppingBag',
    tone: 'tertiary',
  },
  {
    label: strings.businessAnalyticsPerformance.redemptionLabel,
    value: strings.businessAnalyticsPerformance.redemptionValue,
    delta: strings.businessAnalyticsPerformance.redemptionDelta,
    icon: 'redeem',
    tone: 'neutral',
  },
] as const;

export const revenueSeries = [
  { label: 'D1', value: 420, previous: 360 },
  { label: 'D2', value: 510, previous: 400 },
  { label: 'D3', value: 470, previous: 430 },
  { label: 'D4', value: 620, previous: 480 },
  { label: 'D5', value: 580, previous: 500 },
  { label: 'D6', value: 700, previous: 540 },
  { label: 'D7', value: 680, previous: 600 },
] as const;

export const revenueChannels = [
  {
    id: 'deals',
    label: strings.businessAnalyticsPerformance.channelDeals,
    value: '#2,180,000',
    percent: 51,
  },
  {
    id: 'pos',
    label: strings.businessAnalyticsPerformance.channelPos,
    value: '#1,540,000',
    percent: 36,
  },
  {
    id: 'direct',
    label: strings.businessAnalyticsPerformance.channelDirect,
    value: '#560,000',
    percent: 13,
  },
] as const;

export const topPerformingItems = [
  {
    id: 'ribeye',
    name: 'Woodfire Ribeye',
    meta: '1,204 sold · 68% from deals',
    value: '#1,640,000',
  },
  {
    id: 'lunch',
    name: 'Lunch Combo Deal',
    meta: '980 sold · 82% from deals',
    value: '#1,120,000',
  },
  {
    id: 'spa',
    name: 'Deep Tissue Massage',
    meta: '412 sold · 31% from deals',
    value: '#860,000',
  },
] as const;

export const hourlyVolume = [
  { label: '10a', value: 18 },
  { label: '12p', value: 42 },
  { label: '2p', value: 56 },
  { label: '4p', value: 38 },
  { label: '6p', value: 64 },
  { label: '8p', value: 48 },
] as const;

export const teamPerformance = [
  {
    id: 'john',
    name: 'John Peter',
    role: 'Branch Manager',
    orders: '860',
    sales: '#1,180,000',
  },
  {
    id: 'amara',
    name: 'Amara Kalu',
    role: 'Service Manager',
    orders: '742',
    sales: '#980,000',
  },
  {
    id: 'tunde',
    name: 'Tunde Bakare',
    role: 'Cashier',
    orders: '618',
    sales: '#810,000',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Branch comparison                                                          */
/* -------------------------------------------------------------------------- */

export interface BranchComparisonRow {
  id: string;
  name: string;
  code: string;
  revenue: string;
  orders: string;
  aov: string;
  rating: number;
  percentOfBest: number;
  status: 'best' | 'watch' | 'steady';
  note: string;
}

export const branchComparison: readonly BranchComparisonRow[] = [
  {
    id: 'lekki',
    name: 'Lekki Phase 1',
    code: 'LKG-01',
    revenue: '#1,540,000',
    orders: '1,120',
    aov: '#13,750',
    rating: 4.8,
    percentOfBest: 100,
    status: 'best',
    note: 'Top performing branch this period',
  },
  {
    id: 'ikoyi',
    name: 'Ikoyi Hub',
    code: 'IKY-02',
    revenue: '#1,180,000',
    orders: '890',
    aov: '#13,260',
    rating: 4.6,
    percentOfBest: 77,
    status: 'steady',
    note: 'Steady growth, up 9% on last period',
  },
  {
    id: 'victoria',
    name: 'Victoria Island',
    code: 'VIC-03',
    revenue: '#980,000',
    orders: '742',
    aov: '#13,208',
    rating: 4.4,
    percentOfBest: 64,
    status: 'steady',
    note: 'Lunch mix shifted toward set menus',
  },
  {
    id: 'yaba',
    name: 'Yaba Outlet',
    code: 'YAB-04',
    revenue: '#580,000',
    orders: '368',
    aov: '#15,760',
    rating: 3.9,
    percentOfBest: 38,
    status: 'watch',
    note: 'Needs attention: low weekday footfall',
  },
] as const;

export const branchStatusLabel: Record<BranchComparisonRow['status'], string> = {
  best: 'Top performing',
  steady: 'Steady',
  watch: 'Needs attention',
};

export const branchStatusTone: Record<
  BranchComparisonRow['status'],
  'success' | 'brand' | 'warning'
> = {
  best: 'success',
  steady: 'brand',
  watch: 'warning',
};

/* -------------------------------------------------------------------------- */
/* Customer display — order total, payment, rating                            */
/* -------------------------------------------------------------------------- */

export const displayOrder = {
  table: 'T-14',
  store: 'Urban Grill & Bistro',
  items: [
    {
      id: 'ribeye',
      name: 'Woodfire Ribeye',
      modifier: 'Medium rare · 250g',
      qty: '2×',
      price: '#34,000',
    },
    {
      id: 'fries',
      name: 'Truffle Parmesan Fries',
      modifier: 'Large',
      qty: '1×',
      price: '#6,500',
    },
    {
      id: 'mojito',
      name: 'Passionfruit House Mojito',
      modifier: 'Zero proof',
      qty: '2×',
      price: '#9,000',
    },
  ] as const,
  totals: [
    { id: 'subtotal', label: 'Subtotal', value: '#59,500', tone: 'default' as const },
    { id: 'vat', label: 'VAT (7.5%)', value: '#4,463', tone: 'default' as const },
    { id: 'service', label: 'Service charge', value: '#2,975', tone: 'default' as const },
  ] as const,
  grandTotal: '#66,938',
  itemImageIds: ['ribeye', 'fries', 'mojito'] as const,
};

export const displayPaymentMethods = strings.customerDisplayTapQrPay.methods;

export const tipPresets = [
  { id: 'none', title: 'No tip', value: '#0' },
  { id: 'five', title: '5%', value: '#3,347' },
  { id: 'ten', title: '10%', value: '#6,694', badge: 'Popular' },
  { id: 'fifteen', title: '15%', value: '#10,041' },
  { id: 'twenty', title: '20%', value: '#13,388' },
  { id: 'custom', title: 'Custom', value: 'Enter', icon: 'edit' as IconName },
] as const;

export const tipTotal: Record<string, string> = {
  none: '#66,938',
  five: '#70,285',
  ten: '#73,632',
  fifteen: '#76,979',
  twenty: '#80,326',
  custom: '#66,938',
};

export const ratingScale = [
  { value: 1, title: 'Poor', icon: 'sentimentVeryDissatisfied' as IconName },
  { value: 2, title: 'Fair', icon: 'sentimentDissatisfied' as IconName },
  { value: 3, title: 'Good', icon: 'sentimentNeutral' as IconName },
  { value: 4, title: 'Great', icon: 'sentimentSatisfied' as IconName },
  { value: 5, title: 'Loved it', icon: 'sentimentVerySatisfied' as IconName },
] as const;

/* -------------------------------------------------------------------------- */
/* Split the bill                                                             */
/* -------------------------------------------------------------------------- */

export interface SplitLineItem {
  id: string;
  name: string;
  price: string;
  /** How many equal shares this line is divided into. */
  shares: string;
  imageId: string;
}

export const splitLines: readonly SplitLineItem[] = [
  {
    id: 'ribeye',
    name: 'Woodfire Ribeye',
    price: '#34,000',
    shares: '2 shares',
    imageId: 'ribeye',
  },
  {
    id: 'mojito',
    name: 'Passionfruit House Mojito',
    price: '#9,000',
    shares: '2 shares',
    imageId: 'mojito',
  },
  {
    id: 'fries',
    name: 'Truffle Parmesan Fries',
    price: '#6,500',
    shares: '1 share',
    imageId: 'fries',
  },
] as const;

export const splitModes = [
  { id: 'even', title: 'Split evenly', value: '3 ways', icon: 'group' as IconName },
  { id: 'items', title: 'By item', value: 'Assign each', icon: 'list' as IconName },
  {
    id: 'custom',
    title: 'Custom amounts',
    value: 'Enter each',
    icon: 'edit' as IconName,
  },
] as const;

export const splitTotals = [
  { id: 'subtotal', label: 'Subtotal', value: '#49,500', tone: 'default' as const },
  { id: 'vat', label: 'VAT (7.5%)', value: '#3,713', tone: 'default' as const },
  {
    id: 'service',
    label: 'Service charge (10%)',
    value: '#4,950',
    tone: 'default' as const,
  },
] as const;

export const splitGrandTotal = '#58,163';

export const splitPeople = [
  { id: 'p1', name: 'You', initials: 'YU', amount: '#19,388' },
  { id: 'p2', name: 'Guest 2', initials: 'G2', amount: '#19,388' },
  { id: 'p3', name: 'Guest 3', initials: 'G3', amount: '#19,387' },
] as const;

/* -------------------------------------------------------------------------- */
/* Digital e-receipt                                                           */
/* -------------------------------------------------------------------------- */

export const receiptOrder = {
  id: 'VTP-2026-018422',
  store: 'Urban Grill & Bistro',
  table: 'T-14',
  date: '12 March 2026, 7:42 PM',
  sentTo: 'michael.james@email.com',
  paidVia: 'VEMTAP Wallet',
  method: 'Bank Transfer',
  items: [
    {
      id: 'ribeye',
      name: 'Woodfire Ribeye',
      modifier: 'Medium rare · 250g',
      qty: '2×',
      price: '#34,000',
    },
    {
      id: 'fries',
      name: 'Truffle Parmesan Fries',
      modifier: 'Large',
      qty: '1×',
      price: '#6,500',
    },
    {
      id: 'mojito',
      name: 'Passionfruit House Mojito',
      modifier: 'Zero proof',
      qty: '2×',
      price: '#9,000',
    },
    {
      id: 'sourdough',
      name: 'Garlic Butter Sourdough',
      modifier: 'To share',
      qty: '1×',
      price: '#3,500',
    },
    {
      id: 'cabernet',
      name: 'Reserve Cabernet',
      modifier: 'Glass',
      qty: '2×',
      price: '#14,000',
    },
  ] as const,
  totals: [
    {
      id: 'subtotal',
      label: 'Subtotal',
      value: '#67,000',
      tone: 'default' as const,
      badge: undefined,
    },
    {
      id: 'discount',
      label: 'VEMTAP deal (-20%)',
      value: '-#13,400',
      tone: 'discount' as const,
      badge: 'Applied',
    },
    {
      id: 'vat',
      label: 'VAT (7.5%)',
      value: '#4,020',
      tone: 'default' as const,
      badge: undefined,
    },
    {
      id: 'service',
      label: 'Service charge (10%)',
      value: '#5,360',
      tone: 'default' as const,
      badge: undefined,
    },
  ] as const,
  grandTotal: '#62,980',
  itemImageIds: ['ribeye', 'fries', 'mojito', 'sourdough', 'cabernet'] as const,
  rating: 5,
} as const;
