import { create } from 'zustand';

/**
 * Accumulates the create-product / create-service / create-deal wizard input
 * across screens. The setup navigators drive every step with
 * `navigation.navigate`, which cannot carry payloads between routes, so each
 * screen merges its slice here on Continue and the review/published screens
 * read it back at publish time. The seeds the screens render with are UI
 * prototype copy; this store only holds what the owner actually submits.
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
}));
