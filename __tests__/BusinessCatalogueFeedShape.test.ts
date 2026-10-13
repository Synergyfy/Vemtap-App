import {
  businessCatalogueFeedSchema,
  businessCatalogueItemSchema,
  type BusinessCatalogueItem,
} from '@api/catalogueApi';

/**
 * Regression guard for the schema-mismatch error the console used to print:
 *
 *   [api] Response schema mismatch
 *   { formErrors: ["Invalid input: expected object, received array"] }
 *
 * `GET /catalogue/items` answers with a bare array even though it is documented
 * as a paginated feed, so the envelope-only schema threw on every call and
 * silently emptied the catalogue count on the Business hub. The payload below is
 * a real owner-token response, trimmed to nothing.
 */

const liveItem = {
  id: 'bfca55a5-2516-4a2d-9d27-908b073d8b2e',
  createdAt: '2026-10-08T20:00:18.792Z',
  updatedAt: '2026-10-08T20:00:18.792Z',
  deletedAt: null,
  name: 'Orphan Test Item',
  price: 1000,
  shortDescription: 'fixture',
  description: 'fixture',
  mainImage: null,
  galleryImages: null,
  businessId: 'c599e6c7-fe3a-4f57-8669-1853007a2250',
  category: null,
  categoryId: null,
  status: 'active',
  itemType: 'product',
  sku: 'FIXTURE-ORPHAN-1',
  discountType: 'none',
  discountValue: null,
  stockQuantity: null,
  barcode: null,
  costPrice: null,
  minStock: null,
  brand: null,
  weight: null,
  dimensions: null,
  variants: null,
  tags: null,
  suspensionNote: null,
  loyaltyPointsValue: 0,
  enableLoyaltyPoints: true,
} as unknown as BusinessCatalogueItem;

describe('businessCatalogueFeedSchema', () => {
  it('accepts the bare array the endpoint actually returns', () => {
    const parsed = businessCatalogueFeedSchema.safeParse([liveItem]);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.data).toHaveLength(1);
    expect(parsed.data.data[0].name).toBe('Orphan Test Item');
    // A bare array has no page metadata, so total is the row count.
    expect(parsed.data.total).toBe(1);
  });

  it('still accepts the documented envelope', () => {
    const parsed = businessCatalogueFeedSchema.safeParse({
      data: [liveItem],
      total: 42,
      page: 2,
      limit: 10,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.total).toBe(42);
    expect(parsed.data.page).toBe(2);
  });

  it('reports an empty catalogue as zero rows, not an error', () => {
    const parsed = businessCatalogueFeedSchema.safeParse([]);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.data).toEqual([]);
    expect(parsed.data.total).toBe(0);
  });

  it('rejects a row that is not a catalogue item', () => {
    expect(businessCatalogueItemSchema.safeParse({ id: 'x' }).success).toBe(false);
  });
});
