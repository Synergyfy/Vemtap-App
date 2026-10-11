import {
  createCatalogueItemInputSchema,
  updateCatalogueItemInputSchema,
  createCatalogueOfferInputSchema,
  updateCatalogueOfferInputSchema,
  catalogueOfferSchema,
  generateOfferTermsSchema,
} from '@api/catalogueApi';

/**
 * The owner create/deal/product/service wizards POST straight into these
 * schemas before `requestValidated` sends the body. The backend rejects unknown
 * keys (`forbidNonWhitelisted`) and requires name/description/branchId on
 * items, so the input contracts — including stripping — are pinned here.
 */

const branchId = 'b1000000-0000-4000-8000-000000000001';
const itemId = 'a1000000-0000-4000-8000-000000000002';

const minimalProduct = {
  name: 'Cheeseburger',
  description: 'Double patty with cheddar',
  branchId,
};

test('accepts a minimal product create payload', () => {
  const parsed = createCatalogueItemInputSchema.safeParse(minimalProduct);
  expect(parsed.success).toBe(true);
});

test('strips unknown keys the server would reject', () => {
  const parsed = createCatalogueItemInputSchema.safeParse({
    ...minimalProduct,
    // A screen mistake — e.g. spreading a draft object — must not 400 the POST.
    selectedBranchIds: ['wuse', 'garki'],
    step: 3,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data).not.toHaveProperty('selectedBranchIds');
  expect(parsed.data).not.toHaveProperty('step');
});

test('rejects an item create without a description', () => {
  const { description: _dropped, ...withoutDescription } = minimalProduct;
  expect(createCatalogueItemInputSchema.safeParse(withoutDescription).success).toBe(
    false,
  );
});

test('rejects a non-uuid branchId', () => {
  const parsed = createCatalogueItemInputSchema.safeParse({
    ...minimalProduct,
    branchId: 'wuse',
  });
  expect(parsed.success).toBe(false);
});

test('accepts a full service create payload', () => {
  const parsed = createCatalogueItemInputSchema.safeParse({
    name: 'Deep tissue massage',
    description: '60 minute full-body massage',
    price: 0,
    priceType: 'starting_from',
    priceRangeMin: 5000,
    priceRangeMax: 15000,
    duration: '60 mins',
    serviceMode: 'customer',
    isBookable: true,
    bookingMethod: 'vemtap',
    itemType: 'service',
    branchId,
  });

  expect(parsed.success).toBe(true);
});

test('update accepts a draft toggle with no other fields', () => {
  const parsed = updateCatalogueItemInputSchema.safeParse({ status: 'inactive' });
  expect(parsed.success).toBe(true);
});

test('update accepts a publish toggle', () => {
  expect(
    updateCatalogueItemInputSchema.safeParse({ status: 'active' }).success,
  ).toBe(true);
});

test('rejects an unknown item status', () => {
  expect(
    updateCatalogueItemInputSchema.safeParse({ status: 'draft' }).success,
  ).toBe(false);
});

const fullOffer = {
  name: 'Summer special',
  pricingType: 'percentage_discount' as const,
  discountValue: 20,
  quantity: 100,
  branchId,
  itemIds: [itemId],
  terms: ['Valid during business hours'],
  maxClaimsPerCustomer: 1,
};

test('accepts a percentage deal create payload', () => {
  expect(createCatalogueOfferInputSchema.safeParse(fullOffer).success).toBe(true);
});

test('rejects a pricingType the backend does not model', () => {
  const parsed = createCatalogueOfferInputSchema.safeParse({
    ...fullOffer,
    // The wizard's "combo"/"tiered" strategies have no backend enum; callers
    // must flatten them to percentage before hitting the API.
    pricingType: 'combo',
  });
  expect(parsed.success).toBe(false);
});

test('offer update accepts the publish toggle', () => {
  const parsed = updateCatalogueOfferInputSchema.safeParse({ status: 'active' });
  expect(parsed.success).toBe(true);
});

test('parses an offer row whose decimal arrives as a string', () => {
  const parsed = catalogueOfferSchema.safeParse({
    id: itemId,
    name: 'Summer special',
    status: 'active',
    branchId,
    pricingType: 'percentage_discount',
    calculatedPrice: '8000.00',
    // Columns the client does not model must pass through untouched.
    views: 12,
    likesCount: 3,
  });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.calculatedPrice).toBe('8000.00');
  expect((parsed.data as Record<string, unknown>).views).toBe(12);
});

test('parses generated terms', () => {
  const parsed = generateOfferTermsSchema.safeParse({
    terms: ['Cannot be combined with other offers'],
  });
  expect(parsed.success).toBe(true);
});
