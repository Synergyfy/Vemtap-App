import type { CatalogueItem } from '@api/catalogueApi';
import type { ProductComment, ProductCommentsPage } from '@api/productCommentsApi';
import { strings } from '@constants/strings';
import { toAmount } from '@features/deals/utils/offerMapper';
import { formatCurrency, formatWhen } from '@utils/formatters';

const copy = strings.productDetail;

/** Below this many units the stock line warns instead of saying "in stock". */
const LOW_STOCK = 5;

export interface ProductDetailView {
  id: string;
  name: string;
  images: string[];
  /** The price a customer pays for one unit, after the item's own discount. */
  unitPrice: number;
  price: string;
  /** Struck-through list price; null when there is no discount. */
  wasPrice: string | null;
  discountLabel: string | null;
  description: string;
  category: string | null;
  stock: { label: string; tone: 'success' | 'warning' | 'error' };
  canOrder: boolean;
}

/**
 * Applies the item's own discount. A percentage is capped at 100 and a fixed
 * amount at the price, so a bad value can never produce a negative price.
 */
export function discountedPrice(item: CatalogueItem): {
  unit: number;
  list: number;
  label: string | null;
} {
  const list = toAmount(item.price) ?? 0;
  const value = toAmount(item.discountValue) ?? 0;
  if (value <= 0 || list <= 0) return { unit: list, list, label: null };
  if (item.discountType === 'percentage') {
    const pct = Math.min(value, 100);
    return {
      unit: Math.round(list * (1 - pct / 100) * 100) / 100,
      list,
      label: copy.discountOff(`${pct}%`),
    };
  }
  if (item.discountType === 'fixed') {
    const off = Math.min(value, list);
    return {
      unit: list - off,
      list,
      label: copy.discountOff(formatCurrency(off)),
    };
  }
  return { unit: list, list, label: null };
}

export function toProductDetailView(item: CatalogueItem): ProductDetailView {
  const { unit, list, label } = discountedPrice(item);
  const images = [item.mainImage, ...(item.galleryImages ?? [])].filter(
    (uri, index, all): uri is string => Boolean(uri) && all.indexOf(uri) === index,
  );
  const stockCount = item.stockQuantity ?? null;
  const outOfStock =
    item.status === 'out_of_stock' ||
    (stockCount !== null && stockCount <= 0 && !item.allowBackOrder);
  const stock = outOfStock
    ? { label: copy.outOfStock, tone: 'error' as const }
    : stockCount !== null && stockCount > 0 && stockCount <= LOW_STOCK
      ? { label: copy.lowStock(stockCount), tone: 'warning' as const }
      : { label: copy.inStock, tone: 'success' as const };

  return {
    id: item.id,
    name: item.name,
    images,
    unitPrice: unit,
    price: formatCurrency(unit),
    wasPrice: label ? formatCurrency(list) : null,
    discountLabel: label,
    description:
      item.description?.trim() || item.shortDescription?.trim() || copy.noDescription,
    category: item.category?.name ?? null,
    stock,
    canOrder: !outOfStock,
  };
}

export interface ProductRatingView {
  score: string | null;
  stars: number;
  ratingLabel: string;
  commentLabel: string;
}

export function toProductRatingView(page?: ProductCommentsPage): ProductRatingView {
  const average = page?.averageRating ?? null;
  const rated = page?.ratingCount ?? 0;
  const total = page?.total ?? 0;
  return {
    score: average === null ? null : average.toFixed(1),
    stars: Math.round(average ?? 0),
    ratingLabel: rated > 0 ? copy.ratingCount(rated) : copy.noRating,
    commentLabel: total > 0 ? copy.commentCount(total) : copy.beFirst,
  };
}

export interface ProductCommentView {
  id: string;
  author: string;
  initials: string;
  when: string;
  body: string;
  rating: number;
  isMine: boolean;
  reply: string | null;
  replyWhen: string;
}

export function toProductCommentView(comment: ProductComment): ProductCommentView {
  const author = comment.authorName.trim() || strings.productComments.you;
  return {
    id: comment.id,
    author: comment.isMine ? `${author} (${strings.productComments.you})` : author,
    initials: author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase(),
    when: formatWhen(comment.createdAt),
    body: comment.comment,
    rating: comment.rating ?? 0,
    isMine: comment.isMine,
    reply: comment.merchantReply?.trim() || null,
    replyWhen: comment.repliedAt ? formatWhen(comment.repliedAt) : '',
  };
}
