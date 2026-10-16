import { strings } from '@constants/strings';
import type {
  SetItemBranchPricingInput,
  BusinessOfferAdmin,
  CreateCatalogueItemInput,
  CreateCatalogueOfferInput,
  UpdateCatalogueOfferInput,
} from '@api/catalogueApi';
import type { DealDraft, ProductDraft, ServiceDraft } from '@store/catalogueDraftStore';

/**
 * Pure draft → request mappers for the catalogue create wizards. Kept free of
 * React so the publish paths in the navigators stay thin and the field
 * mappings (including the deal-strategy flatten and the required-description
 * fallback) are unit-testable.
 */

/** "14,000" / "₦ 14 000" → 14000. Unparseable input becomes undefined. */
export function parseMoneyInput(value?: string): number | undefined {
  if (value === undefined) return undefined;
  const digits = value.replace(/[^0-9.]/g, '');
  if (digits === '') return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parseCountInput(value?: string): number | undefined {
  const parsed = parseMoneyInput(value);
  if (parsed === undefined) return undefined;
  return Math.floor(parsed);
}

/**
 * The backend rejects an empty `description` (`@IsNotEmpty`), but drafts can be
 * saved before the owner typed one — fall back along the chain instead of 400.
 */
export function resolveDescription(
  description?: string,
  ...fallbacks: (string | undefined)[]
): string {
  const candidates = [description, ...fallbacks];
  for (const candidate of candidates) {
    if (candidate && candidate.trim() !== '') return candidate.trim();
  }
  return 'No description provided';
}

const SERVICE_MODE_MAP: Record<string, CreateCatalogueItemInput['serviceMode']> = {
  'in-salon': 'location',
  'at-location': 'location',
  location: 'location',
  'at-customer': 'customer',
  customer: 'customer',
  online: 'online',
  flexible: 'flexible',
};

export function productDraftToCreateInput(
  draft: ProductDraft,
  branchId: string,
): CreateCatalogueItemInput {
  const fulfillmentModes = draft.fulfillmentModes.filter(
    (mode): mode is 'pickup' | 'delivery' | 'dine_in' =>
      mode === 'pickup' || mode === 'delivery' || mode === 'dine_in',
  );

  return {
    name: draft.name.trim() || 'Untitled product',
    description: resolveDescription(draft.description, draft.name),
    price: parseMoneyInput(draft.regularPrice) ?? 0,
    compareAtPrice: parseMoneyInput(draft.compareAtPrice),
    brand: draft.unbranded ? undefined : draft.brand.trim() || undefined,
    sku: draft.sku?.trim() || undefined,
    costPrice: parseMoneyInput(draft.costPrice),
    minStock: parseCountInput(draft.lowStockThreshold),
    stockQuantity: draft.inStock ? undefined : 0,
    allowBackOrder: draft.backorder,
    // The API's condition is new | refurbished | used; the wizard's food
    // conditions only map onto `new` (the label still goes out as a tag).
    condition: PRODUCT_CONDITION_MAP[draft.condition] ?? undefined,
    tags: [
      ...draft.attributes,
      strings.addProductBasics.conditions.find(option => option.id === draft.condition)
        ?.label ?? draft.condition,
    ].filter(Boolean),
    variants: draft.variants.map(variant => ({
      name: variant.name,
      price: parseMoneyInput(variant.price) ?? 0,
      stockQuantity: variant.inventory,
    })),
    pricingMode:
      draft.pricingMode === 'branch' || draft.pricingMode === 'custom'
        ? 'per_branch'
        : 'uniform',
    fulfillmentModes: fulfillmentModes.length ? fulfillmentModes : undefined,
    categoryId: draft.categoryId,
    mainImage: draft.mainImage,
    galleryImages: draft.galleryImages.length ? draft.galleryImages : undefined,
    itemType: 'product',
    branchId,
  };
}

/** Wizard product conditions → the API's `CatalogueItemCondition`. */
const PRODUCT_CONDITION_MAP: Record<string, 'new' | 'refurbished' | 'used'> = {
  fresh: 'new',
  packaged: 'new',
  new: 'new',
  refurbished: 'refurbished',
  used: 'used',
};

export function serviceDraftToCreateInput(
  draft: ServiceDraft,
  branchId: string,
): CreateCatalogueItemInput {
  return {
    name: draft.name.trim() || 'Untitled service',
    description: resolveDescription(draft.description, draft.name),
    price: parseMoneyInput(draft.basePrice) ?? 0,
    compareAtPrice: parseMoneyInput(draft.compareAtPrice),
    priceType: 'fixed',
    duration: draft.duration?.trim() || undefined,
    serviceMode: SERVICE_MODE_MAP[draft.serviceMode] ?? 'location',
    isBookable: draft.bookingEnabled,
    bookingMethod: 'vemtap',
    audience: draft.audience?.trim() || undefined,
    tags: draft.highlights.length ? draft.highlights : undefined,
    variants: draft.tiers.length
      ? draft.tiers.map(tier => ({
          name: tier.duration ? `${tier.name} (${tier.duration})` : tier.name,
          price: parseMoneyInput(tier.price) ?? 0,
        }))
      : undefined,
    bookingRules: draft.bookingEnabled ? draft.bookingRules : undefined,
    pricingMode: draft.pricingMode,
    mainImage: draft.mainImage,
    galleryImages: draft.galleryImages.length ? draft.galleryImages : undefined,
    itemType: 'service',
    branchId,
    categoryId: draft.categoryId,
  };
}

/**
 * The wizard's `combo` and `tiered` strategies have no backend pricing type;
 * per product decision they flatten to a percentage discount.
 */
export function dealPricingType(
  strategy: DealDraft['strategy'],
): CreateCatalogueOfferInput['pricingType'] {
  return strategy === 'fixed' ? 'fixed_discount_amount' : 'percentage_discount';
}

export function dealDraftToCreateInput(
  draft: DealDraft,
  branchId: string,
  /** Every branch to publish to; one offer each, sharing a `dealGroupId`. */
  branchIds: string[] = [],
): CreateCatalogueOfferInput {
  const claimInstructions = draft.claimSteps
    .map(step => step.value.trim())
    .filter(Boolean);
  const terms = [...new Set([...draft.terms, ...claimInstructions])];

  const itemIds = [...new Set(draft.itemIds)];
  const sourceProductId =
    draft.sourceProductId && itemIds.includes(draft.sourceProductId)
      ? draft.sourceProductId
      : undefined;

  return {
    name:
      draft.name.trim() ||
      (draft.sourceProductName ? `${draft.sourceProductName} deal` : 'Catalogue deal'),
    description: draft.description,
    sourceProductId,
    mainImage: draft.mainImage,
    quantity: parseCountInput(draft.totalVouchers),
    pricingType: dealPricingType(draft.strategy),
    discountValue: draft.discountRate,
    branchId,
    branchIds: branchIds.length > 1 ? [...new Set(branchIds)] : undefined,
    itemIds: itemIds.length ? itemIds : undefined,
    terms: terms.length ? terms : undefined,
    maxClaimsPerCustomer: draft.claimFrequency === 'once' ? 1 : draft.maxClaimsPerMonth,
    startDate: draft.startDate,
    endDate: draft.endDate,
  };
}

/** The wizard strategy an existing deal's pricing type reads back as. */
export function dealStrategyFor(pricingType?: string | null): DealDraft['strategy'] {
  return pricingType === 'fixed_discount_amount' ? 'fixed' : 'percentage';
}

/**
 * An existing deal (an admin row, ideally `groupBy=deal`) as a wizard draft,
 * so Edit opens every step on the deal's real values. Claim instructions are
 * stored inside `terms` on create, so they are split back out here.
 */
export function offerRowToDealDraft(row: BusinessOfferAdmin): DealDraft {
  const claimSteps = (row.claimSteps ?? []).filter(Boolean);
  const strategy = dealStrategyFor(row.pricingType);
  const discountRate = row.discountValue ?? 0;
  const maxClaims = row.maxClaimsPerCustomer ?? 1;
  const branchIds = (row.branches ?? []).map(branch => branch.branchId);
  return {
    itemIds: row.itemIds ?? (row.items ?? []).map(item => item.id),
    name: row.name ?? '',
    description: row.description ?? '',
    mainImage: row.mainImage ?? undefined,
    strategy,
    discountRate,
    totalVouchers: row.quantity != null ? String(row.quantity) : undefined,
    claimFrequency: maxClaims === 1 ? 'once' : 'multiple',
    maxClaimsPerMonth: maxClaims,
    acceptGifting: row.allowGifting ?? false,
    terms: (row.terms ?? []).filter(term => !claimSteps.includes(term)),
    claimSteps: claimSteps.map((value, index) => ({ id: `step-${index + 1}`, value })),
    branchIds: branchIds.length ? branchIds : row.branchId ? [row.branchId] : [],
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    basePrice: row.originalPrice ?? undefined,
    editingDealGroupId: row.dealGroupId ?? row.id,
    editingOriginal: { strategy, discountRate },
  };
}

/**
 * The edited draft as a group update. Branch fields are left out (an update
 * cannot move a deal between branches), and pricing is only sent when the
 * owner changed it, so a fixed-price or bundle deal keeps its pricing type.
 */
export function dealDraftToUpdateInput(draft: DealDraft): UpdateCatalogueOfferInput {
  const {
    branchId: _branchId,
    branchIds: _branchIds,
    pricingType,
    discountValue,
    ...rest
  } = dealDraftToCreateInput(draft, draft.branchIds[0] ?? '');
  const original = draft.editingOriginal;
  const pricingChanged =
    !original ||
    original.strategy !== draft.strategy ||
    original.discountRate !== draft.discountRate;
  return {
    ...rest,
    ...(pricingChanged ? { pricingType, discountValue } : {}),
  };
}

/** First branch owns the create; the rest are added via the import endpoint. */
export function splitBranchIds(branchIds: string[]): {
  primaryBranchId: string;
  remainingBranchIds: string[];
} {
  const [primaryBranchId, ...remainingBranchIds] = branchIds;
  return { primaryBranchId, remainingBranchIds };
}

/**
 * The service's per-branch prices as a `PUT …/branch-pricing` body, or
 * `undefined` when it has one price everywhere (create + import cover that).
 * A branch without its own price falls back to the base price.
 */
export function serviceBranchPricingInput(
  draft: ServiceDraft,
): SetItemBranchPricingInput | undefined {
  if (draft.pricingMode !== 'per_branch' || !draft.branchIds.length) return undefined;
  const base = parseMoneyInput(draft.basePrice);
  return {
    pricingMode: 'per_branch',
    branches: draft.branchIds.map(branchId => ({
      branchId,
      isAvailable: true,
      price: parseMoneyInput(draft.branchPrices[branchId]) ?? base ?? null,
    })),
  };
}
