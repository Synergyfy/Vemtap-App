import {
  segmentsApi,
  promotionsApi,
  boostsApi,
  adWalletApi,
  segmentPreviewSchema,
  promotionForecastSchema,
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
    const preview = segmentPreviewSchema.parse({
      size: 128,
      reachableByPush: 72,
      reachableBySms: 58,
    });
    expect(preview.size).toBe(128);

    const promotionForecast = promotionForecastSchema.parse({
      reachMin: 1000,
      reachMax: 2500,
      claimsMin: 40,
      claimsMax: 90,
      estReturn: 4200,
      confidence: 'medium',
    });
    expect(promotionForecast.claimsMax).toBe(90);

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
