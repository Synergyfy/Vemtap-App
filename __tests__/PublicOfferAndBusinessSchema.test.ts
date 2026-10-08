import { publicOfferDetailSchema, type PublicOfferDetail } from '@api/dealsApi';
import { publicBusinessDetailSchema } from '@api/publicBusinessApi';

/**
 * The public single-offer and public-business payloads.
 *
 * Both endpoints are public and anonymous, so what the schema *drops* matters as
 * much as what it keeps — the live business payload includes `owner`, `balance`
 * and `posSettings`, and none of them should ever enter app state.
 */

const DETAIL = {
  id: 'aa90831c-4837-4fdd-bbc4-4445ba041284',
  name: 'Soft Drinks Special Offer',
  status: 'active',
  pricingType: 'fixed_discount_amount',
  /** Strings here, where the feed sends numbers. */
  calculatedPrice: '200.00',
  dealPrice: '200.00',
  originalPrice: 1000,
  discountValue: '800.00',
  fixedPrice: null,
  discountPercent: 80,
  business: {
    id: 'c94b445a-78f6-4d0d-a86c-f22c74afa109',
    name: 'Test store',
    /** The branch code — a trap; the profile link must not use this. */
    slug: '8GUF52339',
    /** The key for GET /public/businesses/code/:code. */
    uniqueCode: 'QFN2OX8BJ',
    latitude: 9.0567,
    longitude: 7.4969,
    isVerified: false,
  },
  items: [],
  terms: [],
};

describe('publicOfferDetailSchema', () => {
  test('accepts money as either a string or a number', () => {
    const parsed = publicOfferDetailSchema.safeParse(DETAIL);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.calculatedPrice).toBe('200.00');
    expect(parsed.data.originalPrice).toBe(1000);
  });

  test('tolerates the many null columns the DTO allows', () => {
    const parsed = publicOfferDetailSchema.safeParse({
      ...DETAIL,
      description: null,
      longDescription: null,
      mainImage: null,
      endDate: null,
      averageRating: null,
      business: null,
      items: null,
      terms: null,
      isFeatured: null,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.items).toEqual([]);
    expect(parsed.data.isFeatured).toBe(false);
    expect(parsed.data.averageRating).toBeNull();
  });

  test('keeps the business uniqueCode that links to the merchant profile', () => {
    const parsed = publicOfferDetailSchema.parse(DETAIL) as PublicOfferDetail;

    // `slug` is the branch code; only `uniqueCode` resolves the profile.
    expect(parsed.business?.uniqueCode).toBe('QFN2OX8BJ');
    expect(parsed.business?.slug).toBe('8GUF52339');
  });

  test('requires an id, a name and a status', () => {
    const { id: _id, ...withoutId } = DETAIL;
    expect(publicOfferDetailSchema.safeParse(withoutId).success).toBe(false);

    const { name: _name, ...withoutName } = DETAIL;
    expect(publicOfferDetailSchema.safeParse(withoutName).success).toBe(false);

    const { status: _status, ...withoutStatus } = DETAIL;
    expect(publicOfferDetailSchema.safeParse(withoutStatus).success).toBe(false);
  });
});

describe('publicBusinessDetailSchema', () => {
  const BUSINESS = {
    id: 'c94b445a-78f6-4d0d-a86c-f22c74afa109',
    uniqueCode: 'QFN2OX8BJ',
    name: 'Test store',
    logoUrl: null,
    address: 'Nigeria, Abuja, AMAC, Dei-dei, Abuja',
    city: 'Abuja',
    state: 'Federal Capital Territory',
    latitude: 9.0567,
    longitude: 7.4969,
    isVerified: false,
    verifiedAt: null,
    category: { id: 'aa310aad', name: 'Technology & Digital Services' },
    openingHours: { monday: { from: '09:00', to: '18:00', isClosed: false } },
    branches: [],
  };

  test('keeps the fields a consumer profile renders', () => {
    const parsed = publicBusinessDetailSchema.safeParse(BUSINESS);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.uniqueCode).toBe('QFN2OX8BJ');
    expect(parsed.data.category?.name).toBe('Technology & Digital Services');
    expect(parsed.data.openingHours?.monday?.from).toBe('09:00');
    expect(parsed.data.isVerified).toBe(false);
  });

  /**
   * The reason this schema is hand-written rather than a pass-through: the
   * live public payload also carries the owner's details and the account
   * balance, and none of that belongs in a consumer's app state.
   */
  test('drops owner, balance and settings the endpoint does return', () => {
    const parsed = publicBusinessDetailSchema.parse({
      ...BUSINESS,
      balance: '0.00',
      officialEmail: 'synergyfyglobal@gmail.com',
      owner: { id: 'owner-1', email: 'owner@example.com' },
      posSettings: { currency: 'NGN' },
      documents: ['passport.pdf'],
    });

    expect(parsed).not.toHaveProperty('owner');
    expect(parsed).not.toHaveProperty('balance');
    expect(parsed).not.toHaveProperty('officialEmail');
    expect(parsed).not.toHaveProperty('posSettings');
    expect(parsed).not.toHaveProperty('documents');
  });

  test('treats a missing verification flag as unverified, not verified', () => {
    const { isVerified: _isVerified, ...withoutFlag } = BUSINESS;
    const parsed = publicBusinessDetailSchema.parse(withoutFlag);

    expect(parsed.isVerified).toBe(false);
  });

  test('requires the code it is keyed by', () => {
    const { uniqueCode: _uniqueCode, ...withoutCode } = BUSINESS;
    expect(publicBusinessDetailSchema.safeParse(withoutCode).success).toBe(false);
  });
});
