import { resolveTier, rewardTiers } from '@features/accountHub/data/rewardTiers';
import { formatCompactNaira, formatPoints, formatWhen } from '@utils/formatters';

describe('resolveTier', () => {
  test('a new customer sits at Bronze with zero progress', () => {
    const status = resolveTier(0);
    expect(status.tier).toEqual({ rank: 1, name: 'Bronze', points: 0 });
    expect(status.next?.name).toBe('Silver');
    expect(status.progress).toBe(0);
  });

  test('thresholds are inclusive at the boundary', () => {
    expect(resolveTier(999).tier.name).toBe('Bronze');
    expect(resolveTier(1000).tier.name).toBe('Silver');
    expect(resolveTier(2000).tier.name).toBe('Gold');
    expect(resolveTier(3000).tier.name).toBe('Platinum');
  });

  test('matches the design numbers: 2,450 points is Gold, ~82% to Platinum', () => {
    const status = resolveTier(2450);
    expect(status.tier).toEqual({ rank: 3, name: 'Gold', points: 2000 });
    expect(status.next).toEqual({ rank: 4, name: 'Platinum', points: 3000 });
    expect(status.progress).toBeCloseTo(2450 / 3000, 5);
    expect(Math.round(status.progress * 100)).toBe(82);
  });

  test('the top tier has no next tier and reports full progress', () => {
    for (const points of [6000, 12000]) {
      const status = resolveTier(points);
      expect(status.tier.name).toBe('Diamond');
      expect(status.next).toBeNull();
      expect(status.progress).toBe(1);
    }
  });

  test('invalid or negative input falls back to the floor', () => {
    expect(resolveTier(-50).tier.name).toBe('Bronze');
    expect(resolveTier(-50).progress).toBe(0);
    expect(resolveTier(Number.NaN).tier.name).toBe('Bronze');
  });

  test('tiers ascend strictly by points', () => {
    for (let i = 1; i < rewardTiers.length; i += 1) {
      expect(rewardTiers[i].points).toBeGreaterThan(rewardTiers[i - 1].points);
      expect(rewardTiers[i].rank).toBe(rewardTiers[i - 1].rank + 1);
    }
  });
});

describe('formatPoints', () => {
  test('groups thousands', () => {
    expect(formatPoints(0)).toBe('0');
    expect(formatPoints(2450)).toBe('2,450');
    expect(formatPoints(1234567)).toBe('1,234,567');
  });

  test('rounds fractional balances', () => {
    expect(formatPoints(2450.6)).toBe('2,451');
  });
});

describe('formatCompactNaira', () => {
  test('zero and small amounts render in full', () => {
    expect(formatCompactNaira(0)).toBe('₦0');
    expect(formatCompactNaira(500)).toBe('₦500');
    expect(formatCompactNaira(999)).toBe('₦999');
  });

  test('thousands compact to k without a trailing zero', () => {
    expect(formatCompactNaira(1000)).toBe('₦1k');
    expect(formatCompactNaira(1500)).toBe('₦1.5k');
    expect(formatCompactNaira(24500)).toBe('₦24.5k');
  });

  test('millions compact to m, negatives keep the sign', () => {
    expect(formatCompactNaira(1000000)).toBe('₦1m');
    expect(formatCompactNaira(2500000)).toBe('₦2.5m');
    expect(formatCompactNaira(-24500)).toBe('-₦24.5k');
  });
});

describe('formatWhen', () => {
  const now = new Date(2026, 9, 14, 15, 0);

  test('same day reads as Today', () => {
    expect(formatWhen('2026-10-14T14:30:00', now)).toBe('Today, 2:30 PM');
    expect(formatWhen('2026-10-14T09:05:00', now)).toBe('Today, 9:05 AM');
  });

  test('the previous day reads as Yesterday', () => {
    expect(formatWhen('2026-10-13T16:15:00', now)).toBe('Yesterday, 4:15 PM');
  });

  test('older timestamps fall back to month and day', () => {
    expect(formatWhen('2026-10-01T14:30:00', now)).toBe('Oct 1, 2:30 PM');
  });

  test('midnight and noon render correctly', () => {
    expect(formatWhen('2026-10-14T00:30:00', now)).toBe('Today, 12:30 AM');
    expect(formatWhen('2026-10-14T12:00:00', now)).toBe('Today, 12:00 PM');
  });

  test('unparseable input yields an empty string', () => {
    expect(formatWhen('not-a-date', now)).toBe('');
  });
});
