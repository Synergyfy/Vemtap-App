import type { Offer } from '@api/dealsApi';
import {
  applyDealsFilters,
  matchesAvailability,
  offerPrice,
  type DealsFilterCriteria,
} from '@features/deals/utils/dealsFilter';

/**
 * The filter page's Apply used to only close the screen — every selection lived
 * in local state and never reached the feed. These tests pin the predicate that
 * now runs inside `usePublicOffersFeed`, including the cases where an offer is
 * kept rather than silently dropped.
 */

/** A Tuesday in October 2026, so "ending soon" arithmetic is unambiguous. */
const NOW = Date.parse('2026-10-06T12:00:00.000Z');

const NO_FILTERS: DealsFilterCriteria = {
  categoryNames: [],
  minPrice: null,
  maxPrice: null,
  minDiscountPercent: null,
  availability: [],
};

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: 'offer-1',
    name: 'Deal',
    description: null,
    pricingType: 'percentage',
    fixedPrice: null,
    percentageOff: 20,
    calculatedPrice: '1000.00',
    originalPrice: '2000.00',
    discountPercent: 20,
    status: 'active',
    branchId: null,
    branchName: null,
    categoryName: 'Food & Hospitality',
    business: null,
    items: [],
    claimedCount: 0,
    totalLimit: null,
    remainingLimit: null,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-01-01T00:00:00.000Z',
    isExpired: false,
    maxClaimsPerCustomer: null,
    audienceTarget: null,
    terms: [],
    claimCodePrefix: null,
    ...overrides,
  } as Offer;
}

const ids = (offers: Offer[]) => offers.map(offer => offer.id);

describe('applyDealsFilters', () => {
  it('passes everything through when no filter is set', () => {
    const offers = [makeOffer({ id: 'a' }), makeOffer({ id: 'b' })];

    expect(ids(applyDealsFilters(offers, NO_FILTERS, NOW))).toEqual(['a', 'b']);
  });

  it('keeps the whole feed when a filter dimension is empty', () => {
    const offers = [makeOffer({ id: 'a' })];

    expect(
      ids(applyDealsFilters(offers, { ...NO_FILTERS, categoryNames: [] }, NOW)),
    ).toEqual(['a']);
    expect(
      ids(applyDealsFilters(offers, { ...NO_FILTERS, availability: [] }, NOW)),
    ).toEqual(['a']);
  });

  describe('category', () => {
    it('matches an offer by its category name', () => {
      const offers = [
        makeOffer({ id: 'food', categoryName: 'Food & Hospitality' }),
        makeOffer({ id: 'tech', categoryName: 'Technology & Digital Services' }),
      ];

      expect(
        ids(
          applyDealsFilters(
            offers,
            { ...NO_FILTERS, categoryNames: ['Food & Hospitality'] },
            NOW,
          ),
        ),
      ).toEqual(['food']);
    });

    it('tolerates whitespace on both sides of the comparison', () => {
      const offers = [makeOffer({ id: 'a', categoryName: 'Food & Hospitality' })];

      expect(
        ids(
          applyDealsFilters(
            offers,
            { ...NO_FILTERS, categoryNames: ['  Food & Hospitality  '] },
            NOW,
          ),
        ),
      ).toEqual(['a']);
    });

    it('supports multi-select, which the single categoryId parameter cannot', () => {
      const offers = [
        makeOffer({ id: 'food', categoryName: 'Food & Hospitality' }),
        makeOffer({ id: 'tech', categoryName: 'Technology & Digital Services' }),
        makeOffer({ id: 'beauty', categoryName: 'Beauty & Personal Care' }),
      ];

      expect(
        ids(
          applyDealsFilters(
            offers,
            {
              ...NO_FILTERS,
              categoryNames: ['Food & Hospitality', 'Beauty & Personal Care'],
            },
            NOW,
          ),
        ),
      ).toEqual(['food', 'beauty']);
    });

    it('matches nothing when no offer is in the selected categories', () => {
      const offers = [makeOffer({ id: 'a', categoryName: 'Food & Hospitality' })];

      expect(
        ids(
          applyDealsFilters(
            offers,
            { ...NO_FILTERS, categoryNames: ['Automotive'] },
            NOW,
          ),
        ),
      ).toEqual([]);
    });
  });

  describe('price', () => {
    it('applies a minimum and a maximum', () => {
      const offers = [
        makeOffer({ id: 'cheap', calculatedPrice: '500.00' }),
        makeOffer({ id: 'mid', calculatedPrice: '5000.00' }),
        makeOffer({ id: 'dear', calculatedPrice: '50000.00' }),
      ];

      expect(
        ids(
          applyDealsFilters(
            offers,
            { ...NO_FILTERS, minPrice: 1000, maxPrice: 20000 },
            NOW,
          ),
        ),
      ).toEqual(['mid']);
    });

    it('treats the bounds as inclusive', () => {
      const offers = [makeOffer({ id: 'a', calculatedPrice: '1000.00' })];

      expect(
        ids(applyDealsFilters(offers, { ...NO_FILTERS, minPrice: 1000 }, NOW)),
      ).toEqual(['a']);
      expect(
        ids(applyDealsFilters(offers, { ...NO_FILTERS, maxPrice: 1000 }, NOW)),
      ).toEqual(['a']);
    });

    it('keeps an offer whose price cannot be read rather than dropping it', () => {
      const offers = [makeOffer({ id: 'a', calculatedPrice: null })];

      expect(
        ids(applyDealsFilters(offers, { ...NO_FILTERS, minPrice: 100 }, NOW)),
      ).toEqual(['a']);
    });
  });

  describe('discount', () => {
    it('applies a minimum discount', () => {
      const offers = [
        makeOffer({ id: 'ten', discountPercent: 10 }),
        makeOffer({ id: 'fifty', discountPercent: 50 }),
      ];

      expect(
        ids(applyDealsFilters(offers, { ...NO_FILTERS, minDiscountPercent: 20 }, NOW)),
      ).toEqual(['fifty']);
    });

    it('treats an offer with no discount as zero', () => {
      const offers = [makeOffer({ id: 'a', discountPercent: null })];

      expect(
        ids(applyDealsFilters(offers, { ...NO_FILTERS, minDiscountPercent: 1 }, NOW)),
      ).toEqual([]);
    });
  });

  describe('availability', () => {
    it('requires an active, unexpired offer inside its dates for "now"', () => {
      const offers = [
        makeOffer({ id: 'live' }),
        makeOffer({ id: 'expired', isExpired: true }),
        makeOffer({ id: 'inactive', status: 'inactive' }),
        makeOffer({ id: 'future', startDate: '2027-01-01T00:00:00.000Z' }),
        makeOffer({ id: 'past', endDate: '2026-01-01T00:00:00.000Z' }),
      ];

      expect(
        ids(applyDealsFilters(offers, { ...NO_FILTERS, availability: ['now'] }, NOW)),
      ).toEqual(['live']);
    });

    it('matches "ending soon" inside 24 hours, excluding later and past dates', () => {
      const offers = [
        makeOffer({ id: 'tomorrow', endDate: '2026-10-07T11:00:00.000Z' }),
        makeOffer({ id: 'next-week', endDate: '2026-10-13T12:00:00.000Z' }),
        makeOffer({ id: 'gone', endDate: '2026-10-05T12:00:00.000Z' }),
      ];

      expect(
        ids(applyDealsFilters(offers, { ...NO_FILTERS, availability: ['ending'] }, NOW)),
      ).toEqual(['tomorrow']);
    });

    it('does not empty the feed when only an unsupported key is selected', () => {
      const offers = [makeOffer({ id: 'a' })];

      expect(
        ids(
          applyDealsFilters(
            offers,
            { ...NO_FILTERS, availability: ['walkin', 'weekend'] },
            NOW,
          ),
        ),
      ).toEqual(['a']);
    });
  });

  it('combines every dimension', () => {
    const offers = [
      makeOffer({
        id: 'match',
        categoryName: 'Food & Hospitality',
        calculatedPrice: '5000.00',
        discountPercent: 30,
      }),
      makeOffer({
        id: 'wrong-category',
        categoryName: 'Automotive',
        calculatedPrice: '5000.00',
        discountPercent: 30,
      }),
      makeOffer({
        id: 'wrong-price',
        categoryName: 'Food & Hospitality',
        calculatedPrice: '50000.00',
        discountPercent: 30,
      }),
      makeOffer({
        id: 'wrong-discount',
        categoryName: 'Food & Hospitality',
        calculatedPrice: '5000.00',
        discountPercent: 5,
      }),
    ];

    expect(
      ids(
        applyDealsFilters(
          offers,
          {
            categoryNames: ['Food & Hospitality'],
            minPrice: 1000,
            maxPrice: 20000,
            minDiscountPercent: 20,
            availability: [],
          },
          NOW,
        ),
      ),
    ).toEqual(['match']);
  });
});

describe('offerPrice', () => {
  test('reads the string the API sends', () => {
    expect(offerPrice(makeOffer({ calculatedPrice: '200.00' }))).toBe(200);
  });

  test('returns null when the price is absent, not zero', () => {
    // `Number(null)` is 0, so a missing price has to be checked before parsing.
    expect(offerPrice(makeOffer({ calculatedPrice: null }))).toBeNull();
    expect(offerPrice(makeOffer({ calculatedPrice: undefined }))).toBeNull();
  });
});

describe('matchesAvailability', () => {
  test('treats a missing date as unbounded', () => {
    const offer = makeOffer({ id: 'a', startDate: null, endDate: null });

    expect(matchesAvailability(offer, ['now'], NOW)).toBe(true);
  });
});
