import { loyaltyAnalyticsSchema } from '@api/loyaltyApi';

/**
 * `GET /loyalty/analytics` returns the customer's **totals** at the top level
 * and change indicators under `trends`. The schema used to parse only
 * `trends`, which meant every "Saved Total"-style read was showing the signed
 * change rather than the total. These cases lock in both the precedence and
 * every shape the endpoint has been observed to return.
 */

test('reads totals from the top level, not from trends', () => {
  const parsed = loyaltyAnalyticsSchema.safeParse({
    totalVisits: 12,
    currentPointsBalance: 450,
    netSavings: 18500,
    trends: { totalVisits: '+25%', rewardPoints: '+10%', netSavings: '+5%' },
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  // The trends path would have produced 25 / 10 / 5, so this proves precedence.
  expect(parsed.data.totals).toEqual({
    totalVisits: 12,
    rewardPoints: 450,
    netSavings: 18500,
    redeemedPoints: null,
    dealsRedeemed: null,
    avgDiscountPercent: null,
  });
  // The change indicators are still parsed and available.
  expect(parsed.data.trends).toEqual({
    totalVisits: 25,
    rewardPoints: 10,
    netSavings: 5,
  });
});

test('parses the live shape (zero totals alongside string trends)', () => {
  const parsed = loyaltyAnalyticsSchema.safeParse({
    totalVisits: 1,
    currentPointsBalance: 0,
    netSavings: 0,
    visitTrends: [{ month: 'Oct', visits: 1 }],
    pointsByVenue: [],
    topVenues: [{ venueName: 'Synergyfy', points: 1 }],
    trends: { totalVisits: '+1', rewardPoints: '0', netSavings: '0' },
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.totals).toEqual({
    totalVisits: 1,
    rewardPoints: 0,
    netSavings: 0,
    redeemedPoints: null,
    dealsRedeemed: null,
    avgDiscountPercent: null,
  });
});

test('falls back to trends when the totals are absent', () => {
  const parsed = loyaltyAnalyticsSchema.safeParse({
    trends: { totalVisits: 12, rewardPoints: 340, netSavings: 18500 },
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.totals).toEqual({
    totalVisits: 12,
    rewardPoints: 340,
    netSavings: 18500,
    redeemedPoints: null,
    dealsRedeemed: null,
    avgDiscountPercent: null,
  });
});

test('coerces numeric strings and tolerates missing fields', () => {
  const parsed = loyaltyAnalyticsSchema.safeParse({
    trends: { totalVisits: '7', netSavings: '₦1,200' },
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.totals).toEqual({
    totalVisits: 7,
    rewardPoints: null,
    netSavings: 1200,
    redeemedPoints: null,
    dealsRedeemed: null,
    avgDiscountPercent: null,
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
  expect(parsed.data.totals).toEqual({
    totalVisits: 5,
    rewardPoints: 25,
    netSavings: 150,
    redeemedPoints: null,
    dealsRedeemed: null,
    avgDiscountPercent: null,
  });
});

test('never fails the query on an unexpected trends shape', () => {
  for (const trends of [null, 42, 'none', undefined]) {
    const parsed = loyaltyAnalyticsSchema.safeParse({ trends });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.trends).toBeNull();
    expect(parsed.data.totals).toEqual({
      totalVisits: null,
      rewardPoints: null,
      netSavings: null,
      redeemedPoints: null,
      dealsRedeemed: null,
      avgDiscountPercent: null,
    });
  }

  // An object without the documented fields still parses, with null stats.
  const junk = loyaltyAnalyticsSchema.safeParse({ trends: { junk: true } });
  expect(junk.success).toBe(true);
  if (!junk.success) return;
  expect(junk.data.totals).toEqual({
    totalVisits: null,
    rewardPoints: null,
    netSavings: null,
    redeemedPoints: null,
    dealsRedeemed: null,
    avgDiscountPercent: null,
  });
});
