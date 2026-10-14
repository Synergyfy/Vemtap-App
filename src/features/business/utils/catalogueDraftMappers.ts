import type {
  CreateCatalogueItemInput,
  CreateCatalogueOfferInput,
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
  return {
    name: draft.name.trim() || 'Untitled product',
    description: resolveDescription(draft.description, draft.name),
    price: parseMoneyInput(draft.regularPrice) ?? 0,
    brand: draft.unbranded ? undefined : draft.brand.trim() || undefined,
    sku: draft.sku?.trim() || undefined,
    costPrice: parseMoneyInput(draft.costPrice),
    minStock: parseCountInput(draft.lowStockThreshold),
    stockQuantity: draft.inStock ? undefined : 0,
    allowBackOrder: draft.backorder,
    tags: [...draft.attributes, draft.condition].filter(Boolean),
    variants: draft.variants.map(variant => ({
      type: variant.name,
      value: variant.price,
    })),
    categoryId: draft.categoryId,
    mainImage: draft.mainImage,
    galleryImages: draft.galleryImages.length ? draft.galleryImages : undefined,
    itemType: 'product',
    branchId,
  };
}

export function serviceDraftToCreateInput(
  draft: ServiceDraft,
  branchId: string,
): CreateCatalogueItemInput {
  return {
    name: draft.name.trim() || 'Untitled service',
    description: resolveDescription(draft.description, draft.name),
    price: parseMoneyInput(draft.basePrice) ?? 0,
    priceType: 'fixed',
    duration: draft.duration?.trim() || undefined,
    serviceMode: SERVICE_MODE_MAP[draft.serviceMode] ?? 'location',
    isBookable: draft.bookingEnabled,
    bookingMethod: 'vemtap',
    tags: draft.highlights.length ? draft.highlights : undefined,
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
    itemIds: itemIds.length ? itemIds : undefined,
    terms: terms.length ? terms : undefined,
    maxClaimsPerCustomer: draft.claimFrequency === 'once' ? 1 : draft.maxClaimsPerMonth,
    startDate: draft.startDate,
    endDate: draft.endDate,
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
