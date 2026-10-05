import type { Category } from '@api/categoriesApi';
import {
  UnresolvableCategoryError,
  mapDraftToOwnerRegistration,
  type BusinessProfileDraft,
} from '@features/business/utils/ownerRegistrationMapper';

/** Real seeded categories, as captured from `GET /categories`. */
const CATEGORIES: Category[] = [
  {
    id: 'cat-food',
    name: 'Food & Hospitality',
    description: null,
    subcategories: [
      {
        id: 'sub-bistro',
        name: 'Bistro & Cafe',
        description: null,
        categoryId: 'cat-food',
      },
      {
        id: 'sub-grill',
        name: 'Grill & Steakhouse',
        description: null,
        categoryId: 'cat-food',
      },
      { id: 'sub-fast', name: 'Fast Casual', description: null, categoryId: 'cat-food' },
    ],
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    description: null,
    subcategories: [],
  },
];

/** Names exactly as the API ships them, trailing space included. */
const PADDED: Category[] = [
  { id: 'cat-agri', name: 'Agriculture ', description: null, subcategories: [] },
];

const draft = (over: Partial<BusinessProfileDraft> = {}): BusinessProfileDraft => ({
  basic: {
    name: 'Urban Grill & Bistro',
    category: 'Food & Hospitality',
    specialties: ['Grill & Steakhouse', 'Bistro & Cafe'],
    description: 'Wood-fired steaks and burgers.',
  },
  branding: {
    logoUrl: 'https://cdn.example/logo.png',
    specialtyNames: ['Bistro & Cafe'],
  },
  contact: {
    email: 'hello@urbangrill.ng',
    whatsappNumber: '08011112222',
    website: 'https://urbangrill.ng',
    socials: { instagram: 'https://instagram.com/urbangrill', linkedin: '' },
  },
  location: {
    address: '12 Aminu Kano Cres',
    state: 'Federal Capital Territory',
    city: 'Abuja',
    latitude: 9.0567,
    longitude: 7.4969,
  },
  ...over,
});

describe('mapping the profile draft to register/owner', () => {
  it('maps business identity, contact and location onto the DTO', () => {
    const { payload } = mapDraftToOwnerRegistration(draft(), CATEGORIES);

    expect(payload.businessName).toBe('Urban Grill & Bistro');
    expect(payload.businessAddress).toBe('12 Aminu Kano Cres');
    expect(payload.state).toBe('Federal Capital Territory');
    expect(payload.city).toBe('Abuja');
    expect(payload.latitude).toBeCloseTo(9.0567);
    expect(payload.officialEmail).toBe('hello@urbangrill.ng');
    expect(payload.whatsappNumber).toBe('08011112222');
    expect(payload.businessWebsite).toBe('https://urbangrill.ng');
    expect(payload.businessLogo).toBe('https://cdn.example/logo.png');
  });

  it('resolves the category name to a real id, never a made-up one', () => {
    const { payload } = mapDraftToOwnerRegistration(draft(), CATEGORIES);

    expect(payload.categoryId).toBe('cat-food');
  });

  it('resolves the first specialty to a subcategory id', () => {
    const { payload } = mapDraftToOwnerRegistration(draft(), CATEGORIES);

    expect(payload.subcategoryId).toBe('sub-bistro');
  });

  it('refuses a fictional category instead of sending a fabricated uuid', () => {
    const bad = draft();
    bad.basic.category = 'Restaurant & Dining';

    expect(() => mapDraftToOwnerRegistration(bad, CATEGORIES)).toThrow(
      UnresolvableCategoryError,
    );
  });

  it('lists the real names when it refuses, so the fix is obvious', () => {
    const bad = draft();
    bad.basic.category = 'Spa & Wellness';

    try {
      mapDraftToOwnerRegistration(bad, CATEGORIES);
      throw new Error('expected a throw');
    } catch (error) {
      expect(error).toBeInstanceOf(UnresolvableCategoryError);
      const typed = error as UnresolvableCategoryError;
      expect(typed.available).toContain('Food & Hospitality');
    }
  });

  it('matches names ignoring case and the API trailing whitespace', () => {
    const { payload } = mapDraftToOwnerRegistration(
      draft({ basic: { ...draft().basic, category: '  food & hospitality ' } }),
      PADDED.concat(CATEGORIES),
    );

    expect(payload.categoryId).toBe('cat-food');
  });

  it('defers description because register/owner has no field for it', () => {
    const { payload, deferred } = mapDraftToOwnerRegistration(draft(), CATEGORIES);

    expect(payload).not.toHaveProperty('description');
    expect(deferred.description).toBe('Wood-fired steaks and burgers.');
  });

  it('drops empty socials rather than sending blank strings', () => {
    const { payload } = mapDraftToOwnerRegistration(draft(), CATEGORIES);

    expect(payload.engagement).toEqual({ instagram: 'https://instagram.com/urbangrill' });
  });

  it('omits engagement entirely when nothing was provided', () => {
    const base = draft();
    const { payload } = mapDraftToOwnerRegistration(
      { ...base, contact: { ...base.contact, socials: { instagram: '' } } },
      CATEGORIES,
    );

    expect(payload).not.toHaveProperty('engagement');
  });

  it('omits absent optional fields instead of sending empty values', () => {
    const base = draft();
    const { payload } = mapDraftToOwnerRegistration(
      { ...base, branding: {}, contact: { email: 'a@b.ng' } },
      CATEGORIES,
    );

    expect(payload).not.toHaveProperty('businessLogo');
    expect(payload).not.toHaveProperty('businessWebsite');
    expect(payload).not.toHaveProperty('whatsappNumber');
    expect(payload).not.toHaveProperty('subcategoryId');
    // Required-by-us location fields survive.
    expect(payload.city).toBe('Abuja');
  });

  it('reports which drafted specialties have no real subcategory', () => {
    const base = draft();
    base.basic.specialties = ['Fast Casual', 'Bubble Tea Bar'];

    const { unresolved } = mapDraftToOwnerRegistration(base, CATEGORIES);

    expect(unresolved.specialties).toEqual(['Fast Casual']);
  });
});
