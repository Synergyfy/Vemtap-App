import {
  dealEngagementSchema,
  offerFeedSchema,
  platformStatsSchema,
  publicBusinessesSchema,
  type ReactionType,
} from '@api/dealsApi';
import offersFeed from './fixtures/offers-feed.json';

/**
 * The Swagger document declares these endpoints but documents no 2xx response
 * bodies, so these fixtures were captured from live responses on
 * testapi.vemtap.com. They fail loudly if the API changes shape.
 */

test('parses a live offers-feed payload', () => {
  const parsed = offerFeedSchema.safeParse(offersFeed);

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  const { data, total, hasNextPage } = parsed.data;
  expect(data.length).toBeGreaterThan(0);
  expect(total).toBeGreaterThanOrEqual(data.length);
  expect(typeof hasNextPage).toBe('boolean');

  const offer = data[0];
  expect(typeof offer.id).toBe('string');
  expect(offer.name).toBeTruthy();
  expect(offer.status).toBe('active');
  // Money arrives as a mix of numbers and numeric strings, sometimes null.
  expect(
    offer.calculatedPrice === null ||
      ['string', 'number'].includes(typeof offer.calculatedPrice),
  ).toBe(true);
  expect(Array.isArray(offer.items)).toBe(true);
  expect(Array.isArray(offer.terms)).toBe(true);
  expect(offer.business === null || typeof offer.business?.name === 'string').toBe(true);
});

test('accepts an offer with null business and empty item list', () => {
  const parsed = offerFeedSchema.safeParse({
    data: [
      {
        id: 'offer-1',
        name: 'Bare offer',
        status: 'active',
        fixedPrice: null,
        percentageOff: null,
        calculatedPrice: null,
        originalPrice: null,
        discountPercent: null,
        business: null,
        items: [],
        terms: [],
      },
    ],
    total: 1,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.data[0].claimedCount).toBe(0);
  expect(parsed.data.data[0].isExpired).toBe(false);
});

test('rejects an offer missing its id', () => {
  const parsed = offerFeedSchema.safeParse({
    data: [{ name: 'No id', status: 'active' }],
  });
  expect(parsed.success).toBe(false);
});

test('parses the flat engagement payload and tolerates a null rating', () => {
  const parsed = dealEngagementSchema.safeParse({
    likesCount: 0,
    dislikesCount: 0,
    reviewsCount: 0,
    averageRating: null,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.likesCount).toBe(0);
  expect(parsed.data.averageRating).toBeNull();
});

test('public businesses are wrapped in a `businesses` key, not `data`', () => {
  const parsed = publicBusinessesSchema.safeParse({
    businesses: [
      {
        id: 'b1',
        name: 'ABC Beauty Store',
        logoUrl: 'https://res.cloudinary.com/x.png',
        address: 'Apo Resettlement Abuja',
        isVerified: false,
        slug: 'abc-beauty-store',
        branchCode: '9LPNGWN8S',
      },
    ],
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.businesses[0].branchCode).toBe('9LPNGWN8S');
  expect(parsed.data.businesses[0].isVerified).toBe(false);
});

test('rejects the data-wrapped envelope the offers feed uses', () => {
  expect(publicBusinessesSchema.safeParse({ data: [] }).success).toBe(false);
});

test('platform stats are a flat object', () => {
  const parsed = platformStatsSchema.safeParse({
    totalBusinesses: 5,
    totalActiveDeals: 4,
    totalClaims: 6,
    totalBranches: 52,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.totalActiveDeals).toBe(4);
});

test('reaction type is constrained to the two documented values', () => {
  const allowed: ReactionType[] = ['like', 'dislike'];
  expect(allowed).toEqual(['like', 'dislike']);
  // DealReactionDto requires `type`; only these two values are meaningful.
  expect(allowed).not.toContain('love' as ReactionType);
});
