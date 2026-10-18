import type { Promotion, PromotionStats } from '@api/promotionsApi';
import type { BoostDraft } from '@store/boostDraftStore';
import { boostDraftToPreviewView } from '@features/business/utils/boostMappers';
import { statsToPerformanceView } from '@features/business/utils/campaignPerformanceMappers';
import type { BoostGoalAudienceScreenProps } from '@features/business/screens/BoostGoalAudienceScreen';
import type { BoostBudgetScheduleScreenProps } from '@features/business/screens/BoostBudgetScheduleScreen';
import type { BoostWalletScreenProps } from '@features/business/screens/BoostWalletScreen';
import type { BoostEngineLive } from '@features/business/screens/BoostEngineScreen';
import type { CustomerSegmentCard } from '@features/business/data/businessGrowthData';
import {
  promotionToCampaignCard,
  type CampaignContentItem,
} from '@features/business/utils/campaignMappers';
import type { SegmentDetailsView } from '@features/business/utils/segmentMappers';

/** A boost as Goal & Audience receives it from the route. */
export const boostGoalLiveFixture: BoostGoalAudienceScreenProps['live'] = {
  asset: { badge: 'Deal', business: 'Aurora Grill', name: 'Jollof Combo', claims: '3' },
  geofencePlace: 'Jabi • 3 km radius',
  reach: { value: '1,200 – 1,800 people', percent: 40 },
};

export const boostBudgetLiveFixture: BoostBudgetScheduleScreenProps['live'] = {
  assetName: 'Jollof Combo',
  assetGoal: 'Goal: More Deal Claims',
  tierForecasts: { '10': { reach: '2k – 3k', claims: '20 – 30' } },
  forecast: { reach: '4k – 6k', claims: '40 – 60' },
};

export const boostDraftFixture: BoostDraft = {
  asset: { type: 'deal', id: 'deal-1', title: 'Jollof Combo', price: 4_000 },
  goalId: 'claims',
  audienceScope: 'nearby',
  areas: [],
  radiusKm: 3,
  placements: ['feed', 'home', 'push'],
  durationDays: 5,
  dayparting: true,
  budget: 20_000,
  funding: 'wallet',
};

export const boostPreviewFixture = boostDraftToPreviewView(boostDraftFixture, {
  businessName: 'Aurora Grill',
  branchName: 'Jabi',
  walletSpendable: 25_000,
  now: new Date('2026-10-15T10:00:00Z'),
});

export const promotionFixture: Promotion = {
  id: '0b9a4f1e-1c2d-4e5f-8a9b-0c1d2e3f4a5b',
  name: 'Jollof Combo boost',
  status: 'Active',
  assets: [],
  budget: 20_000,
  spent: 12_450,
  remaining: 7_550,
  launchedAt: '2026-10-13T08:00:00Z',
  startDate: '2026-10-13T08:00:00Z',
  endDate: '2026-10-18T08:00:00Z',
};

export const promotionStatsFixture = {
  id: promotionFixture.id,
  status: 'Active' as const,
  kpis: {
    budget: 20_000,
    spent: 12_450,
    left: 7_550,
    percentConsumed: 62,
    redemptions: 40,
    grossRevenue: 160_000,
    reach: 10_840,
    returnOnSpend: 12.85,
  },
  funnel: [
    { id: 'impressions', label: 'Impressions', value: 10_000 },
    { id: 'taps', label: 'Taps & views', value: 4_000 },
    { id: 'saves', label: 'Saves', value: 1_000 },
    { id: 'claims', label: 'Claims', value: 100 },
    { id: 'redeemed', label: 'Redeemed', value: 40 },
  ],
  rhythm: [
    { hour: 9, claims: 10 },
    { hour: 13, claims: 60 },
  ],
  byBranch: [{ branchId: 'b1', name: 'Jabi', claims: 100 }],
  series: [],
} as unknown as PromotionStats;

export const boostPerformanceFixture = statsToPerformanceView(
  'boost',
  promotionFixture,
  promotionStatsFixture,
  Date.parse('2026-10-15T10:00:00Z'),
);

export const boostWalletLiveFixture: NonNullable<BoostWalletScreenProps['live']> = {
  walletRef: 'VEM-WAL-1',
  balance: '₦25,000',
  reserved: '₦5,000',
  spendable: '₦20,000',
  prepacks: [
    { id: 'p10', badge: '₦10k', title: '₦10,000 Top-Up', bonus: 'No bonus credit' },
    {
      id: 'p25',
      badge: '₦25k',
      title: '₦25,000 Top-Up',
      bonus: '+₦1,000 bonus ad credit',
      tier: 'Popular',
    },
  ],
  transactions: [
    {
      id: 't1',
      title: 'Wallet top-up',
      meta: '15 Oct',
      amount: '+₦25,000',
      status: 'Completed',
      icon: 'creditCard',
      credit: true,
    },
  ],
  hasMore: false,
  minTopUp: 2_000,
};

export const campaignCardsFixture = [
  promotionToCampaignCard(promotionFixture, Date.parse('2026-10-15T10:00:00Z')),
  promotionToCampaignCard(
    { ...promotionFixture, id: 'c-2', name: 'Weekend brunch push', status: 'Draft' },
    Date.parse('2026-10-15T10:00:00Z'),
  ),
];

export const segmentCardsFixture: CustomerSegmentCard[] = [
  {
    id: 'seg-1',
    name: 'Lunch regulars',
    detail: 'Visited 3+ times in 30 days',
    icon: 'autoAwesome',
    iconTone: 'brand',
    badge: 'Auto-updating',
    badgeTone: 'brand',
    size: '120',
    insight: 'Ready for a loyalty perk',
    cta: 'Use Segment',
  },
];

export const boostEngineLiveFixture: BoostEngineLive = {
  metrics: [{ label: 'Views', value: '1,240', icon: 'visibility' }],
  asset: { name: 'Jollof Combo', badge: 'Deal' },
  radiusReach: {},
  tierClaims: {},
  preview: { name: 'Jollof Combo', branch: 'Jabi', distance: '0.4 km' },
};

export const campaignContentFixture: CampaignContentItem[] = [
  {
    id: 'deal-1',
    type: 'deal',
    group: 'deals',
    title: 'Jollof Combo',
    eyebrow: 'Deal Pass',
    badge: 'Deal',
    body: '',
    price: '₦4,000',
    was: '',
    performance: '',
    icon: 'localOffer',
    location: 'Jabi',
  },
  {
    id: 'prod-1',
    type: 'product',
    group: 'products',
    title: 'Zobo (50cl)',
    eyebrow: 'Product Item',
    badge: 'Product',
    body: '',
    price: '₦800',
    was: '',
    performance: '',
    icon: 'shoppingBag',
    location: 'Jabi',
  },
];

export const segmentDetailsFixture: SegmentDetailsView = {
  id: 'seg-1',
  name: 'Lunch regulars',
  updated: 'Updated just now',
  hero: '120 Customers',
  badge: 'Auto-updating',
  body: 'Visited 3+ times in 30 days',
  tags: [],
  spend: '₦540,000',
  aov: '₦4,500',
  frequency: '3.1 visits',
  frequencyNote: 'per customer / month',
  branchesMeta: '',
  branches: [{ id: 'b1', label: 'Jabi', percent: 100 }],
  channels: [
    { id: 'push', label: 'Push / Feed', value: '96', percent: 80, icon: 'sensors' },
  ],
  favourites: [],
  sampleMeta: '1 of 120',
  patrons: [{ id: 'cust-1', initials: 'AO', name: 'Ada Obi', meta: '6 orders' }],
};

/** Tiers as `/boosts/options` would serve them, deliberately unlike the defaults. */
export const boostTiersFixture = [
  { id: 't1', amount: 12_000, label: 'Starter' },
  { id: 't2', amount: 25_000, label: 'Best Value' },
  { id: 't3', amount: 50_000, label: 'Growth' },
];

/** Tiers as `/promotions/options` would serve them. */
export const promotionTiersFixture = [
  { id: 'p1', amount: 18_000, label: 'Starter Booster' },
  { id: 'p2', amount: 36_000, label: 'Growth Accelerator' },
  { id: 'p3', amount: 72_000, label: 'Market Leader Surge' },
];
