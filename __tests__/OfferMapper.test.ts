import type { Offer } from '@api/dealsApi';
import {
  formatDistanceLabel,
  haversineMeters,
  mapOfferToGridItem,
  mapOfferToListItem,
  offerCountdown,
  offerDistanceMeters,
  offerImage,
  priceLabels,
} from '@features/deals/utils/offerMapper';
import { areaCoords } from '@constants/locations';

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: 'offer-1',
    name: 'Soft Drinks Special Offer',
    description: null,
    pricingType: 'fixed_discount_amount',
    fixedPrice: null,
    percentageOff: '800.00',
    calculatedPrice: '200.00',
    originalPrice: 1000,
    discountPercent: 80,
    status: 'active',
    branchId: 'branch-1',
    branchName: 'Synergyfy',
    categoryName: 'Technology & Digital Services',
    business: {
      id: 'business-1',
      name: 'Test store',
      slug: 'QFN2OX8BJ',
      categoryId: null,
      categoryName: null,
      address: 'Nigeria, Abuja',
      city: 'Abuja',
      latitude: 9.0567,
      longitude: 7.4969,
    },
    items: [
      {
        id: 'item-1',
        name: 'Soft Drinks',
        price: 1000,
        mainImage: 'https://res.cloudinary.com/x.png',
      },
    ],
    claimedCount: 0,
    totalLimit: null,
    remainingLimit: null,
    startDate: '2026-09-14T00:00:00.000Z',
    endDate: null,
    isExpired: false,
    maxClaimsPerCustomer: 1,
    audienceTarget: 'all',
    terms: [],
    claimCodePrefix: null,
    ...overrides,
  } as Offer;
}

describe('haversineMeters', () => {
  test('is zero for identical coordinates', () => {
    const apo = areaCoords('Apo');
    expect(haversineMeters(apo, apo)).toBeCloseTo(0, 5);
  });

  test('is symmetric', () => {
    const apo = areaCoords('Apo');
    const jabi = areaCoords('Jabi');
    expect(haversineMeters(apo, jabi)).toBeCloseTo(haversineMeters(jabi, apo), 6);
  });

  test('matches a known Abuja distance within 5%', () => {
    // Apo (9.0765, 7.5186) to Jabi (9.1145, 7.4217) computes to 11.45 km.
    const metres = haversineMeters(areaCoords('Apo'), areaCoords('Jabi'));
    expect(metres / 1000).toBeGreaterThan(11.3);
    expect(metres / 1000).toBeLessThan(11.6);
  });
});

describe('offerDistanceMeters', () => {
  test('measures from the selected district to the business', () => {
    const metres = offerDistanceMeters(makeOffer(), 'Apo');
    expect(metres).not.toBeNull();
    expect(metres!).toBeGreaterThan(1000);
  });

  test('is null when the business has no coordinates', () => {
    const offer = makeOffer({ business: null });
    expect(offerDistanceMeters(offer, 'Apo')).toBeNull();
  });

  test('is smaller for a district the business is actually near', () => {
    const offer = makeOffer();
    // The business sits at Dei-dei, ~1.1 km from Garki and ~3.2 km from Apo.
    const fromGarki = offerDistanceMeters(offer, 'Garki')!;
    const fromApo = offerDistanceMeters(offer, 'Apo')!;
    expect(fromGarki).toBeLessThan(fromApo);
    expect(fromGarki / 1000).toBeCloseTo(1.14, 1);
  });
});

describe('formatDistanceLabel', () => {
  test('renders metres below a kilometre and kilometres above', () => {
    expect(formatDistanceLabel(420)).toBe('420 m away');
    expect(formatDistanceLabel(1540)).toBe('1.5 km away');
  });

  test('renders an empty string when there is no distance', () => {
    expect(formatDistanceLabel(null)).toBe('');
  });
});

describe('offerCountdown', () => {
  const now = Date.parse('2026-10-04T12:00:00.000Z');

  test('counts down days and hours', () => {
    const end = new Date(now + 2 * 86_400_000 + 3 * 3_600_000).toISOString();
    expect(offerCountdown(end, now)).toBe('Ends in 2d 3h');
  });

  test('counts down whole hours', () => {
    const end = new Date(now + 4 * 3_600_000).toISOString();
    expect(offerCountdown(end, now)).toBe('Ends in 4h');
  });

  test('counts down minutes inside the last hour', () => {
    const end = new Date(now + 20 * 60_000).toISOString();
    expect(offerCountdown(end, now)).toBe('Ends in 20m');
  });

  test('returns null once the offer has ended', () => {
    const end = new Date(now - 1000).toISOString();
    expect(offerCountdown(end, now)).toBeNull();
  });

  test('returns null for a missing or unparseable date', () => {
    expect(offerCountdown(null, now)).toBeNull();
    expect(offerCountdown('not-a-date', now)).toBeNull();
  });
});

describe('priceLabels', () => {
  test('formats current, original and savings', () => {
    expect(priceLabels(makeOffer())).toEqual({
      price: '₦200',
      priceWas: '₦1,000',
      save: 'Save ₦800',
    });
  });

  test('omits the struck-through price when there is no discount', () => {
    const labels = priceLabels(
      makeOffer({ calculatedPrice: '1000', originalPrice: 1000 }),
    );
    expect(labels.priceWas).toBe('');
  });

  test('survives entirely absent pricing', () => {
    const labels = priceLabels(
      makeOffer({ calculatedPrice: null, originalPrice: null, percentageOff: null }),
    );
    expect(labels).toEqual({ price: '', priceWas: '', save: '' });
  });

  test('accepts numeric strings for the original price', () => {
    const labels = priceLabels(
      makeOffer({ calculatedPrice: '200.00', originalPrice: '1000.00' }),
    );
    expect(labels.price).toBe('₦200');
  });
});

describe('offerImage', () => {
  test('uses the first item that has an image', () => {
    const offer = makeOffer({
      items: [
        { id: 'a', name: 'No image', price: 1, mainImage: null },
        { id: 'b', name: 'Has image', price: 1, mainImage: 'https://img/b.png' },
      ],
    } as unknown as Offer);
    expect(offerImage(offer)).toBe('https://img/b.png');
  });

  test('falls back to a placeholder when no item has an image', () => {
    expect(offerImage(makeOffer({ items: [] }))).toMatch(/^data:image\/png/);
  });
});

describe('mapping', () => {
  test('list item carries the discount, countdown, distance and engagement', () => {
    const end = new Date(Date.now() + 5 * 3_600_000).toISOString();
    const item = mapOfferToListItem(makeOffer({ endDate: end }), 'Apo', {
      likesCount: 12,
      reviewsCount: 3,
    });

    expect(item.id).toBe('offer-1');
    expect(item.leftBadge).toEqual({ label: '80% OFF', tone: 'discount' });
    expect(item.rightBadge).toEqual({ kind: 'timer', label: 'Ends in 5h' });
    expect(item.merchant).toBe('Test store • Abuja');
    expect(item.title).toBe('Soft Drinks Special Offer');
    expect(item.location).toMatch(/km away$/);
    expect(item.likes).toBe(12);
    expect(item.comments).toBe(3);
    expect(item.statusIcon).toBe('hot');
  });

  test('list item defaults engagement to zero before it loads', () => {
    const item = mapOfferToListItem(makeOffer(), 'Apo');
    expect(item.likes).toBe(0);
    expect(item.comments).toBe(0);
  });

  test('an expired offer reads as expired', () => {
    const item = mapOfferToListItem(makeOffer({ isExpired: true }), 'Apo');
    expect(item.meta).toBe('Expired');
  });

  test('an offer with no end date shows an availability line, not a timer', () => {
    const item = mapOfferToListItem(makeOffer(), 'Apo');
    expect(item.meta).toBe('Available now');
    expect(item.rightBadge.kind).toBe('text');
  });

  test('a modest discount is not marked hot', () => {
    const item = mapOfferToListItem(makeOffer({ discountPercent: 10 }), 'Apo');
    expect(item.statusIcon).toBe('none');
  });

  test('grid item exposes distance rather than a location line', () => {
    const item = mapOfferToGridItem(makeOffer(), 'Apo');
    expect(item.distance).toMatch(/away$/);
  });

  test('an offer with no business falls back to the branch name', () => {
    const item = mapOfferToListItem(makeOffer({ business: null }), 'Apo');
    expect(item.merchant).toBe('Synergyfy');
    expect(item.location).toBe('');
  });
});
