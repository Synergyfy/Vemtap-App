import { z } from 'zod';
import { decimal, nullableDecimal } from '@api/schemaHelpers';
import { businessOffersAdminSchema } from '@api/catalogueApi';
import { myClaimOfferSchema } from '@api/claimApi';
import { myGiftOfferSchema } from '@api/giftApi';
import { dealEngagementSchema } from '@api/dealsApi';
import { reviewsSummarySchema } from '@api/businessDashboardApi';

/**
 * Postgres decimal columns reach the app as strings ("8000.00") whenever the
 * backend entity lacks its numeric transformer. One such price failed the
 * whole `GET /catalogue/offers/admin` response and broke the Business hub.
 * Every response schema that reads a decimal column goes through
 * `decimal`/`nullableDecimal`, so both shapes parse to numbers.
 */

/** A row exactly as `findAllOffersAdmin` serialises it from an untransformed entity. */
const adminOfferRow = {
  id: 'offer-1',
  dealGroupId: 'group-1',
  name: 'Lunch Combo',
  description: 'Rice and chicken',
  mainImage: null,
  galleryImages: null,
  pricingType: 'percentage',
  discountValue: '20.00',
  fixedPrice: null,
  calculatedPrice: '8000.00',
  tiers: null,
  quantity: 50,
  itemIds: ['item-1'],
  startDate: '2026-10-01T00:00:00.000Z',
  endDate: undefined,
  terms: [],
  claimSteps: [],
  maxClaimsPerCustomer: 1,
  claimLimitPeriod: 'lifetime',
  allowGifting: true,
  offerType: 'standard',
  loyaltyPoints: null,
  rewardId: null,
  branchId: 'branch-1',
  branchName: 'Wuse',
  status: 'active',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  maxClaims: 50,
  claimedCount: 3,
  redeemedCount: 1,
  views: 10,
  likesCount: 2,
};

describe('decimal helpers', () => {
  it('turn numeric strings and numbers into numbers', () => {
    expect(decimal().parse('8000.00')).toBe(8000);
    expect(decimal().parse(' 12.5 ')).toBe(12.5);
    expect(decimal().parse(42)).toBe(42);
  });

  it('keep null as null and absent as absent, never 0', () => {
    const schema = z.object({ price: nullableDecimal() });
    expect(schema.parse({ price: null }).price).toBeNull();
    expect(schema.parse({}).price).toBeUndefined();
  });

  it('reject strings that are not numbers', () => {
    expect(decimal().safeParse('').success).toBe(false);
    expect(decimal().safeParse('free').success).toBe(false);
    expect(nullableDecimal().safeParse('n/a').success).toBe(false);
  });
});

describe('response schemas that read decimal columns', () => {
  it('parse the Business hub admin offers list with string prices', () => {
    const parsed = businessOffersAdminSchema.parse([adminOfferRow]);
    expect(parsed[0]).toMatchObject({
      discountValue: 20,
      fixedPrice: null,
      calculatedPrice: 8000,
    });
  });

  it('parse the enveloped admin offers shape too', () => {
    const parsed = businessOffersAdminSchema.parse({ data: [adminOfferRow] });
    expect(parsed[0].calculatedPrice).toBe(8000);
  });

  it('parse claim, gift, engagement and review payloads with string decimals', () => {
    expect(myClaimOfferSchema.shape.calculatedPrice.parse('6500.00')).toBe(6500);
    expect(myClaimOfferSchema.shape.originalPrice.parse('8000.00')).toBe(8000);
    expect(myGiftOfferSchema.shape.calculatedPrice.parse('6500.00')).toBe(6500);
    expect(dealEngagementSchema.parse({ averageRating: '4.50' }).averageRating).toBe(4.5);
    expect(reviewsSummarySchema.parse({ averageRating: '4.20' }).averageRating).toBe(4.2);
  });
});
