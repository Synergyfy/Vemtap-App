import type { BusinessOfferAdmin, DealGroupStats } from '@api/catalogueApi';
import { strings } from '@constants/strings';
import { formatNaira } from '@features/business/data/businessSetupData';
import type { CentralDealRow } from '@features/business/screens/CentralDealsManagementScreen';
import type { DealDraft } from '@store/catalogueDraftStore';
import { formatPercent, formatShortDate } from '@utils/formatters';

/**
 * Owner-side deal presentation: which tab a deal belongs in, and the labels
 * its card shows. Pure, so the Deals & Promotions list, its tab counts and the
 * deal detail all agree on what "active" or "ended" means.
 */

const copy = strings.centralDeals;
const DAY_MS = 24 * 60 * 60 * 1000;

export type DealTab = 'active' | 'scheduled' | 'expired' | 'drafts';

function timeOf(iso?: string | null): number | null {
  if (!iso) return null;
  const at = new Date(iso).getTime();
  return Number.isNaN(at) ? null : at;
}

/**
 * Ended beats everything (a paused deal past its end date is history, not a
 * draft); then anything not `active` is a draft or paused deal; an active
 * deal that has not started yet is scheduled.
 */
export function dealTabFor(
  offer: Pick<BusinessOfferAdmin, 'status' | 'startDate' | 'endDate'>,
  now: Date = new Date(),
): DealTab {
  const end = timeOf(offer.endDate);
  if (end !== null && end < now.getTime()) return 'expired';
  if (offer.status !== 'active') return 'drafts';
  const start = timeOf(offer.startDate);
  if (start !== null && start > now.getTime()) return 'scheduled';
  return 'active';
}

export function dealDiscountLabel(offer: BusinessOfferAdmin): string {
  switch (offer.pricingType) {
    case 'percentage_discount':
      return copy.discountPercent(offer.discountValue ?? 0);
    case 'fixed_discount_amount':
      return copy.discountAmount(formatNaira(offer.discountValue ?? 0));
    case 'fixed_discount_price':
      return formatNaira(offer.fixedPrice ?? offer.calculatedPrice ?? 0);
    case 'sum':
      return copy.bundle;
    default:
      return offer.discountValue
        ? copy.discountPercent(offer.discountValue)
        : copy.bundle;
  }
}

/** "Ends in 6 days" · "Starts Oct 20" · "Ended Oct 2" · "Paused". */
export function dealStatusLine(
  offer: BusinessOfferAdmin,
  now: Date = new Date(),
): string {
  const tab = dealTabFor(offer, now);
  if (tab === 'expired') return copy.endedOn(formatShortDate(offer.endDate ?? ''));
  if (tab === 'drafts') return copy.paused;
  if (tab === 'scheduled') return copy.startsOn(formatShortDate(offer.startDate ?? ''));
  const end = timeOf(offer.endDate);
  if (end === null) return copy.noEndDate;
  const days = Math.ceil((end - now.getTime()) / DAY_MS);
  return days <= 0 ? copy.endsToday : copy.endsInDays(days);
}

/** "Oct 12 – Oct 20" · "From Oct 12" · "Runs until paused". */
export function dealScheduleLabel(offer: BusinessOfferAdmin): string {
  const start = offer.startDate ? formatShortDate(offer.startDate) : '';
  const end = offer.endDate ? formatShortDate(offer.endDate) : '';
  if (start && end) return copy.scheduleRange(start, end);
  if (start) return copy.scheduleFrom(start);
  if (end) return copy.scheduleUntil(end);
  return copy.noEndDate;
}

/** Branch names for a deal row; a grouped row lists every branch it runs at. */
export function dealBranchNames(offer: BusinessOfferAdmin): string[] {
  const grouped = (offer.branches ?? [])
    .map(branch => branch.branchName ?? '')
    .filter(Boolean);
  if (grouped.length) return grouped;
  return offer.branchName ? [offer.branchName] : [];
}

/** Admin row (ideally `groupBy=deal`) → the Deals & Promotions card. */
export function offerToCentralDealRow(
  offer: BusinessOfferAdmin,
  now: Date = new Date(),
): CentralDealRow {
  const claimed = offer.claimedCount ?? 0;
  const redeemed = offer.redeemedCount ?? 0;
  const cap = offer.quantity ?? offer.maxClaims ?? null;
  const percent = cap
    ? Math.min(100, Math.round((claimed / cap) * 100))
    : claimed
      ? Math.round((redeemed / claimed) * 100)
      : 0;
  const price = offer.calculatedPrice ?? 0;
  const original = offer.originalPrice ?? 0;
  const items = offer.items ?? [];
  const image = offer.mainImage ?? items.find(item => item.mainImage)?.mainImage ?? null;
  const tab = dealTabFor(offer, now);

  return {
    id: offer.id,
    dealGroupId: offer.dealGroupId ?? offer.id,
    title: offer.name ?? '',
    subtitle: items.length
      ? items.map(item => item.name).join(', ')
      : (offer.description ?? ''),
    discount: dealDiscountLabel(offer),
    wasPrice: original > price ? formatNaira(original) : '',
    price: price ? formatNaira(price) : '',
    branches: dealBranchNames(offer).join(', '),
    status: dealStatusLine(offer, now),
    schedule: dealScheduleLabel(offer),
    logistics: '',
    claims: claimed,
    redeemed,
    conversion: percent,
    percent,
    meterLabel: copy.claimsMeter(claimed, redeemed),
    meterValue: cap ? `${claimed}/${cap}` : `${percent}%`,
    tab,
    isPaused: offer.status !== 'active',
    image: image ? { uri: image, alt: offer.name ?? '' } : undefined,
  };
}

// ---------------------------------------------------------------------------
// Deal detail
// ---------------------------------------------------------------------------

const detailCopy = strings.dealPerformance;

export type DealPricingRole = 'original' | 'deal' | 'savings' | 'fee';

/** Everything the Deal Details screen renders, already formatted. */
export interface DealPerformanceView {
  title: string;
  eyebrow: string;
  statusLabel: string;
  discount: string;
  image?: { uri: string; alt: string };
  isPaused: boolean;
  /** False once the deal has ended — there is nothing left to end. */
  canEnd: boolean;
  pricingBadge: string;
  pricing: { role: DealPricingRole; label: string; value: string }[];
  windowLabel: string;
  daysLeft: string | null;
  metrics: { label: string; value: string; sub: string }[];
  rateValue: string;
  ratePercent: number;
  redeemedLabel: string;
  unclaimedLabel: string;
  itemsCount: string;
  items: {
    id: string;
    name: string;
    meta: string;
    qty: string;
    image?: { uri: string; alt: string };
  }[];
  capLabel: string;
  capValue: string;
  branchesCount: string;
  branches: { id: string; name: string; meta: string; price: string; active: boolean }[];
  copyFields: { eyebrow: string; body: string; kind: 'text' | 'steps' }[];
}

const STATUS_BY_TAB: Record<DealTab, string> = {
  active: detailCopy.statusLive,
  drafts: detailCopy.statusPaused,
  scheduled: detailCopy.statusScheduled,
  expired: detailCopy.statusEnded,
};

/**
 * A deal's admin row plus its group stats → the detail screen. The row gives
 * what the deal *is* (pricing, items, copy); the stats give how it is doing.
 * Either may still be loading, so missing numbers read as zero.
 */
export function toDealPerformanceView(
  row: BusinessOfferAdmin,
  stats: DealGroupStats | undefined,
  now: Date = new Date(),
): DealPerformanceView {
  const tab = dealTabFor(row, now);
  const price = row.calculatedPrice ?? 0;
  const original = row.originalPrice ?? 0;
  const saving = Math.max(0, original - price);
  const items = row.items ?? [];
  const claims = stats?.claims ?? row.claimedCount ?? 0;
  const redeemed = stats?.redeemed ?? row.redeemedCount ?? 0;
  const rate = stats?.redemptionRate ?? (claims ? redeemed / claims : 0);
  const quantity = row.quantity ?? null;
  const remaining =
    stats?.remaining ?? (quantity !== null ? Math.max(0, quantity - claims) : null);
  const image = row.mainImage ?? items.find(item => item.mainImage)?.mainImage ?? null;

  // Per-branch numbers come from stats; the price each branch charges, from the row.
  const priceByBranch = new Map(
    (row.branches ?? []).map(branch => [
      branch.branchId,
      branch.calculatedPrice ?? price,
    ]),
  );
  const branchRows = stats?.byBranch?.length
    ? stats.byBranch.map(branch => ({
        id: branch.branchId,
        name: branch.branchName ?? '',
        meta: detailCopy.branchClaims(branch.claims, branch.redeemed),
        price: formatNaira(priceByBranch.get(branch.branchId) ?? price),
        active: branch.status === 'active',
      }))
    : (row.branches ?? []).map(branch => ({
        id: branch.branchId,
        name: branch.branchName ?? '',
        meta: detailCopy.branchClaims(branch.claimedCount, branch.redeemedCount),
        price: formatNaira(branch.calculatedPrice ?? price),
        active: branch.status === 'active',
      }));
  const activeBranches = branchRows.filter(branch => branch.active).length;

  const claimSteps = (row.claimSteps ?? []).filter(Boolean);
  const terms = (row.terms ?? []).filter(term => !claimSteps.includes(term));
  const copyFields: DealPerformanceView['copyFields'] = [
    ...(row.description
      ? [
          {
            eyebrow: detailCopy.copyDescription,
            body: row.description,
            kind: 'text' as const,
          },
        ]
      : []),
    ...(terms.length
      ? [
          {
            eyebrow: detailCopy.copyTerms,
            body: terms.join('\n'),
            kind: 'steps' as const,
          },
        ]
      : []),
    ...(claimSteps.length
      ? [
          {
            eyebrow: detailCopy.copyClaimSteps,
            body: claimSteps.join('\n'),
            kind: 'steps' as const,
          },
        ]
      : []),
  ];

  return {
    title: row.name ?? '',
    eyebrow: dealBranchNames(row).join(' · '),
    statusLabel: STATUS_BY_TAB[tab],
    discount: dealDiscountLabel(row),
    image: image ? { uri: image, alt: row.name ?? '' } : undefined,
    isPaused: row.status !== 'active',
    canEnd: tab !== 'expired',
    pricingBadge: detailCopy.pricingBadges[row.pricingType ?? ''] ?? '',
    pricing: [
      ...(original > price
        ? [
            {
              role: 'original' as const,
              label: detailCopy.pricing[0].label,
              value: formatNaira(original),
            },
          ]
        : []),
      { role: 'deal', label: detailCopy.pricing[1].label, value: formatNaira(price) },
      ...(saving > 0
        ? [
            {
              role: 'savings' as const,
              label: detailCopy.pricing[2].label,
              value: detailCopy.savingsValue(
                Math.round((saving / original) * 100),
                formatNaira(saving),
              ),
            },
          ]
        : []),
      {
        role: 'fee',
        label: detailCopy.pricing[3].label,
        value: detailCopy.platformFeeValue,
      },
    ],
    windowLabel: dealScheduleLabel(row),
    daysLeft:
      tab === 'active' && stats?.daysLeft != null
        ? detailCopy.daysLeftValue(stats.daysLeft)
        : null,
    metrics: [
      {
        label: detailCopy.totalClaimed,
        value: String(claims),
        sub: detailCopy.claimsSub(
          stats?.views ?? (typeof row.views === 'number' ? row.views : 0),
        ),
      },
      {
        label: detailCopy.revenueGenerated,
        value: formatNaira(stats?.revenue ?? 0),
        sub: detailCopy.revenueSub,
      },
    ],
    rateValue: formatPercent(rate),
    ratePercent: Math.round(rate * 100),
    redeemedLabel: detailCopy.redeemedCount(redeemed),
    unclaimedLabel: detailCopy.unclaimedCount(
      stats?.activeUnclaimed ?? Math.max(0, claims - redeemed),
    ),
    itemsCount: detailCopy.itemsBundled(items.length),
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      meta: formatNaira(item.price),
      qty: detailCopy.itemQty,
      image: item.mainImage ? { uri: item.mainImage, alt: item.name } : undefined,
    })),
    capLabel: detailCopy.voucherCap,
    capValue:
      quantity !== null
        ? detailCopy.voucherCapValue(remaining ?? quantity, quantity)
        : detailCopy.voucherUncapped,
    branchesCount: detailCopy.branchesOf(activeBranches, branchRows.length),
    branches: branchRows,
    copyFields,
  };
}

// ---------------------------------------------------------------------------
// Create / edit wizard review (Step 4)
// ---------------------------------------------------------------------------

const reviewCopy = strings.businessCreateDeal.step4;

export interface DealReviewBranch {
  id: string;
  name: string;
  address?: string | null;
}

/** The wizard draft as it will publish, formatted for Step 4. */
export interface DealReviewView {
  title: string;
  body: string;
  image?: { uri: string; alt: string };
  discountBadge: string;
  strategySummary: string;
  /** Present only when the item price is known, so the maths is honest. */
  originalPrice?: string;
  memberPrice?: string;
  savings?: string;
  vouchers: string;
  vouchersNote: string;
  claimLimit: string;
  claimLimitNote: string;
  giftingTitle: string;
  giftingBody: string;
  branches: { id: string; name: string; address: string }[];
  branchesNote?: string;
  duration: string;
  durationNote: string;
  claimSteps: string[];
  terms: string[];
  /** Why the deal cannot launch yet; launch stays disabled while set. */
  blocker?: string;
}

/**
 * Step 4's content, from the same draft the publish sends. A deal with no
 * branch selection publishes to every branch, so the review lists them all.
 */
export function dealDraftToReview(
  draft: DealDraft,
  branches: DealReviewBranch[],
  now: Date = new Date(),
): DealReviewView {
  const isFixed = draft.strategy === 'fixed';
  const rate = draft.discountRate;
  const base = draft.basePrice;
  const memberPrice =
    base === undefined
      ? undefined
      : isFixed
        ? Math.max(0, base - rate)
        : Math.round(base * (1 - rate / 100));

  const vouchers = Number.parseInt(draft.totalVouchers ?? '', 10);
  const capped = Number.isFinite(vouchers) && vouchers > 0;

  const chosen = draft.branchIds.length
    ? branches.filter(branch => draft.branchIds.includes(branch.id))
    : branches;

  const startAt = timeOf(draft.startDate);
  const endAt = timeOf(draft.endDate);
  const startLabel = draft.startDate ? formatShortDate(draft.startDate) : '';
  const endLabel = draft.endDate ? formatShortDate(draft.endDate) : '';

  const hasItem = draft.itemIds.length > 0 || Boolean(draft.sourceProductId);

  return {
    title: draft.name.trim() || draft.sourceProductName || reviewCopy.untitledDeal,
    body: draft.description,
    image: draft.mainImage ? { uri: draft.mainImage, alt: draft.name } : undefined,
    discountBadge: isFixed
      ? copy.discountAmount(formatNaira(rate))
      : copy.discountPercent(rate),
    strategySummary: isFixed
      ? reviewCopy.fixedStrategy(formatNaira(rate))
      : reviewCopy.percentStrategy(rate),
    originalPrice: base === undefined ? undefined : formatNaira(base),
    memberPrice: memberPrice === undefined ? undefined : formatNaira(memberPrice),
    savings:
      base === undefined || memberPrice === undefined
        ? undefined
        : reviewCopy.instantSavingsOf(formatNaira(base - memberPrice)),
    vouchers: capped ? reviewCopy.vouchersCount(vouchers) : reviewCopy.vouchersUnlimited,
    vouchersNote: capped
      ? reviewCopy.vouchersCappedNote
      : reviewCopy.vouchersUnlimitedNote,
    claimLimit:
      draft.claimFrequency === 'once'
        ? reviewCopy.claimOnce
        : reviewCopy.claimMany(draft.maxClaimsPerMonth),
    claimLimitNote:
      draft.claimFrequency === 'once'
        ? reviewCopy.claimOnceNote
        : reviewCopy.claimManyNote,
    giftingTitle: draft.acceptGifting
      ? reviewCopy.giftingTitle
      : reviewCopy.giftingOffTitle,
    giftingBody: draft.acceptGifting ? reviewCopy.giftingBody : reviewCopy.giftingOffBody,
    branches: chosen.map(branch => ({
      id: branch.id,
      name: branch.name,
      address: branch.address ?? '',
    })),
    branchesNote: draft.branchIds.length
      ? undefined
      : reviewCopy.allBranchesNote(chosen.length),
    duration:
      endAt !== null
        ? reviewCopy.durationDays(
            Math.max(1, Math.ceil((endAt - (startAt ?? now.getTime())) / DAY_MS)),
          )
        : reviewCopy.durationOpen,
    durationNote:
      startLabel && endLabel
        ? copy.scheduleRange(startLabel, endLabel)
        : endLabel
          ? copy.scheduleUntil(endLabel)
          : startLabel
            ? copy.scheduleFrom(startLabel)
            : reviewCopy.durationOpenNote,
    claimSteps: draft.claimSteps.map(step => step.value.trim()).filter(Boolean),
    terms: draft.terms.map(term => term.trim()).filter(Boolean),
    blocker: !hasItem
      ? reviewCopy.noItemBlocker
      : chosen.length === 0
        ? reviewCopy.noBranchBlocker
        : undefined,
  };
}
