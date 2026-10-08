import { loyaltyAnalyticsSchema } from '@api/loyaltyApi';

/**
 * `GET /loyalty/analytics` returned 200 but failed validation ("trends: Invalid
 * input") because the schema had no plain-object branch while the documented
 * payload is `{ trends: { totalVisits, rewardPoints, netSavings } }`
 * (docs/API-BREAKDOWN.md). These cases lock in every shape we accept.
 */

test('parses the documented trends object', () => {
  const parsed = loyaltyAnalyticsSchema.safeParse({
    trends: { totalVisits: 12, rewardPoints: 340, netSavings: 18500 },
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.trends).toEqual({
    totalVisits: 12,
    rewardPoints: 340,
    netSavings: 18500,
  });
});

test('coerces numeric strings and tolerates missing fields', () => {
  const parsed = loyaltyAnalyticsSchema.safeParse({
    trends: { totalVisits: '7', netSavings: '₦1,200' },
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.trends).toEqual({
    totalVisits: 7,
    rewardPoints: null,
    netSavings: 1200,
  });
});

test('sums an array of trend points into one object', () => {
  const parsed = loyaltyAnalyticsSchema.safeParse({
    trends: [
      { totalVisits: 2, rewardPoints: 10, netSavings: 100 },
      { totalVisits: 3, rewardPoints: 15, netSavings: 50 },
    ],
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.trends).toEqual({
    totalVisits: 5,
    rewardPoints: 25,
    netSavings: 150,
  });
});

test('never fails the query on an unexpected trends shape', () => {
  for (const trends of [null, 42, 'none', undefined]) {
    const parsed = loyaltyAnalyticsSchema.safeParse({ trends });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.trends).toBeNull();
  }

  // An object without the documented fields still parses, with null stats.
  const junk = loyaltyAnalyticsSchema.safeParse({ trends: { junk: true } });
  expect(junk.success).toBe(true);
  if (!junk.success) return;
  expect(junk.data.trends).toEqual({
    totalVisits: null,
    rewardPoints: null,
    netSavings: null,
  });
});
