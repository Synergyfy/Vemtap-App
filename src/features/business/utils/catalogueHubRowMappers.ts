import { strings } from '@constants/strings';
import type { BusinessCatalogueItem, CatalogueCategory } from '@api/catalogueApi';
import type { CategoryManagementRow } from '@features/business/components/CatalogueCategoryRow';
import {
  DRAFT_SERVICE_STATUS,
  type ServicesManagementRow,
} from '@features/business/components/CatalogueServiceCard';
import type { CentralCatalogueItemRow } from '@features/business/screens/CentralCatalogueScreen';
import { businessCatalogCopy } from '@features/business/businessCopy';
import type { CatalogItem } from '@features/business/businessData';

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
 * Maps a catalogue item to the setup card the wizard's AddProductsOrServices
 * screen renders, a read-only preview of the owner's own catalogue during setup.
 */
export function catalogueItemToSetupCard(item: BusinessCatalogueItem): CatalogItem {
  const card = businessCatalogCopy.setupCard;
  const isService = item.itemType === 'service';
  const price = toAmount(item.price);
  const isRange = item.priceType === 'range';
  const isLive = item.status === 'active' && !item.isSuspended;
  const stock = toAmount(item.stockQuantity, Number.NaN);

  return {
    id: item.id,
    kind: isService ? 'service' : 'product',
    category: item.category?.name ?? '',
    title: item.name,
    image: item.mainImage ? { uri: item.mainImage } : undefined,
    priceSummary: isRange
      ? `₦${toAmount(item.priceRangeMin, price).toLocaleString()} – ₦${toAmount(
          item.priceRangeMax,
          price,
        ).toLocaleString()}`
      : `₦${price.toLocaleString()}`,
    priceNote: isService ? (item.duration ?? card.durationNotSet) : undefined,
    multiPrice: isRange,
    availability: setupCardAvailability(item, isLive),
    availabilityIcon: isLive ? 'verified' : 'pauseCircle',
    availabilityTone: isLive ? 'success' : 'secondary',
    meta: isService
      ? item.isBookable
        ? card.bookable
        : card.notBookable
      : Number.isFinite(stock)
        ? card.inventory(stock)
        : '',
  };
}

function setupCardAvailability(item: BusinessCatalogueItem, isLive: boolean): string {
  const card = businessCatalogCopy.setupCard;
  if (item.isSuspended) return card.suspended;
  if (item.status === 'out_of_stock') return card.outOfStock;
  if (item.status === 'low_stock') return card.lowStock;
  return isLive ? card.live : card.draft;
}
