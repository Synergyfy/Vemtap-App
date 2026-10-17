import {
  businessNetworkApi,
  type DiscoveryPresence,
  type NetworkSummary,
  type ReferralCard,
  type ReferralDetail,
  type ReferralsPage,
} from '@api/businessNetworkApi';

/** `/business-network` payloads: 7 referrals, 5 verified (Network Partner). */
export const abcCard: ReferralCard = {
  id: 'biz-abc',
  name: 'ABC Electronics',
  logoUrl: null,
  code: 'ABC123XYZ',
  category: 'Retail',
  location: 'Wuse II, Abuja',
  status: 'verified',
  joinedAt: '2026-09-28T10:00:00.000Z',
  verifiedAt: '2026-09-30T10:00:00.000Z',
};

export const xyzCard: ReferralCard = {
  ...abcCard,
  id: 'biz-xyz',
  name: 'XYZ Phones',
  code: 'XYZ999AAA',
  status: 'pending',
  verifiedAt: null,
};

export const summaryFixture: NetworkSummary = {
  referralCode: 'URBAN0001',
  referralLink: 'https://vemtap.com/get-started?ref=URBAN0001',
  counts: { total: 7, registered: 1, pending: 1, verified: 5, notQualified: 0 },
  joined: { current: 2, previous: 1 },
  conversionRate: 0.71,
  tiers: [
    {
      id: 'starter',
      name: 'Network Starter',
      threshold: 3,
      perks: ['Network recognition'],
      state: 'unlocked',
      progress: 1,
      remaining: 0,
    },
    {
      id: 'partner',
      name: 'Network Partner',
      threshold: 5,
      perks: ['Partner badge'],
      state: 'active',
      progress: 1,
      remaining: 0,
    },
    {
      id: 'community',
      name: 'Community Network Partner',
      threshold: 10,
      perks: ['Community recognition'],
      state: 'locked',
      progress: 0.5,
      remaining: 5,
    },
    {
      id: 'builder',
      name: 'Local Network Builder',
      threshold: 25,
      perks: ['District-wide campaigns'],
      state: 'locked',
      progress: 0.2,
      remaining: 20,
    },
  ],
  current: { id: 'partner', name: 'Network Partner' },
  next: {
    id: 'community',
    name: 'Community Network Partner',
    threshold: 10,
    remaining: 5,
    progress: 0.5,
  },
  recent: [abcCard, xyzCard],
  nearby: {
    total: 14,
    radiusMeters: 10000,
    merchants: [
      {
        branchId: 'br-bean',
        name: 'Main',
        businessName: 'Artisan Bean Roastery',
        category: 'Food & Beverage',
        distanceMeters: 200,
      },
    ],
  },
};

export const referralsFixture: ReferralsPage = {
  data: [abcCard, xyzCard],
  total: 2,
  page: 1,
  limit: 20,
  hasNextPage: false,
  meta: {
    statusCounts: { all: 7, registered: 1, pending: 1, verified: 5, notQualified: 0 },
  },
};

export const referralDetailFixture: ReferralDetail = {
  ...abcCard,
  creditedTo: { id: 'biz-me', name: 'Urban Grill' },
  countsTowardMilestone: true,
  timeline: [
    { id: 'registered', at: '2026-09-28T10:00:00.000Z', done: true },
    { id: 'setup', at: '2026-09-28T11:00:00.000Z', done: true },
    { id: 'submitted', at: '2026-09-29T10:00:00.000Z', done: true },
    { id: 'verified', at: '2026-09-30T10:00:00.000Z', done: true },
    { id: 'firstDeal', at: null, done: false },
  ],
};

export const discoveryFixture: DiscoveryPresence = {
  branch: { id: 'b-wuse', name: 'Wuse Flagship' },
  card: {
    name: 'Urban Grill',
    category: 'Restaurant',
    logoUrl: null,
    coverImage: null,
    locality: 'Wuse II, Abuja',
    rating: 4.8,
    reviews: 128,
    topDeal: {
      name: 'Prime Lunch Combo',
      pricingType: 'percentage_discount',
      discountValue: 20,
      price: 9600,
    },
  },
  health: {
    score: 80,
    checks: {
      logo: true,
      cover: false,
      description: true,
      category: true,
      hours: false,
      location: true,
      catalogue: true,
      liveDeal: true,
      verified: true,
      discoverable: true,
    },
  },
  engagement: { current: 120, previous: 100 },
  index: { catalogueItems: 64, bookableServices: 3, liveDeals: 2, hoursSet: false },
  zones: [
    { id: 'b-wuse', name: 'Wuse Flagship', area: 'Wuse', active: true },
    { id: 'b-garki', name: 'Garki Express', area: null, active: false },
  ],
  settings: {
    joinDiscoveryNetwork: true,
    receivePartnerRequests: true,
    allowPromotions: false,
    pushNotifications: true,
    smsAlerts: false,
    emailSummary: true,
  },
};

export function mockNetworkApis() {
  jest.spyOn(businessNetworkApi, 'summary').mockResolvedValue(summaryFixture);
  jest.spyOn(businessNetworkApi, 'referrals').mockResolvedValue(referralsFixture);
  jest.spyOn(businessNetworkApi, 'referral').mockResolvedValue(referralDetailFixture);
  jest.spyOn(businessNetworkApi, 'discovery').mockResolvedValue(discoveryFixture);
}
