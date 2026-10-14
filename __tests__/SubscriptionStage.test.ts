import { trialStageOf } from '@features/business/hooks/useSubscriptions';
import { trialProgress } from '@features/business/subscriptionDisplay';
import type { ActiveSubscription } from '@api/subscriptionsApi';

const base = {
  id: 'sub-1',
  planId: 'plan-pro',
  status: 'trial',
  billingPeriod: 'monthly',
  startDate: '2026-10-01T00:00:00.000Z',
  endDate: '2026-10-31T00:00:00.000Z',
  trialEndsAt: '2026-10-31T00:00:00.000Z',
  isTrial: true,
  daysRemaining: 10,
  trialEligible: false,
  trialUsedAt: '2026-10-01T00:00:00.000Z',
  plan: { id: 'plan-pro', name: 'Professional', monthlyPrice: 15000, isFree: false },
} as NonNullable<ActiveSubscription>;

const free = {
  ...base,
  planId: 'plan-free',
  status: 'active',
  isTrial: false,
  plan: { id: 'plan-free', name: 'Starter', monthlyPrice: 0, isFree: true },
} as NonNullable<ActiveSubscription>;

describe('trialStageOf', () => {
  test('a running trial is active until the last three days', () => {
    expect(trialStageOf(base)).toBe('active');
    expect(trialStageOf({ ...base, daysRemaining: 3 })).toBe('ending');
  });

  test('the free plan offers the trial once, then reports it expired', () => {
    expect(trialStageOf({ ...free, trialEligible: true, trialUsedAt: null })).toBe(
      'eligible',
    );
    expect(trialStageOf(free)).toBe('expired');
    expect(trialStageOf({ ...free, trialUsedAt: null })).toBe('none');
  });

  test('a paid plan and a missing subscription', () => {
    expect(trialStageOf({ ...base, isTrial: false, status: 'active' })).toBe('paid');
    expect(trialStageOf(undefined)).toBe('none');
  });
});

describe('trialProgress', () => {
  test('counts the trial window from its dates and the days left', () => {
    const progress = trialProgress(base);
    expect(progress.totalDays).toBe(30);
    expect(progress.daysRemaining).toBe(10);
    expect(progress.daysUsed).toBe(20);
    expect(progress.percentElapsed).toBe(67);
    expect(progress.endsOn).toBeTruthy();
  });
});
