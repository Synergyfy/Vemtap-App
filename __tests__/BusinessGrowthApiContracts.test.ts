import {
  segmentsApi,
  promotionsApi,
  boostsApi,
  adWalletApi,
  segmentReachSchema,
  segmentInsightSchema,
  promotionForecastSchema,
  promotionsPageSchema,
  promotionEligibleAssetSchema,
  launchedPromotionSchema,
  boostForecastSchema,
} from '../src/api';

describe('new business growth api contracts', () => {
  it('exposes the newer resource modules and their core fetch/write methods', () => {
    expect(segmentsApi).toBeTruthy();
    expect(typeof segmentsApi.listSegments).toBe('function');
    expect(typeof segmentsApi.createSegment).toBe('function');
    expect(typeof segmentsApi.previewSegment).toBe('function');
    expect(typeof segmentsApi.getSegmentInsights).toBe('function');

    expect(promotionsApi).toBeTruthy();
    expect(typeof promotionsApi.listPromotions).toBe('function');
    expect(typeof promotionsApi.createPromotion).toBe('function');
    expect(typeof promotionsApi.getPromotion).toBe('function');
    expect(typeof promotionsApi.getPromotionStats).toBe('function');
    expect(typeof promotionsApi.forecastPromotion).toBe('function');

    expect(boostsApi).toBeTruthy();
    expect(typeof boostsApi.listBoosts).toBe('function');
    expect(typeof boostsApi.createBoost).toBe('function');
    expect(typeof boostsApi.launchBoost).toBe('function');
    expect(typeof boostsApi.getBoostOptions).toBe('function');
    expect(typeof boostsApi.forecastBoost).toBe('function');

    expect(adWalletApi).toBeTruthy();
    expect(typeof adWalletApi.getWallet).toBe('function');
    expect(typeof adWalletApi.listTransactions).toBe('function');
    expect(typeof adWalletApi.listPrepacks).toBe('function');
    expect(typeof adWalletApi.topUpWallet).toBe('function');
    expect(typeof adWalletApi.getInvoice).toBe('function');
  });

  it('accepts the expected forecast payload shapes for segments, promotions and boosts', () => {
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

    const boostForecast = boostForecastSchema.parse({
      reachMin: 500,
      reachMax: 1200,
      claimsMin: 18,
      claimsMax: 44,
      estReturn: 1600,
      confidence: 'medium',
    });
    expect(boostForecast.reachMax).toBe(1200);
  });
});
