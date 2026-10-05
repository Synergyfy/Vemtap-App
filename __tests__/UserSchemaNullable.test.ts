import { z } from 'zod';
import { sessionSchema, userSchema } from '@api/authApi';
import { nullableFlag } from '@api/schemaHelpers';
import { dealEngagementSchema, offerFeedSchema, offerSchema } from '@api/dealsApi';
import { businessProfileSchema } from '@api/businessProfileApi';
import { catalogueItemFeedSchema } from '@api/catalogueApi';
import { categorySchema } from '@api/categoriesApi';
import offersFeed from './fixtures/offers-feed.json';
import profile from './fixtures/business-profile.json';
import catalogueItems from './fixtures/catalogue-items.json';
import categories from './fixtures/categories.json';

/**
 * Regression coverage for the login failure where the API returned 200 with a
 * valid session but every nullable `User` column came back as an explicit
 * `null`, and `userSchema` rejected the whole response:
 *
 *   Response schema mismatch {"fieldErrors": {"user": [
 *     "Invalid input: expected string, received null",  x7
 *     "Invalid input: expected array, received null"  x2
 *   ]}}
 *
 * The shape below is the reported payload: required columns present, the
 * nullable ones null. Nine rejections, matching the report exactly.
 */
const LOGGED_IN_USER = {
  id: '4a1f0c9e-2b7d-4e51-9f3a-6c8d2e5b1a74',
  createdAt: '2026-09-01T08:12:00.000Z',
  updatedAt: '2026-10-05T12:00:00.000Z',
  email: 'customer@vemtap-test.dev',
  firstName: 'Ada',
  lastName: 'Nwosu',
  role: 'Customer',
  status: 'Active',
  authProvider: 'LOCAL',

  // The nine fields the API sent as null.
  roleTag: null,
  uniqueCode: null,
  referralCode: null,
  avatar: null,
  phone: null,
  jobTitle: null,
  googleId: null,
  permissions: null,
  optInChannels: null,

  businessId: null,
  branchId: null,
  lastActive: null,
  twoFactorSecret: null,
  isPasswordChanged: false,
  twoFactorEnabled: false,
  optOut: false,
  emailVerified: true,
};

test('a user with every nullable column null parses', () => {
  const parsed = userSchema.safeParse(LOGGED_IN_USER);

  expect(parsed.success).toBe(true);
  if (!parsed.success) {
    expect(parsed.error.flatten().fieldErrors).toEqual({});
    return;
  }

  // Coerced to usable values rather than rejected or left null.
  expect(parsed.data.roleTag).toBe('');
  expect(parsed.data.phone).toBe('');
  expect(parsed.data.uniqueCode).toBe('');
  expect(parsed.data.permissions).toEqual([]);
  expect(parsed.data.optInChannels).toEqual([]);
});

test('the required columns survive untouched', () => {
  const parsed = userSchema.safeParse(LOGGED_IN_USER);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  expect(parsed.data.email).toBe('customer@vemtap-test.dev');
  expect(parsed.data.firstName).toBe('Ada');
  expect(parsed.data.role).toBe('Customer');
});

test('the whole session parses, which is what login needs', () => {
  const parsed = sessionSchema.safeParse({
    access_token: 'jwt-token',
    user: LOGGED_IN_USER,
    isNewUser: false,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    return;
  }
  expect(parsed.data.access_token).toBe('jwt-token');
});

test('absent optional keys behave the same as null ones', () => {
  const {
    roleTag: _roleTag,
    permissions: _permissions,
    ...withoutOptionals
  } = LOGGED_IN_USER;

  const parsed = userSchema.safeParse(withoutOptionals);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  expect(parsed.data.roleTag).toBe('');
  expect(parsed.data.permissions).toEqual([]);
});

test('genuinely required columns are still enforced', () => {
  // The fix must not turn the schema into something that accepts anything: a
  // user with no email is still a contract break worth failing on.
  const { email: _email, ...withoutEmail } = LOGGED_IN_USER;
  expect(userSchema.safeParse(withoutEmail).success).toBe(false);
});

test('a real value is preferred over the fallback', () => {
  const parsed = userSchema.safeParse({
    ...LOGGED_IN_USER,
    phone: '+2348012345678',
    permissions: ['manage_staff'],
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.phone).toBe('+2348012345678');
  expect(parsed.data.permissions).toEqual(['manage_staff']);
});

/**
 * The same trap existed in the other response schemas: `.default(false)` on a
 * boolean rejects an explicit `null`, so an API that nils a nullable flag would
 * fail the whole payload. These assert the nullable-flag helpers cover it, and
 * that the real captured fixtures still parse unchanged.
 */
describe('nullable helpers across the response schemas', () => {
  test('nullableFlag accepts null and absent, and keeps a real boolean', () => {
    const schema = z.object({
      a: nullableFlag(false),
      b: nullableFlag(true),
      c: nullableFlag(false),
    });

    const parsed = schema.safeParse({ a: null, b: null, c: true });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.a).toBe(false);
    expect(parsed.data.b).toBe(true);
    expect(parsed.data.c).toBe(true);

    const absent = schema.safeParse({});
    expect(absent.success).toBe(true);
    if (!absent.success) return;
    expect(absent.data.b).toBe(true);
  });

  test('the captured offers fixture still parses', () => {
    expect(offerFeedSchema.safeParse(offersFeed).success).toBe(true);
  });

  test('the captured business profile fixture still parses', () => {
    expect(businessProfileSchema.safeParse(profile).success).toBe(true);
  });

  test('the captured catalogue fixtures still parse', () => {
    expect(catalogueItemFeedSchema.safeParse(catalogueItems).success).toBe(true);
  });
});

/**
 * The array/count version of the same bug: `z.array(x).default([])` and
 * `.nullish().default([])` both accept an explicit null but let it through, so
 * screens would receive `null` where they expect a list. Asserted against the
 * real feed/profile/category schemas rather than toy objects.
 */
describe('null arrays and counts', () => {
  test('a deal with null items, terms and counts parses to empty values', () => {
    const parsed = offerSchema.safeParse({
      ...offersFeed.data[0],
      items: null,
      terms: null,
      claimedCount: null,
      isExpired: null,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.items).toEqual([]);
    expect(parsed.data.terms).toEqual([]);
    expect(parsed.data.claimedCount).toBe(0);
    expect(parsed.data.isExpired).toBe(false);

    // The reaction counters live on their own schema.
    const engagement = dealEngagementSchema.safeParse({
      likesCount: null,
      dislikesCount: null,
      reviewsCount: null,
    });
    expect(engagement.success).toBe(true);
    if (!engagement.success) return;
    expect(engagement.data.likesCount).toBe(0);
    expect(engagement.data.reviewsCount).toBe(0);
  });

  test('a feed whose envelope fields are null still parses', () => {
    const parsed = offerFeedSchema.safeParse({
      ...offersFeed,
      data: offersFeed.data.map(item => ({ ...item, items: null })),
      hasNextPage: null,
      claimedCount: null,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.data[0].items).toEqual([]);
    expect(parsed.data.hasNextPage).toBe(false);
  });

  test('a business profile with null branches and rewards still parses', () => {
    const parsed = businessProfileSchema.safeParse({
      ...profile,
      branches: null,
      rewards: null,
      isVisible: null,
      isClosed: null,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.branches).toEqual([]);
    expect(parsed.data.rewards).toEqual([]);
    expect(parsed.data.isVisible).toBe(true);
  });

  test('a category with null subcategories still parses', () => {
    const parsed = categorySchema.safeParse({
      ...categories.items[0],
      subcategories: null,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.subcategories).toEqual([]);
  });
});
