import { itemBranchPricingSchema } from '@api/catalogueApi';
import {
  segmentsApi,
  promotionsApi,
  boostsApi,
  adWalletApi,
  adWalletBalanceSchema,
  adWalletSavedCardTopUpSchema,
  adWalletInvoicesPageSchema,
  segmentReachSchema,
  segmentInsightSchema,
  promotionForecastSchema,
  promotionsPageSchema,
  promotionEligibleAssetSchema,
  launchedPromotionSchema,
  promotionStatsSchema,
  sponsoredCampaignOptionsSchema,
  sponsoredApi,
  sponsoredOffersSchema,
} from '../src/api';
import offersFeed from './fixtures/offers-feed.json';

describe('new business growth api contracts', () => {
  it('exposes the newer resource modules and their core fetch/write methods', () => {
    expect(segmentsApi).toBeTruthy();
    expect(typeof segmentsApi.listSegments).toBe('function');
    expect(typeof segmentsApi.createSegment).toBe('function');
    expect(typeof segmentsApi.previewSegment).toBe('function');
    expect(typeof segmentsApi.getSegmentInsights).toBe('function');

    expect(promotionsApi).toBeTruthy();
    // `/promotions` and `/boosts` share one controller, so one client shape.
    for (const api of [promotionsApi, boostsApi]) {
      for (const method of [
        'list',
        'create',
        'get',
        'launch',
        'stats',
        'options',
        'forecast',
      ]) {
        expect(typeof api[method as keyof typeof api]).toBe('function');
      }
    }

    expect(adWalletApi).toBeTruthy();
    expect(typeof adWalletApi.getWallet).toBe('function');
    expect(typeof adWalletApi.listTransactions).toBe('function');
    expect(typeof adWalletApi.listPrepacks).toBe('function');
    expect(typeof adWalletApi.topUpWallet).toBe('function');
    expect(typeof adWalletApi.confirmTopUp).toBe('function');
  });

  it('accepts the backend payloads for segments, promotions and boosts', () => {
    const preview = segmentReachSchema.parse({
      size: 128,
      reachableByPush: 72,
      reachableBySms: 58,
      reachableByEmail: 40,
    });
    expect(preview.size).toBe(128);

    // Payloads below mirror the backend's return statements
    // (promotions.service.ts `forecast`, `view`, `eligibleAssets`, `launch`;
    // segments.service.ts `insights`), so a drift fails here, not on device.
    const promotionForecast = promotionForecastSchema.parse({
      budget: 20000,
      durationDays: 7,
      dailyPace: 2857.14,
      radiusKm: 3,
      reachMin: 8400,
      reachMax: 13200,
      claimsMin: 63,
      claimsMax: 121,
      audienceCapped: false,
      isEstimate: true,
    });
    expect(promotionForecast.claimsMax).toBe(121);

    const draft = {
      id: '0b9a4f1e-1c2d-4e5f-8a9b-0c1d2e3f4a5b',
      kind: 'promotion',
      name: 'Weekend push',
      status: 'Draft',
      objective: 'deal',
      goalId: null,
      assets: [{ type: 'deal', id: 'd1' }],
      audience: {},
      placements: [],
      schedule: null,
      budgetMode: null,
      budget: 0,
      dailyBudget: null,
      spent: '0.00',
      remaining: 0,
      fundingSource: null,
      awaitingPayment: false,
      paymentReference: null,
      branchId: null,
      startDate: null,
      endDate: null,
      launchedAt: null,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    };
    const page = promotionsPageSchema.parse({
      data: [draft],
      total: 1,
      page: 1,
      limit: 20,
      hasNextPage: false,
    });
    expect(page.data[0].spent).toBe(0);

    const launched = launchedPromotionSchema.parse({
      ...draft,
      status: 'Pending',
      checkout: {
        reference: 'ADW-1',
        amount: 5000,
        bonus: 0,
        accessCode: 'abc',
        authorizationUrl: 'https://checkout.paystack.com/abc',
      },
    });
    expect(launched.checkout?.authorizationUrl).toContain('paystack');

    const profile = promotionEligibleAssetSchema.parse({
      type: 'profile',
      id: 'b1',
      title: 'Mama Put',
      image: null,
      price: null,
      wasPrice: null,
      priorClaims: null,
    });
    expect(profile.price).toBeNull();

    const insight = segmentInsightSchema.parse({
      segmentId: 's1',
      name: 'Lapsed',
      type: 'dynamic',
      size: 2,
      reachableByPush: 1,
      reachableBySms: 2,
      reachableByEmail: 0,
      totalSpend: 45000,
      avgOrderValue: 7500,
      visitFrequency: 3,
      spendDelta: null,
      aovDelta: 0.12,
      branchSplit: [{ branchId: 'br1', name: 'Wuse', percent: 100 }],
      favourites: [{ itemId: 'i1', name: 'Jollof', orders: 4 }],
      samplePatrons: [
        { userId: 'u1', name: 'Ada O.', avatarUrl: null, lastVisit: null, spend: 30000 },
      ],
    });
    expect(insight.favourites[0].orders).toBe(4);

    const stats = promotionStatsSchema.parse({
      id: 'p1',
      kind: 'boost',
      status: 'Active',
      kpis: {
        budget: 20000,
        spent: 12450,
        left: 7550,
        percentConsumed: 62,
        redemptions: 64,
        grossRevenue: 614400,
        reach: 10840,
        returnOnSpend: 49.35,
      },
      funnel: [{ id: 'impressions', label: 'Impressions', value: 10840 }],
      rhythm: [{ hour: 13, claims: 28 }],
      byBranch: [{ branchId: 'b1', name: 'Wuse II', claims: 37 }],
      series: [{ date: '2026-10-14', spend: '4150.00', claims: 60 }],
    });
    expect(stats.series[0].spend).toBe(4150);

    const options = sponsoredCampaignOptionsSchema.parse({
      radiusKm: [1, 3, 5, 10],
      placements: [{ id: 'feed', label: 'Deal Discovery Feed' }],
      daypartWindows: [
        { id: 'lunch', label: 'Lunch Rush', start: '11:30', end: '15:30' },
      ],
      durationsDays: [3, 5, 7, 14, 30],
      budgetModes: ['total', 'daily'],
      minBudget: 2000,
      goals: [{ id: 'claims', label: 'More Deal Claims & Sales' }],
      audienceScopes: [{ id: 'nearby', label: 'Nearby Customers' }],
      budgetTiers: [{ id: '10', amount: 10000, label: 'Starter' }],
    });
    expect(options.goals?.[0].id).toBe('claims');
  });
});

describe('sponsored delivery and run comparison contract', () => {
  it('reads promoted offers as public offer rows', () => {
    const page = sponsoredOffersSchema.parse({
      data: [{ campaignId: 'c-1', offer: offersFeed.data[0] }],
    });
    expect(page.data[0].campaignId).toBe('c-1');
    expect(page.data[0].offer.id).toBe(offersFeed.data[0].id);
    expect(typeof sponsoredApi.list).toBe('function');
    expect(typeof sponsoredApi.recordEvents).toBe('function');
  });

  it('reads views per hour, the previous run and the benchmark (all optional)', () => {
    const base = {
      id: 'p1',
      status: 'Active',
      kpis: {
        budget: 20000,
        spent: 4000,
        left: 16000,
        percentConsumed: 20,
        redemptions: 4,
        grossRevenue: 40000,
        reach: 80,
        returnOnSpend: 10,
      },
      funnel: [],
      rhythm: [{ hour: 13, views: 40, claims: 6 }],
      byBranch: [],
      series: [],
    };
    // Mirrors promotions.service.ts `previousRun` and `benchmark`.
    const stats = promotionStatsSchema.parse({
      ...base,
      previous: {
        id: 'c-0',
        name: 'Lunch boost (run 1)',
        endDate: '2026-10-06T08:00:00.000Z',
        reach: 60,
        claims: 8,
        redemptions: 3,
        spent: 10000,
        costPerClaim: 1250,
      },
      benchmark: { costPerClaim: 250, campaigns: 10 },
    });
    expect(stats.previous?.reach).toBe(60);
    expect(stats.benchmark?.costPerClaim).toBe(250);
    expect(stats.rhythm[0].views).toBe(40);

    const older = promotionStatsSchema.parse({
      ...base,
      rhythm: [{ hour: 13, claims: 6 }],
      previous: null,
      benchmark: null,
    });
    expect(older.previous).toBeNull();
    expect(older.rhythm[0].views).toBeUndefined();
  });
});

describe('ad wallet saved card and invoices contract', () => {
  // Mirrors ad-wallet.service.ts `summarize`, `topUpWithSavedCard` and
  // ad-wallet-invoices.service.ts `view`.
  const wallet = {
    walletRef: 'VEM-WAL-ABC123',
    balance: 12000,
    reserved: 2000,
    spendable: 10000,
    currency: 'NGN',
    card: { brand: 'visa', last4: '4242', expMonth: '08', expYear: '2027', bank: null },
    autoReload: { enabled: true, threshold: 2000, amount: 10000, lastError: null },
  };

  it('reads the card and auto-reload, and tolerates older servers', () => {
    expect(adWalletBalanceSchema.parse(wallet).card?.last4).toBe('4242');
    const older = adWalletBalanceSchema.parse({
      walletRef: 'VEM-WAL-ABC123',
      balance: '12000.00',
      reserved: '0.00',
      spendable: 12000,
    });
    expect(older.card).toBeUndefined();
    expect(older.autoReload).toBeUndefined();
  });

  it('reads saved-card top-ups and invoices', () => {
    const failed = adWalletSavedCardTopUpSchema.parse({
      reference: 'ADW-1',
      status: 'failed',
      reason: 'Your saved card was declined',
      wallet,
    });
    expect(failed.reason).toBe('Your saved card was declined');

    const page = adWalletInvoicesPageSchema.parse({
      data: [
        {
          id: 'inv-1',
          invoiceNo: 'INV-B-ABCD1234',
          paymentMethod: 'Saved card',
          amount: 10000,
          currency: 'NGN',
          status: 'Paid',
          date: '2026-10-14T10:00:00.000Z',
          campaign: { id: 'c-1', name: 'Lunch boost', kind: 'boost' },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      hasNextPage: false,
    });
    expect(page.data[0].campaign?.name).toBe('Lunch boost');
    expect(typeof adWalletApi.topUpWithSavedCard).toBe('function');
    expect(typeof adWalletApi.removeCard).toBe('function');
    expect(typeof adWalletApi.setAutoReload).toBe('function');
    expect(typeof adWalletApi.listInvoices).toBe('function');
    expect(typeof adWalletApi.getInvoice).toBe('function');
  });
});

describe('catalogue branch pricing contract', () => {
  it('parses the backend branch-pricing payload (numeric strings included)', () => {
    // Mirrors CatalogueBranchPricingService.getItemBranchPricing.
    const pricing = itemBranchPricingSchema.parse({
      itemId: 'svc-1',
      pricingMode: 'per_branch',
      basePrice: 15000,
      baseCompareAtPrice: null,
      branches: [
        {
          branchId: 'b1',
          branchName: 'Wuse II',
          isMainBranch: true,
          isAvailable: true,
          price: '18000.00',
          compareAtPrice: null,
          stockQuantity: null,
          hasOverride: true,
        },
      ],
    });
    expect(pricing.branches[0].price).toBe(18000);
  });
});
