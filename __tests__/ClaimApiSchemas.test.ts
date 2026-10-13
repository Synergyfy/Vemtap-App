import { myClaimsPageSchema } from '@api/claimApi';

/**
 * Regression for the "Response schema mismatch" logged from
 * `requestValidated`: `GET /me/claims` embeds the offer straight from TypeORM,
 * where `catalogue_offers` numeric columns arrive as strings
 * ("1500.00"). Every other money field already uses the tolerant
 * union; this pins the claims payload to the same contract.
 */

const baseClaim = {
  id: 'c1f2e3d4-0000-4000-8000-000000000001',
  claimCode: 'CLAIM-AB12',
  status: 'ACTIVE' as const,
  expiresAt: '2026-10-30T12:00:00.000Z',
  claimedAt: '2026-10-10T09:00:00.000Z',
  redeemedAt: null,
  offer: {
    id: 'a1b2c3d4-0000-4000-8000-000000000002',
    name: '20% Off Prime Lunch',
    mainImage: null,
    calculatedPrice: 8500,
    originalPrice: 10000,
    discountPercent: 15,
    pricingType: 'percentage_discount',
    discountValue: null as string | number | null | undefined,
    businessId: 'f00d0000-0000-4000-8000-000000000003',
    businessName: 'Urban Grill & Bistro',
    businessLogo: null,
    branchId: null,
    branchName: null,
    branchAddress: null,
    endDate: '2026-11-01T00:00:00.000Z',
  },
};

const page = (offer: Record<string, unknown>) => ({
  data: [{ ...baseClaim, offer: { ...baseClaim.offer, ...offer } }],
  total: 1,
  page: 1,
  limit: 10,
});

test('parses a claim whose discountValue arrives as a numeric string', () => {
  const parsed = myClaimsPageSchema.safeParse(page({ discountValue: '1500.00' }));

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  expect(parsed.data.data[0].offer.discountValue).toBe('1500.00');
});

test('parses a claim whose discountValue is null or absent', () => {
  const nulled = myClaimsPageSchema.safeParse(page({ discountValue: null }));
  expect(nulled.success).toBe(true);

  const offer = { ...baseClaim.offer };
  delete (offer as Record<string, unknown>).discountValue;
  const absent = myClaimsPageSchema.safeParse({
    data: [{ ...baseClaim, offer }],
    total: 1,
    page: 1,
    limit: 10,
  });
  expect(absent.success).toBe(true);
});

test('still rejects a string where the API already coerces the number', () => {
  const parsed = myClaimsPageSchema.safeParse(page({ calculatedPrice: '8500.00' }));

  expect(parsed.success).toBe(false);
  if (parsed.success) return;

  expect(parsed.error.flatten().fieldErrors).toHaveProperty('data');
});
