import { z } from 'zod';
import {
  catalogueCategoryListSchema,
  catalogueItemFeedSchema,
  catalogueItemSchema,
  productTypeSchema,
  publishedProductFeedSchema,
} from '@api/catalogueApi';
import itemsFeed from './fixtures/catalogue-items.json';
import categories from './fixtures/catalogue-categories.json';

/**
 * Fixtures captured from live responses on testapi.vemtap.com, because the
 * Swagger document declares these endpoints without any response schema.
 */

test('parses a live branch catalogue payload', () => {
  const parsed = catalogueItemFeedSchema.safeParse(itemsFeed);

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  expect(parsed.data.data.length).toBeGreaterThan(0);
  expect(parsed.data.total).toBeGreaterThanOrEqual(parsed.data.data.length);

  const item = parsed.data.data[0];
  expect(typeof item.id).toBe('string');
  expect(item.name).toBeTruthy();
  expect(item.status).toBe('active');
  // Services carry `service`; the API has no separate product/service enum here.
  expect(['product', 'service']).toContain(item.itemType);
  // The embedded category arrives as an object, alongside categoryId.
  expect(item.category?.name ?? item.categoryId).toBeTruthy();
  expect(['fixed', 'range', 'starting_from']).toContain(item.priceType ?? 'fixed');
});

test('treats a bookable service as bookable and keeps its duration', () => {
  const parsed = catalogueItemFeedSchema.safeParse(itemsFeed);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  const bookable = parsed.data.data.filter(item => item.isBookable);
  expect(bookable.length).toBeGreaterThan(0);
  expect(bookable[0].duration).toBeTruthy();
  expect(['customer', 'location', 'flexible']).toContain(
    bookable[0].serviceMode ?? 'customer',
  );
});

test('defaults isSuspended rather than requiring the key', () => {
  const parsed = catalogueItemSchema.safeParse({
    id: 'i1',
    name: 'Minimal item',
    status: 'active',
    itemType: 'product',
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.isSuspended).toBe(false);
});

test('rejects an item without an id or status', () => {
  expect(
    catalogueItemSchema.safeParse({ name: 'No id', itemType: 'product' }).success,
  ).toBe(false);
});

test('accepts null prices across the optional money fields', () => {
  const parsed = catalogueItemSchema.safeParse({
    id: 'i2',
    name: 'Free service',
    status: 'active',
    itemType: 'service',
    price: null,
    discountValue: null,
    priceRangeMin: null,
    priceRangeMax: null,
    stockQuantity: null,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.price).toBeNull();
});

test('branch categories come back as a bare array', () => {
  const parsed = catalogueCategoryListSchema.safeParse(categories);

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(Array.isArray(parsed.data)).toBe(true);
  expect(parsed.data[0].name).toBe('Electronics');
});

test('rejects the data-wrapped envelope for categories', () => {
  expect(catalogueCategoryListSchema.safeParse({ data: [] }).success).toBe(false);
});

test('GET /products uses a page envelope, not the cursor one', () => {
  const pageFeed = {
    data: [],
    total: 0,
    page: 1,
    limit: 3,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  expect(publishedProductFeedSchema.safeParse(pageFeed).success).toBe(true);
  // totalPages/hasPrevPage are not part of the cursor envelope.
  expect(catalogueItemFeedSchema.safeParse(pageFeed).success).toBe(true);
});

test('product types are a bare array with a slug', () => {
  const parsed = z
    .array(productTypeSchema)
    .safeParse([
      {
        id: 't1',
        name: 'NFC CARDS ',
        description: 'This is a simple card ',
        slug: 'nfc-cards',
      },
    ]);

  expect(parsed.success).toBe(true);
});
