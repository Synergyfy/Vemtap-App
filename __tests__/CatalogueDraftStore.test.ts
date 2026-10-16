import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import {
  parseMoneyInput,
  parseCountInput,
  resolveDescription,
  productDraftToCreateInput,
  serviceDraftToCreateInput,
  dealDraftToCreateInput,
  dealPricingType,
  splitBranchIds,
} from '@features/business/utils/catalogueDraftMappers';

const branchId = 'b1000000-0000-4000-8000-000000000001';
const otherBranchId = 'b1000000-0000-4000-8000-000000000002';
const itemId = 'a1000000-0000-4000-8000-000000000003';

beforeEach(() => {
  useCatalogueDraftStore.getState().resetProduct();
  useCatalogueDraftStore.getState().resetService();
  useCatalogueDraftStore.getState().resetDeal();
});

describe('draft store', () => {
  it('merges step patches without dropping earlier fields', () => {
    useCatalogueDraftStore.getState().setProduct({ name: 'Kunu', brand: 'Zobo Co' });
    useCatalogueDraftStore.getState().setProduct({ regularPrice: '4,000' });

    const { product } = useCatalogueDraftStore.getState();
    expect(product.name).toBe('Kunu');
    expect(product.brand).toBe('Zobo Co');
    expect(product.regularPrice).toBe('4,000');
  });

  it('keeps the published id across later step patches', () => {
    useCatalogueDraftStore.getState().setPublishedProduct(itemId);
    useCatalogueDraftStore.getState().setProduct({ name: 'Renamed' });

    expect(useCatalogueDraftStore.getState().product.publishedItemId).toBe(itemId);
  });

  it('reset clears every slice', () => {
    useCatalogueDraftStore.getState().setProduct({ name: 'X' });
    useCatalogueDraftStore.getState().setService({ name: 'Y' });
    useCatalogueDraftStore.getState().setDeal({ name: 'Z' });
    useCatalogueDraftStore.getState().resetProduct();
    useCatalogueDraftStore.getState().resetService();
    useCatalogueDraftStore.getState().resetDeal();

    const state = useCatalogueDraftStore.getState();
    expect(state.product.name).toBe('');
    expect(state.service.name).toBe('');
    expect(state.deal.name).toBe('');
  });
});

describe('money and description helpers', () => {
  it('parses formatted money strings', () => {
    expect(parseMoneyInput('14,000')).toBe(14000);
    expect(parseMoneyInput('₦ 14 000.50')).toBe(14000.5);
    expect(parseMoneyInput('free')).toBeUndefined();
    expect(parseMoneyInput(undefined)).toBeUndefined();
  });

  it('floors count inputs', () => {
    expect(parseCountInput('100')).toBe(100);
    expect(parseCountInput('99.9')).toBe(99);
  });

  it('falls back along the chain for the required description', () => {
    expect(resolveDescription('Full text', 'Name')).toBe('Full text');
    expect(resolveDescription('   ', 'Name')).toBe('Name');
    expect(resolveDescription(undefined, undefined)).toBe('No description provided');
  });
});

describe('productDraftToCreateInput', () => {
  const baseDraft = {
    name: 'Cheeseburger',
    brand: 'Urban Grill',
    unbranded: false,
    description: 'Double patty',
    condition: 'fresh',
    attributes: ['beef'],
    galleryImages: ['https://img/1.jpg'],
    regularPrice: '14,000',
    compareAtPrice: '16,000',
    costPrice: '8,500',
    lowStockThreshold: '5',
    sku: 'UG-RB-042',
    backorder: false,
    variants: [{ id: 'v1', name: 'Large', price: '16,000', inventory: 3 }],
    branchIds: [branchId],
    pricingMode: 'uniform' as const,
    inStock: true,
    fulfillmentModes: ['pickup'],
  };

  it('maps the wizard fields onto the create DTO', () => {
    const input = productDraftToCreateInput(baseDraft, branchId);

    expect(input).toMatchObject({
      name: 'Cheeseburger',
      description: 'Double patty',
      price: 14000,
      compareAtPrice: 16000,
      costPrice: 8500,
      minStock: 5,
      brand: 'Urban Grill',
      sku: 'UG-RB-042',
      itemType: 'product',
      branchId,
      // The API only knows new | refurbished | used.
      condition: 'new',
      pricingMode: 'uniform',
      fulfillmentModes: ['pickup'],
    });
    expect(input.tags).toEqual(['beef', 'Fresh / New']);
    expect(input.variants).toEqual([{ name: 'Large', price: 16000, stockQuantity: 3 }]);
  });

  it('drops the brand for unbranded items and zeroes stock when out of stock', () => {
    const input = productDraftToCreateInput(
      { ...baseDraft, unbranded: true, inStock: false },
      branchId,
    );

    expect(input.brand).toBeUndefined();
    expect(input.stockQuantity).toBe(0);
  });

  it('omits an empty gallery instead of sending an empty array', () => {
    const input = productDraftToCreateInput(
      { ...baseDraft, galleryImages: [] },
      branchId,
    );
    expect(input.galleryImages).toBeUndefined();
  });
});

describe('serviceDraftToCreateInput', () => {
  it('maps delivery mode onto the API enum and falls back on description', () => {
    const input = serviceDraftToCreateInput(
      {
        name: 'Deep tissue massage',
        description: '',
        deliveryMode: 'in-salon',
        highlights: ['Organic Botanicals'],
        audience: 'all',
        compareAtPrice: '5,500',
        galleryImages: [],
        basePrice: '5,000',
        duration: '60 mins',
        bookingEnabled: true,
        branchIds: [branchId],
        serviceMode: 'in-salon',
        isBookable: true,
        tiers: [],
        pricingMode: 'uniform',
        branchPrices: {},
        bookingMethod: 'vemtap',
      },
      branchId,
    );

    expect(input).toMatchObject({
      name: 'Deep tissue massage',
      description: 'Deep tissue massage',
      price: 5000,
      compareAtPrice: 5500,
      priceType: 'fixed',
      duration: '60 mins',
      serviceMode: 'location',
      isBookable: true,
      bookingMethod: 'vemtap',
      audience: 'all',
      itemType: 'service',
    });
  });
});

describe('dealDraftToCreateInput', () => {
  const baseDraft = {
    itemIds: [itemId],
    name: 'Summer special',
    description: '20% off',
    strategy: 'percentage' as const,
    discountRate: 20,
    totalVouchers: '100',
    claimFrequency: 'once' as const,
    maxClaimsPerMonth: 3,
    acceptGifting: false,
    terms: ['Valid during business hours'],
    claimSteps: [
      { id: 's1', value: 'Show this voucher at the counter' },
      { id: 's2', value: '   ' },
    ],
    branchIds: [branchId, otherBranchId],
    sourceProductId: itemId,
    sourceProductName: 'Cheeseburger',
  };

  it('flattens combo and tiered to percentage_discount', () => {
    expect(dealPricingType('combo')).toBe('percentage_discount');
    expect(dealPricingType('tiered')).toBe('percentage_discount');
    expect(dealPricingType('percentage')).toBe('percentage_discount');
    expect(dealPricingType('fixed')).toBe('fixed_discount_amount');
  });

  it('maps limits, claim frequency and claim steps onto the offer DTO', () => {
    const input = dealDraftToCreateInput(baseDraft, branchId, baseDraft.branchIds);

    expect(input).toMatchObject({
      name: 'Summer special',
      pricingType: 'percentage_discount',
      discountValue: 20,
      quantity: 100,
      maxClaimsPerCustomer: 1,
      branchId,
      branchIds: [branchId, otherBranchId],
      sourceProductId: itemId,
      itemIds: [itemId],
    });
    // Claim steps are customer instructions; they ride along with the terms.
    expect(input.terms).toEqual([
      'Valid during business hours',
      'Show this voucher at the counter',
    ]);
  });

  it('uses maxClaimsPerMonth when claims are not once-only', () => {
    const input = dealDraftToCreateInput(
      { ...baseDraft, claimFrequency: 'multiple' },
      branchId,
    );
    expect(input.maxClaimsPerCustomer).toBe(3);
  });

  it('drops a sourceProductId that is not part of itemIds', () => {
    const input = dealDraftToCreateInput(
      { ...baseDraft, itemIds: [otherBranchId], sourceProductId: itemId },
      branchId,
    );
    expect(input.sourceProductId).toBeUndefined();
    expect(input.itemIds).toEqual([otherBranchId]);
  });
});

describe('splitBranchIds', () => {
  it('returns the first branch as primary and the rest for import', () => {
    expect(splitBranchIds([branchId, otherBranchId])).toEqual({
      primaryBranchId: branchId,
      remainingBranchIds: [otherBranchId],
    });
    expect(splitBranchIds([branchId])).toEqual({
      primaryBranchId: branchId,
      remainingBranchIds: [],
    });
  });
});
