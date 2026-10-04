import { businessBranchSchema } from '@api/catalogueApi';
import {
  businessProfileSchema,
  profileBranchSchema,
  publicBusinessListSchema,
} from '@api/businessProfileApi';
import profile from './fixtures/business-profile.json';

/** Fixture captured from a live GET /public/businesses/code response. */

test('parses a live business profile payload', () => {
  const parsed = businessProfileSchema.safeParse(profile);

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  expect(parsed.data.uniqueCode).toHaveLength(9);
  expect(parsed.data.name).toBeTruthy();
  expect(parsed.data.status).toBe('active');
  expect(parsed.data.isRegistered).toBe(true);
});

test('carries the fields a consumer profile needs', () => {
  const parsed = businessProfileSchema.safeParse(profile);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  const { data } = parsed;
  expect(data.address).toBeTruthy();
  expect(data.city).toBe('Abuja');
  expect(typeof data.latitude).toBe('number');
  expect(typeof data.longitude).toBe('number');
  expect(data.category?.name).toBeTruthy();
  expect(data.timezone).toBe('Africa/Lagos');
  // Defaults applied where the API omits or nulls the flag.
  expect(typeof data.isVerified).toBe('boolean');
  expect(typeof data.isVisible).toBe('boolean');
});

test('opening hours parse per day, with isClosed respected', () => {
  const parsed = businessProfileSchema.safeParse(profile);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  const monday = parsed.data.openingHours?.monday;
  expect(monday?.isClosed).toBe(false);
  expect(monday?.from).toBe('09:00');
  expect(monday?.to).toBe('18:00');
});

test('branches expose their own code and main-branch flag', () => {
  const parsed = businessProfileSchema.safeParse(profile);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  const branch = parsed.data.branches[0];
  expect(branch.name).toBeTruthy();
  // The branch code is distinct from the business uniqueCode.
  expect(branch.uniqueCode).not.toBe(parsed.data.uniqueCode);
  expect(typeof branch.isMainBranch).toBe('boolean');
});

test('branches and rewards default to empty arrays', () => {
  const parsed = businessProfileSchema.safeParse({
    id: 'b1',
    uniqueCode: 'ABCD12345',
    name: 'Minimal',
    status: 'active',
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.branches).toEqual([]);
  expect(parsed.data.rewards).toEqual([]);
  expect(parsed.data.isVerified).toBe(false);
});

test('rejects a profile missing its code or status', () => {
  expect(
    businessProfileSchema.safeParse({ id: 'b1', name: 'x', status: 'active' }).success,
  ).toBe(false);
  expect(
    businessProfileSchema.safeParse({ id: 'b1', uniqueCode: 'ABCD12345', name: 'x' })
      .success,
  ).toBe(false);
});

test('the business list is wrapped in `businesses`, not `data`', () => {
  const parsed = publicBusinessListSchema.safeParse({
    businesses: [
      {
        id: 'b1',
        name: 'ABC Beauty Store',
        isVerified: false,
        slug: 'abc-beauty-store',
        branchCode: '9LPNGWN8S',
      },
    ],
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  // slug is a URL slug; branchCode is the 9-character code, not the uniqueCode.
  expect(parsed.data.businesses[0].slug).toBe('abc-beauty-store');
  expect(parsed.data.businesses[0].branchCode).toHaveLength(9);
  expect(publicBusinessListSchema.safeParse({ data: [] }).success).toBe(false);
});

/**
 * Cross-check: `businessBranchSchema` was modelled by hand because
 * GET /branches is bearer-secured and undocumented. The public profile embeds the
 * same branch entity, so the live payload validates as much of that model as the
 * public API can confirm. Fields only GET /branches returns are still unproven.
 */
test('the hand-modelled branch schema parses a live branch payload', () => {
  const live = (profile as { branches: unknown[] }).branches[0];

  expect(profileBranchSchema.safeParse(live).success).toBe(true);
  expect(businessBranchSchema.safeParse(live).success).toBe(true);
});
