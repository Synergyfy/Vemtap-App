import { strings } from '@constants/strings';
import type {
  Promotion,
  PromotionEligibleAsset,
  PromotionStatus,
  SavePromotionInput,
} from '@api/promotionsApi';
import type { IconName } from '@components/ui/Icon';
import type {
  CampaignCard,
  CampaignStatus,
} from '@features/business/data/businessGrowthData';
import type { CampaignDraft } from '@store/campaignDraftStore';

/**
 * The Create Campaign wizard and hub ↔ `/promotions`. The wizard keeps its own
 * ids; the API uses the same ones for objectives, cohorts and dayparting
 * windows, so only weekdays, the budget and the name need translating.
 */

const wizard = strings.campaignWizard;
const hubCopy = strings.campaignsHub.live;

/** Wizard weekday ids → the API's `0 = Sunday … 6 = Saturday`. */
export const WEEKDAY_NUMBER: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function objectiveTitle(
  objectiveId: string | null | undefined,
): string | undefined {
  return wizard.step1.objectives.find(option => option.id === objectiveId)?.title;
}

/**
 * The wizard never asks for a name, but a campaign cannot launch without one:
 * name it after its objective and lead asset, e.g. "Promote a Deal: Lunch Combo".
 */
export function campaignName(
  draft: Pick<CampaignDraft, 'objectiveId' | 'assets'>,
): string {
  const objective = objectiveTitle(draft.objectiveId) ?? hubCopy.untitled;
  const lead = draft.assets[0]?.title;
  return lead ? `${objective}: ${lead}` : objective;
}

/** The whole draft as a `SaveCampaignDto` (create, or patch every step). */
export function draftToSaveInput(draft: CampaignDraft): SavePromotionInput {
  const segments = draft.strategy === 'segments';
  return {
    name: campaignName(draft),
    objective: draft.objectiveId,
    assets: draft.assets.map(({ type, id }) => ({ type, id })),
    audience: {
      strategy: draft.strategy,
      cohorts: segments ? draft.cohorts : [],
      segmentIds: segments ? draft.segmentIds : [],
      branchIds: draft.branchIds,
      radiusKm: draft.radiusKm,
    },
    schedule: {
      durationDays: draft.durationDays,
      instantLaunch: draft.instantLaunch,
      dayparting: draft.dayparting,
      windows: draft.dayparting ? draft.windows : [],
      weekdays: draft.weekdays
        .map(day => WEEKDAY_NUMBER[day])
        .filter((day): day is number => day !== undefined),
      autoRenew: draft.autoRenew,
    },
    budgetMode: draft.budgetMode,
    ...(draft.budgetMode === 'daily'
      ? { dailyBudget: Math.round(draft.total / Math.max(1, draft.durationDays)) }
      : { budget: draft.total }),
  };
}

export function formatNaira(value: number | null | undefined): string {
  return `₦${Math.round(value ?? 0).toLocaleString('en-NG')}`;
}

/** An eligible asset as a content-step card. */
export interface CampaignContentItem {
  id: string;
  type: PromotionEligibleAsset['type'];
  group: 'deals' | 'products' | 'services' | 'profile';
  title: string;
  eyebrow: string;
  badge: string;
  body: string;
  price: string;
  was: string;
  performance: string;
  icon: IconName;
  location: string;
}

const ASSET_GROUP: Record<PromotionEligibleAsset['type'], CampaignContentItem['group']> =
  {
    deal: 'deals',
    product: 'products',
    service: 'services',
    profile: 'profile',
  };

export function eligibleAssetToContentItem(
  asset: PromotionEligibleAsset,
): CampaignContentItem {
  const labels = hubCopy.assetTypes[asset.type];
  return {
    id: asset.id,
    type: asset.type,
    group: ASSET_GROUP[asset.type],
    title: asset.title,
    eyebrow: labels.eyebrow,
    badge: labels.badge,
    body: '',
    price:
      asset.price === null || asset.price === undefined ? '' : formatNaira(asset.price),
    was:
      asset.wasPrice &&
      asset.price !== null &&
      asset.price !== undefined &&
      asset.wasPrice > asset.price
        ? formatNaira(asset.wasPrice)
        : '',
    performance: asset.priorClaims ? hubCopy.priorClaims(asset.priorClaims) : '',
    icon: 'trendingUp',
    location: '',
  };
}

/** API status → the hub's three tabs plus the two states only live data has. */
export function hubStatus(status: PromotionStatus): CampaignStatus {
  switch (status) {
    case 'Active':
      return 'live';
    case 'Pending':
      return 'scheduled';
    case 'Paused':
      return 'paused';
    case 'Draft':
      return 'draft';
    default:
      return 'completed';
  }
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function daysLeft(endIso: string, now: number): number {
  return Math.max(0, Math.ceil((new Date(endIso).getTime() - now) / 86_400_000));
}

function statusLabel(promotion: Promotion, now: number): string {
  switch (promotion.status) {
    case 'Active':
      return promotion.endDate
        ? hubCopy.status.activeLeft(daysLeft(promotion.endDate, now))
        : hubCopy.status.active;
    case 'Pending':
      return promotion.awaitingPayment
        ? hubCopy.status.awaitingPayment
        : promotion.startDate
          ? hubCopy.status.scheduledFor(shortDate(promotion.startDate))
          : hubCopy.status.scheduled;
    case 'Paused':
      return hubCopy.status.paused;
    case 'Draft':
      return hubCopy.status.draft;
    default:
      return promotion.endDate
        ? hubCopy.status.endedOn(shortDate(promotion.endDate))
        : hubCopy.status.ended;
  }
}

function audienceLabel(promotion: Promotion): string {
  const audience = promotion.audience ?? {};
  const radius = audience.radiusKm ?? 3;
  const segments = (audience.segmentIds?.length ?? 0) + (audience.cohorts?.length ?? 0);
  return audience.strategy === 'segments' && segments
    ? hubCopy.audienceSegments(segments, radius)
    : hubCopy.audienceNearby(radius);
}

const STATUS_ICON: Record<CampaignStatus, IconName> = {
  live: 'timelapse',
  scheduled: 'calendarTask',
  completed: 'checkBold',
  paused: 'pauseCircle',
  draft: 'edit',
};

/** A live promotion as a Campaigns hub card. */
export function promotionToCampaignCard(
  promotion: Promotion,
  now: number = Date.now(),
): CampaignCard {
  const status = hubStatus(promotion.status);
  const assets = promotion.assets.length;
  const stats =
    promotion.launchedAt !== null && promotion.launchedAt !== undefined
      ? [
          {
            label: hubCopy.stats.reach,
            value: (promotion.impressions ?? 0).toLocaleString('en-NG'),
          },
          {
            label: hubCopy.stats.taps,
            value: (promotion.clicks ?? 0).toLocaleString('en-NG'),
          },
          {
            label: hubCopy.stats.spent,
            value: formatNaira(promotion.spent),
            note: hubCopy.stats.of(formatNaira(promotion.budget)),
          },
        ]
      : [];
  return {
    id: promotion.id,
    name: promotion.name,
    offer: [objectiveTitle(promotion.objective), hubCopy.assetCount(assets)]
      .filter(Boolean)
      .join(' • '),
    status,
    statusLabel: statusLabel(promotion, now),
    icon: STATUS_ICON[status],
    iconTone: status === 'live' ? 'success' : status === 'draft' ? 'secondary' : 'brand',
    audience: audienceLabel(promotion),
    audienceNote: '',
    stats,
    cta:
      status === 'live'
        ? strings.campaignsHub.pauseCta
        : status === 'paused'
          ? hubCopy.resumeCta
          : undefined,
  };
}

/** `6,000` → `6k`, `9,500` → `9.5k`; small numbers stay as they are. */
export function compactCount(value: number): string {
  if (value < 1000) return value.toLocaleString('en-NG');
  const thousands = value / 1000;
  return `${thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10}k`;
}

/** An estimate band, e.g. `6k – 9.5k`. */
export function estimateRange(min: number, max: number): string {
  return min === max ? compactCount(min) : `${compactCount(min)} – ${compactCount(max)}`;
}

/** Campaigns as ledger rows, in `strings.campaignsHub.live.ledger.headers` order. */
export function promotionsToLedgerRows(promotions: readonly Promotion[]) {
  const day = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '');
  return promotions.map(promotion => [
    promotion.name,
    promotion.status,
    objectiveTitle(promotion.objective) ?? promotion.objective ?? '',
    day(promotion.startDate),
    day(promotion.endDate),
    promotion.budget,
    promotion.spent,
    promotion.remaining,
    promotion.impressions ?? 0,
    promotion.clicks ?? 0,
    promotion.conversions ?? 0,
    promotion.fundingSource ?? '',
  ]);
}

/** The push notification a campaign sends, from its lead listing. */
export function promotionPushPreview(
  promotion: Promotion,
  asset: PromotionEligibleAsset | undefined,
  businessName: string,
): { title: string; body: string } {
  const copy = strings.boostWizard.live;
  const distance = strings.boostEngine.live.previewDistance(
    promotion.audience?.radiusKm ?? 3,
  );
  const price = asset?.price ?? undefined;
  const discount =
    asset?.wasPrice && price && asset.wasPrice > price
      ? `${Math.round((1 - price / asset.wasPrice) * 100)}% OFF`
      : undefined;
  return {
    title: copy.pushTitle(discount, businessName),
    body: copy.pushBody(
      asset?.title ?? promotion.name,
      price !== undefined ? formatNaira(price) : undefined,
      distance,
    ),
  };
}
