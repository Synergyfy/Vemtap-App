import type { PublicOfferDetail } from '@api/dealsApi';
import type { GeoCoords } from '@constants/locations';
import {
  discountLabel,
  formatDistanceLabel,
  offerCountdown,
  offerDistanceMeters,
  offerImage,
  priceLabels,
} from '@features/deals/utils/offerMapper';
import type { ResolvedDeal } from '@features/dealDetail/data/dealResolver';

/**
 * A live offer detail payload onto the deal page's view model.
 *
 * The formatting is imported from the shared deal mapper rather than repeated,
 * so the price pair, discount badge, countdown, image and distance on the detail
 * page follow the same rules as the Home and Deals cards — the page cannot drift
 * from the feed that linked into it.
 *
 * `origin` is the discovery origin the feed filtered by, so the distance shown
 * here describes the same point the list was built around.
 */

/** Shape the shared feed helpers expect. */
type FeedOfferView = Parameters<typeof priceLabels>[0];

/**
 * The details endpoint names its prices `dealPrice`/`discountValue` where the
 * feed uses `calculatedPrice`. Reconciled here so the shared formatters keep one
 * contract, instead of teaching them two shapes.
 */
function asFeedOffer(detail: PublicOfferDetail): FeedOfferView {
  return {
    ...detail,
    calculatedPrice: detail.dealPrice ?? detail.calculatedPrice,
  } as unknown as FeedOfferView;
}

export function mapOfferDetailToResolved(
  detail: PublicOfferDetail,
  origin: GeoCoords,
): ResolvedDeal {
  const offer = asFeedOffer(detail);
  const prices = priceLabels(offer);
  const { business } = detail;

  return {
    id: detail.id,
    image: { uri: offerImage(offer) },
    merchant: business?.name ?? '',
    // The merchant's own city/address, not a hardcoded "Apo, Abuja".
    location: business?.city ?? business?.address ?? '',
    title: detail.name,
    price: prices.price,
    priceWas: prices.priceWas,
    save: prices.save,
    badge: discountLabel(offer),
    distance: formatDistanceLabel(offerDistanceMeters(offer, origin)),
    description: detail.longDescription ?? detail.description ?? '',
    address: business?.address ?? '',
    // Counts come off the detail payload, so the page needs no second request.
    likes: detail.likesCount,
    comments: detail.reviewsCount,

    // Real-offer extras. Absent for the fictional seed deals, which is what lets
    // the screen tell the two apart and link to a real merchant.
    endsIn: offerCountdown(detail.endDate) ?? undefined,
    businessCode: business?.slug ?? undefined,
    isVerifiedBusiness: business?.isVerified ?? undefined,
  };
}
