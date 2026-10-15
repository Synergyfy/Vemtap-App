import { strings } from '@constants/strings';
import type { BusinessCatalogueItem, CatalogueCategory } from '@api/catalogueApi';
import type { CategoryManagementRow } from '@features/business/components/CatalogueCategoryRow';
import {
  DRAFT_SERVICE_STATUS,
  type ServicesManagementRow,
} from '@features/business/components/CatalogueServiceCard';
import type { CentralCatalogueItemRow } from '@features/business/screens/CentralCatalogueScreen';

/**
 * Live-catalogue → hub-row mappers. The hub management screens were built as
 * UI prototypes fed by `strings.ts` copy; the navigator routes now feed live
 * API data through these mappers so a single row shape renders either source.
 * Screens fall back to the prototype copy whenever a prop is absent, so the
 * standalone/storybook use still works.
 */

/**
 * Money columns are Postgres decimals, so the API sends `"4500.00"` as often as
 * `4500`. Reading only numbers rendered every live price as ₦0.
 */
function toAmount(value: unknown, fallback = 0): number {
  const amount = typeof value === 'string' ? Number(value) : value;
  return typeof amount === 'number' && Number.isFinite(amount) ? amount : fallback;
}

/**
 * Maps a catalogue item to the CentralCatalogue row shape. The API uses
 * `active | inactive | ...`; the prototype rows use marketing labels, so map
 * the known statuses and pass the raw status through as a fallback.
 */
export function catalogueItemToCentralRow(
  item: BusinessCatalogueItem,
): CentralCatalogueItemRow {
  const price = toAmount(item.price);
  return {
    id: item.id,
    kind: item.itemType === 'service' ? 'service' : 'product',
    title: item.name,
    sku: item.sku ?? '',
    category: item.category?.name ?? '',
    price: `₦${price.toLocaleString()}`,
    status: iconStatusForItem(item),
    location: '',
    stock: '',
    image: item.mainImage ? { uri: item.mainImage, alt: item.name } : undefined,
    wasPrice: undefined,
  };
}

/** `Draft / Paused` is the prototype's inactive label; pass `inactive` through. */
function iconStatusForItem(item: BusinessCatalogueItem): string {
  if (item.status === 'inactive' || item.status === 'archived') {
    return 'Draft / Paused';
  }
  if (item.status === 'out_of_stock' || item.status === 'low_stock') {
    return 'Low Stock';
  }
  return 'Standard Menu';
}

/** Service rows for the ServicesCategories screen (itemType === 'service'). */
export function catalogueItemToServiceRow(
  item: BusinessCatalogueItem,
): ServicesManagementRow {
  const price = toAmount(item.price);
  return {
    id: item.id,
    name: item.name,
    eyebrow: item.category?.name ?? 'Service',
    tag: item.itemType === 'service' ? 'Service' : 'Product',
    price: `₦${price.toLocaleString()}`,
    priceSuffix: undefined,
    duration: item.duration ?? '',
    status: item.status === 'active' ? 'Live' : DRAFT_SERVICE_STATUS,
    note: item.shortDescription ?? item.description ?? '',
    image: item.mainImage ? { uri: item.mainImage, alt: item.name } : undefined,
  };
}

/** Business catalogue categories for the reorderable list. */
export function catalogueCategoryToRow(
  category: CatalogueCategory,
  itemCount?: number,
): CategoryManagementRow {
  return {
    id: category.id,
    title: category.name,
    count:
      itemCount === undefined
        ? ''
        : strings.centralCatalogue.categoryItemCount(itemCount),
    type: strings.centralCatalogue.categoryType,
    accent: 'brand',
    icon: 'folder',
  };
}

/**
 * Maps a catalogue item to the setup-card shape the wizard's
 * AddProductsOrServices screen expects. Identity passthrough: the card is a
 * read-only preview of the owner's own catalogue during setup. The screen
 * falls back to prototype copy whenever a prop is absent, so storybook use still works.
 */
export function catalogueItemToSetupCard(item: BusinessCatalogueItem) {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    shortDescription: item.shortDescription,
    description: item.description,
    mainImage: item.mainImage,
    galleryImages: item.galleryImages,
    businessId: item.businessId,
    category: item.category,
    categoryId: item.categoryId,
    status: item.status,
    itemType: item.itemType,
    sku: item.sku ?? '',
    discountType: item.discountType,
    discountValue: item.discountValue,
    stockQuantity: item.stockQuantity,
    barcode: item.barcode,
    brand: item.brand,
    priceType: item.priceType,
    priceRangeMin: item.priceRangeMin,
    priceRangeMax: item.priceRangeMax,
    duration: item.duration,
    serviceMode: item.serviceMode,
    isBookable: item.isBookable,
    bookingMethod: item.bookingMethod,
    externalBookingLink: item.externalBookingLink,
    isSuspended: item.isSuspended,
    loyaltyPoints: item.loyaltyPoints,
  };
}
