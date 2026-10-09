import { loyaltyTierSchema } from '@api/loyaltyApi';
import { formatCompactNaira, formatPoints, formatWhen } from '@utils/formatters';

describe('loyaltyTierSchema', () => {
  // Tier thresholds are server-authoritative (`GET /loyalty/points/tier`), so
  // the app no longer resolves them locally. These assert we read the payload
  // correctly, including the "no next tier" case.
  const parse = (payload: unknown) => loyaltyTierSchema.parse(payload);

  test('reads tier, next tier and progress from the API', () => {
    const tier = parse({
      points: 2450,
      tier: 'Gold',
      nextTier: 'Platinum',
      pointsToNext: 3000,
      progressPercent: 81.7,
      thresholds: [
        { name: 'Bronze', minPoints: 0 },
        { name: 'Silver', minPoints: 1000 },
        { name: 'Gold', minPoints: 2000 },
        { name: 'Platinum', minPoints: 3000 },
        { name: 'Diamond', minPoints: 6000 },
      ],
    });
    expect(tier.tier).toBe('Gold');
    expect(tier.nextTier).toBe('Platinum');
    expect(tier.pointsToNext).toBe(3000);
    expect(Math.round(tier.progressPercent ?? 0)).toBe(82);
    expect(tier.thresholds).toHaveLength(5);
  });

  test('the top tier has no next tier', () => {
    const tier = parse({
      points: 6000,
      tier: 'Diamond',
      nextTier: null,
      pointsToNext: null,
      progressPercent: 100,
      thresholds: [{ name: 'Diamond', minPoints: 6000 }],
    });
    expect(tier.tier).toBe('Diamond');
    expect(tier.nextTier).toBeNull();
  });

  test('tolerates a payload with only the balance', () => {
    const tier = parse({ points: 120 });
    expect(tier.points).toBe(120);
    expect(tier.tier).toBeUndefined();
    expect(tier.thresholds).toEqual([]);
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
