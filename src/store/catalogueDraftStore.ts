import { create } from 'zustand';

/**
 * Accumulates the create-product / create-service / create-deal wizard input
 * across screens. The setup navigators drive every step with
 * `navigation.navigate`, which cannot carry payloads between routes, so each
 * screen merges its slice here on Continue and the review/published screens
 * read it back at publish time. This store only holds what the owner
 * actually submits.
 */

export interface ProductDraft {
  name: string;
  brand: string;
  unbranded: boolean;
  description: string;
  condition: string;
  attributes: string[];
  mainImage?: string;
  galleryImages: string[];
  /** Chosen by name in the wizard; resolved to a categoryId at publish. */
  categoryName?: string;
  categoryId?: string;
  /** Price fields are collected as formatted strings and normalised at publish. */
  regularPrice?: string;
  compareAtPrice?: string;
  costPrice?: string;
  sku?: string;
  lowStockThreshold?: string;
  backorder: boolean;
  variants: { id: string; name: string; price: string; inventory: number }[];
  branchIds: string[];
  pricingMode: 'uniform' | 'branch' | 'unified' | 'custom';
  inStock: boolean;
  fulfillmentModes: string[];
  publishedItemId?: string;
}

/** A priced option of a service (sent to the API as an item variant). */
export interface ServiceTier {
  id: string;
  name: string;
  price: string;
  duration?: string;
}

/**
 * When a service can be booked (the API's `bookingRules`). Weekdays are
 * `0 = Sunday … 6 = Saturday`; times are `HH:mm`.
 */
export interface ServiceBookingRules {
  days?: number[];
  from?: string;
  to?: string;
  bufferMinutes?: number;
  leadMinutes?: number;
  horizonDays?: number;
  capacity?: number;
  requiresConfirmation?: boolean;
  /** Dates the service cannot be booked (`YYYY-MM-DD`). */
  blockouts?: { date: string; reason?: string }[];
  /** A branch's own days/hours, replacing the service-wide ones there. */
  branchSchedules?: { branchId: string; days?: number[]; from?: string; to?: string }[];
}

export interface ServiceDraft {
  name: string;
  description: string;
  deliveryMode: string;
  highlights: string[];
  audience: string;
  mainImage?: string;
  galleryImages: string[];
  basePrice?: string;
  compareAtPrice?: string;
  duration?: string;
  bookingEnabled: boolean;
  branchIds: string[];
  /** Raw wizard value; mapped onto the API enum at publish. */
  serviceMode: string;
  isBookable: boolean;
  bookingMethod?: string;
  /** Optional category for service organization (mirrors product categoryId). */
  categoryId?: string;
  categoryName?: string;
  /** Priced tiers/add-ons on top of the base price. */
  tiers: ServiceTier[];
  /** One price everywhere, or a price per branch (`branchPrices`). */
  pricingMode: 'uniform' | 'per_branch';
  /** Price per branch id (raw input) when `pricingMode` is `per_branch`. */
  branchPrices: Record<string, string>;
  bookingRules?: ServiceBookingRules;
  publishedServiceId?: string;
}

export interface DealDraft {
  sourceProductId?: string;
  sourceProductName?: string;
  itemIds: string[];
  name: string;
  description: string;
  mainImage?: string;
  strategy: 'percentage' | 'fixed' | 'combo' | 'tiered';
  discountRate: number;
  totalVouchers?: string;
  claimFrequency: 'once' | 'multiple';
  maxClaimsPerMonth: number;
  acceptGifting: boolean;
  terms: string[];
  claimSteps: { id: string; value: string }[];
  branchIds: string[];
  startDate?: string;
  endDate?: string;
  publishedOfferId?: string;
  /** Pre-discount price of the bundled items; drives the Step 1 preview. */
  basePrice?: number;
  /**
   * Set when the wizard is editing an existing deal: the group every branch's
   * offer shares. Step 4 then saves the change to all of them instead of
   * creating a new deal.
   */
  editingDealGroupId?: string;
  /**
   * The deal's pricing as loaded. The wizard's slider only expresses a
   * percentage, so pricing is sent on save only if the owner changed it —
   * otherwise a fixed-price or bundle deal would be rewritten as a percentage.
   */
  editingOriginal?: {
    strategy: DealDraft['strategy'];
    discountRate: number;
  };
}

const emptyProduct: ProductDraft = {
  name: '',
  brand: '',
  unbranded: false,
  description: '',
  condition: '',
  attributes: [],
  galleryImages: [],
  backorder: false,
  variants: [],
  branchIds: [],
  pricingMode: 'uniform',
  inStock: true,
  fulfillmentModes: [],
};

const emptyService: ServiceDraft = {
  name: '',
  description: '',
  deliveryMode: '',
  highlights: [],
  audience: '',
  galleryImages: [],
  bookingEnabled: true,
  branchIds: [],
  serviceMode: 'location',
  isBookable: true,
  bookingMethod: 'vemtap',
  tiers: [],
  pricingMode: 'uniform',
  branchPrices: {},
};

const emptyDeal: DealDraft = {
  itemIds: [],
  name: '',
  description: '',
  strategy: 'percentage',
  discountRate: 20,
  claimFrequency: 'once',
  maxClaimsPerMonth: 1,
  acceptGifting: false,
  terms: [],
  claimSteps: [],
  branchIds: [],
};

export interface CatalogueDraftState {
  product: ProductDraft;
  service: ServiceDraft;
  deal: DealDraft;
  setProduct: (step: Partial<ProductDraft>) => void;
  setService: (step: Partial<ServiceDraft>) => void;
  setDeal: (step: Partial<DealDraft>) => void;
  /** Keeps the created id so the published screen can toggle status later. */
  setPublishedProduct: (id: string) => void;
  setPublishedService: (id: string) => void;
  setPublishedDeal: (id: string) => void;
  resetProduct: () => void;
  resetService: () => void;
  resetDeal: () => void;
  /** Replaces the deal draft with an existing deal for the edit flow. */
  loadDealForEdit: (deal: DealDraft) => void;
}

export const useCatalogueDraftStore = create<CatalogueDraftState>()(set => ({
  product: emptyProduct,
  service: emptyService,
  deal: emptyDeal,

  setProduct: step => set(state => ({ product: { ...state.product, ...step } })),
  setService: step => set(state => ({ service: { ...state.service, ...step } })),
  setDeal: step => set(state => ({ deal: { ...state.deal, ...step } })),

  setPublishedProduct: id =>
    set(state => ({ product: { ...state.product, publishedItemId: id } })),
  setPublishedService: id =>
    set(state => ({ service: { ...state.service, publishedServiceId: id } })),
  setPublishedDeal: id =>
    set(state => ({ deal: { ...state.deal, publishedOfferId: id } })),

  resetProduct: () => set({ product: emptyProduct }),
  resetService: () => set({ service: emptyService }),
  resetDeal: () => set({ deal: emptyDeal }),
  loadDealForEdit: deal => set({ deal: { ...emptyDeal, ...deal } }),
}));
