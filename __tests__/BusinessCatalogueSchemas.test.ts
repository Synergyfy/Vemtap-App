import {
  businessBranchSchema,
  businessCatalogueFeedSchema,
  businessCatalogueItemSchema,
  catalogueItemSchema,
} from '@api/catalogueApi';
import publicItems from './fixtures/catalogue-items.json';

/**
 * `GET /catalogue/items` and `GET /branches` are bearer-secured and the OpenAPI
 * document documents no response body for either, so these are modelled rather
 * than captured: the item schema is widened from the live-verified public item,
 * and the branch schema takes only id/name as required. These tests pin the
 * behaviour we intend; they are not proof of the live contract, which still
 * needs checking with a business-owner token.
 */

test('the owner catalogue keeps non-active statuses visible', () => {
  for (const status of ['active', 'draft', 'suspended', 'inactive']) {
    const parsed = businessCatalogueItemSchema.safeParse({
      id: 'i1',
      name: 'Item',
      status,
      itemType: 'product',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.status).toBe(status);
  }
});

test('the owner catalogue carries the fields the public list omits', () => {
  const parsed = businessCatalogueItemSchema.safeParse({
    id: 'i1',
    name: 'Item',
    status: 'draft',
    itemType: 'product',
    createdAt: '2026-08-31T09:49:09.716Z',
    updatedAt: '2026-08-31T09:49:09.716Z',
    deletedAt: null,
    costPrice: 500,
    minStock: 2,
    barcode: null,
    suspensionNote: null,
    loyaltyPointsValue: null,
    enableLoyaltyPoints: false,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.costPrice).toBe(500);
  expect(parsed.data.enableLoyaltyPoints).toBe(false);
});

test('the public item schema remains a subset the owner schema can parse', () => {
  const publicItem = (publicItems as { data: unknown[] }).data[0];
  expect(businessCatalogueItemSchema.safeParse(publicItem).success).toBe(true);
  expect(catalogueItemSchema.safeParse(publicItem).success).toBe(true);
});

test('the owner catalogue parses a page envelope', () => {
  const parsed = businessCatalogueFeedSchema.safeParse({
    data: [{ id: 'i1', name: 'Item', status: 'draft', itemType: 'product' }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.data[0].status).toBe('draft');
});

test('a branch needs only an id and a name', () => {
  expect(businessBranchSchema.safeParse({ id: 'b1', name: 'Main Branch' }).success).toBe(
    true,
  );
});

test('a branch without an id or name is rejected', () => {
  expect(businessBranchSchema.safeParse({ name: 'No id' }).success).toBe(false);
  expect(businessBranchSchema.safeParse({ id: 'b1' }).success).toBe(false);
});

test('branch read fields tolerate nulls', () => {
  const parsed = businessBranchSchema.safeParse({
    id: 'b1',
    name: 'Wuse Branch',
    username: null,
    address: null,
    latitude: null,
    longitude: null,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.latitude).toBeNull();
});
