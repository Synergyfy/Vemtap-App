import type {
  BusinessCatalogueItem,
  BusinessOfferAdmin,
  CatalogueCategory,
} from '@api/catalogueApi';
import type {
  CategoryManagementRow,
  ServicesManagementRow,
} from '@features/business/screens/ServicesCategoriesManagementScreen';
import type { CentralCatalogueItemRow } from '@features/business/screens/CentralCatalogueScreen';
import type { CentralDealRow } from '@features/business/screens/CentralDealsManagementScreen';

/**
 * Live-catalogue → hub-row mappers. The hub management screens were built as
 * UI prototypes fed by `strings.ts` copy; the navigator routes now feed live
 * API data through these mappers so a single row shape renders either source.
 * Screens fall back to the prototype copy whenever a prop is absent, so the
 * standalone/storybook use still works.
 */

/**
 * Maps a catalogue item to the CentralCatalogue row shape. The API uses
 * `active | inactive | ...`; the prototype rows use marketing labels, so map
 * the known statuses and pass the raw status through as a fallback.
 */
export function catalogueItemToCentralRow(
  item: BusinessCatalogueItem,
): CentralCatalogueItemRow {
  const price = typeof item.price === 'number' ? item.price : 0;
  const statusLabel =
    item.itemType === 'service' ? 'Standard Menu' : iconStatusForItem(item);
  return {
    id: item.id,
    title: item.name,
    sku: item.sku ?? '',
    category: item.category?.name ?? '',
    price: `₦${price.toLocaleString()}`,
    status: statusLabel,
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
  const price = typeof item.price === 'number' ? item.price : 0;
  return {
    id: item.id,
    name: item.name,
    eyebrow: item.category?.name ?? 'Service',
    tag: item.itemType === 'service' ? 'Service' : 'Product',
    price: `₦${price.toLocaleString()}`,
    priceSuffix: undefined,
    duration: item.duration ?? '',
    status: item.status === 'active' ? 'Live' : 'Draft',
    note: item.shortDescription ?? item.description ?? '',
  };
}

/** Business catalogue categories for the reorderable list. */
export function catalogueCategoryToRow(
  category: CatalogueCategory,
): CategoryManagementRow {
  return {
    id: category.id,
    title: category.name,
    count: '',
    type: 'Catalogue',
    accent: 'brand',
    icon: 'folder',
  };
}

/**
 * Offers from `GET /catalogue/offers/admin` → CentralDeals row shape. The
 * admin endpoint returns the discount/voucher fields; build the discount
 * badge from `pricingType`/`discountValue` and keep voucher counts honest.
 */
export function offerToCentralDealRow(offer: BusinessOfferAdmin): CentralDealRow {
  const status = offer.status ?? 'active';
  const discountLabel =
    offer.pricingType === 'fixed_discount_amount'
      ? `₦${(offer.discountValue ?? 0).toLocaleString()} OFF`
      : offer.pricingType === 'fixed_discount_price'
        ? `₦${(offer.fixedPrice ?? 0).toLocaleString()}`
        : offer.pricingType === 'sum'
          ? 'Bundle'
          : `${offer.discountValue ?? 0}% OFF`;
  return {
    id: offer.id,
    title: offer.name ?? 'Untitled deal',
    subtitle: offer.description ?? '',
    discount: discountLabel,
    wasPrice: '',
    price: offer.calculatedPrice ? `₦${offer.calculatedPrice.toLocaleString()}` : '',
    branches: offer.branchName ?? '',
    status,
    schedule: formatSchedule(offer.startDate, offer.endDate),
    branches2: offer.branchName ?? '',
    logistics: '',
    claims: offer.maxClaims ?? offer.quantity ?? 0,
    redeemed: offer.claimedCount ?? 0,
    conversion: 0,
    percent: offer.quantity
      ? Math.round(((offer.claimedCount ?? 0) / offer.quantity) * 100)
      : 0,
  };
}

function formatSchedule(start?: string | null, end?: string | null): string {
  const startDate = start ?? undefined;
  const endDate = end ?? undefined;
  if (!startDate && !endDate) return '';
  const startLabel = startDate ? new Date(startDate).toLocaleDateString() : '';
  const endLabel = endDate ? new Date(endDate).toLocaleDateString() : '';
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel;
}
