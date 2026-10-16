import { strings } from '@constants/strings';
import type {
  Segment,
  SegmentCriteria,
  SegmentCriteriaOptions,
  SegmentInsight,
} from '@api/segmentsApi';
import type { CustomerSegmentCard } from '@features/business/data/businessGrowthData';
import type { IconName } from '@components/ui/Icon';

/**
 * Live segments ↔ the segment screens. The builder (CreateCustomSegment) works
 * in criterion ids with a picked option per criterion; the API stores a
 * `SegmentCriteria` rule set. These mappers are the only place the two meet.
 */

const builderCopy = strings.campaignWizard.customSegment;
const liveCopy = strings.customerSegments.live;

/**
 * Builder criteria the API can evaluate. The others in the design ("saved but
 * not redeemed", district cluster, QR/chat interaction, loyalty points) have
 * no backing rule, so the live builder does not offer them.
 */
export const LIVE_SEGMENT_CRITERIA = [
  'claimed',
  'dishes',
  'ticket',
  'branch',
  'dormant',
] as const;
export type LiveSegmentCriterion = (typeof LIVE_SEGMENT_CRITERIA)[number];

/** "Has not visited" picker, in the order of its copy (30+, 60+, 90+ days). */
export const DORMANCY_DAYS = [30, 60, 90] as const;

/** "High average ticket spend (> ₦20,000)". */
export const HIGH_TICKET_MIN = 20_000;

export interface SegmentPickerOption {
  id: string;
  label: string;
}

/** Picker options per criterion, from `GET /segments/criteria-options`. */
export type SegmentPickerOptions = Partial<
  Record<LiveSegmentCriterion, readonly SegmentPickerOption[]>
>;

/** What the builder holds: ticked criteria and the option index picked for each. */
export interface SegmentBuilderSelection {
  criteria: readonly string[];
  pickers: Readonly<Record<string, number>>;
}

export function segmentPickerOptions(
  options?: SegmentCriteriaOptions,
): SegmentPickerOptions {
  const named = (rows: { id: string; name: string }[] = []) =>
    rows.map(row => ({ id: row.id, label: row.name }));
  return {
    claimed: named(options?.deals),
    dishes: named(options?.menuItems),
    branch: named(options?.branches),
    dormant: builderCopy.criteria
      .find(criterion => criterion.id === 'dormant')
      ?.picker?.map((label, index) => ({ id: String(DORMANCY_DAYS[index]), label })),
  };
}

function picked(
  selection: SegmentBuilderSelection,
  options: SegmentPickerOptions,
  criterion: LiveSegmentCriterion,
): SegmentPickerOption | undefined {
  return options[criterion]?.[selection.pickers[criterion] ?? 0];
}

/**
 * Builder selection → API rule set. A criterion whose picker has no options
 * (a business with no deals yet) is left out rather than sent empty, which
 * would match nobody.
 */
export function selectionToCriteria(
  selection: SegmentBuilderSelection,
  options: SegmentPickerOptions,
): SegmentCriteria {
  const on = (id: LiveSegmentCriterion) => selection.criteria.includes(id);
  const criteria: SegmentCriteria = {};

  const deal = on('claimed') ? picked(selection, options, 'claimed') : undefined;
  if (deal) criteria.deals = { offerIds: [deal.id] };

  const dish = on('dishes') ? picked(selection, options, 'dishes') : undefined;
  if (dish) criteria.menu = { itemIds: [dish.id] };

  const branch = on('branch') ? picked(selection, options, 'branch') : undefined;
  if (branch) criteria.location = { branchIds: [branch.id] };

  if (on('ticket')) criteria.spend = { minAverageTicket: HIGH_TICKET_MIN };

  if (on('dormant')) {
    criteria.recency = {
      notVisitedForDays:
        DORMANCY_DAYS[selection.pickers.dormant ?? 0] ?? DORMANCY_DAYS[0],
    };
  }
  return criteria;
}

/** API rule set → builder selection, so "Edit Rules" opens on what is saved. */
export function criteriaToSelection(
  criteria: SegmentCriteria | null | undefined,
  options: SegmentPickerOptions,
): SegmentBuilderSelection {
  const ids: string[] = [];
  const pickers: Record<string, number> = {};
  const pick = (criterion: LiveSegmentCriterion, id: string | undefined) => {
    ids.push(criterion);
    const index = options[criterion]?.findIndex(option => option.id === id) ?? -1;
    if (index > 0) pickers[criterion] = index;
  };

  if (criteria?.deals?.offerIds?.length) pick('claimed', criteria.deals.offerIds[0]);
  if (criteria?.menu?.itemIds.length) pick('dishes', criteria.menu.itemIds[0]);
  if (criteria?.location?.branchIds.length)
    pick('branch', criteria.location.branchIds[0]);
  if (criteria?.spend?.minAverageTicket !== undefined) ids.push('ticket');
  const dormantDays = criteria?.recency?.notVisitedForDays;
  if (dormantDays !== undefined) {
    ids.push('dormant');
    const index = DORMANCY_DAYS.findIndex(days => days === dormantDays);
    if (index > 0) pickers.dormant = index;
  }
  return { criteria: ids, pickers };
}

export function formatCount(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('en-NG');
}

export function formatNaira(value: number | null | undefined): string {
  return `₦${Math.round(value ?? 0).toLocaleString('en-NG')}`;
}

/** A fraction (0.184) as a signed percentage (`+18.4%`). */
export function formatDelta(fraction: number | null | undefined): string | undefined {
  if (fraction === null || fraction === undefined) return undefined;
  const percent = Math.round(fraction * 1000) / 10;
  return `${percent > 0 ? '+' : ''}${percent}%`;
}

/** Plain-language summary of a rule set, for a segment card's detail line. */
export function describeCriteria(criteria: SegmentCriteria | null | undefined): string {
  const parts: string[] = [];
  if (criteria?.deals) parts.push(liveCopy.rules.deals);
  if (criteria?.menu) parts.push(liveCopy.rules.menu);
  if (criteria?.location) parts.push(liveCopy.rules.location);
  if (criteria?.spend) parts.push(liveCopy.rules.spend);
  if (criteria?.recency) parts.push(liveCopy.rules.recency);
  return parts.length ? parts.join(' • ') : liveCopy.rules.everyone;
}

/** A live segment as a Customer Segments card. */
export function segmentToCard(segment: Segment): CustomerSegmentCard {
  const dynamic = segment.type === 'dynamic';
  return {
    id: segment.id,
    name: segment.name,
    detail: segment.description?.trim() || describeCriteria(segment.criteria),
    icon: dynamic ? 'autoAwesome' : 'group',
    iconTone: dynamic ? 'brand' : 'secondary',
    badge: dynamic ? liveCopy.dynamicBadge : liveCopy.staticBadge,
    badgeTone: dynamic ? 'brand' : 'neutral',
    size: formatCount(segment.size),
    sizeNote: strings.customerSegments.audiencePoolLabel,
    insight: dynamic ? describeCriteria(segment.criteria) : liveCopy.staticInsight,
    cta: liveCopy.cardCta,
  };
}

/** Everything SegmentAudienceDetails renders, live or from the prototype copy. */
export interface SegmentDetailsView {
  id: string;
  name: string;
  updated: string;
  hero: string;
  badge: string;
  body: string;
  tags: readonly string[];
  spend: string;
  spendDelta?: string;
  aov: string;
  aovDelta?: string;
  aovNote?: string;
  frequency: string;
  frequencyNote: string;
  branchesMeta: string;
  branches: readonly { id: string; label: string; percent: number }[];
  channels: readonly {
    id: string;
    label: string;
    value: string;
    percent: number;
    icon: IconName;
  }[];
  privacyTitle?: string;
  favourites: readonly { id: string; name: string; meta: string; count: string }[];
  sampleMeta: string;
  patrons: readonly {
    id: string;
    initials: string;
    name: string;
    tier?: string;
    meta: string;
  }[];
}

function share(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function initialsOf(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '');
  return letters.join('') || '?';
}

/** "12m ago" / "3h ago" / "2d ago" from an ISO timestamp. */
export function relativeAgo(iso: string, now: number = Date.now()): string {
  const copy = liveCopy.details;
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (!Number.isFinite(minutes) || minutes < 1) return copy.justNow;
  if (minutes < 60) return copy.minutesAgo(minutes);
  const hours = Math.round(minutes / 60);
  if (hours < 24) return copy.hoursAgo(hours);
  return copy.daysAgo(Math.round(hours / 24));
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export function insightToDetailsView(
  insight: SegmentInsight,
  segment?: Pick<Segment, 'description' | 'criteria' | 'lastComputedAt'>,
  now: number = Date.now(),
): SegmentDetailsView {
  const detailsCopy = liveCopy.details;
  const typeLabel =
    insight.type === 'dynamic' ? liveCopy.dynamicBadge : liveCopy.staticBadge;
  const channel = (
    id: string,
    label: string,
    icon: IconName,
    reachable: number,
  ): SegmentDetailsView['channels'][number] => ({
    id,
    label,
    icon,
    value: `${formatCount(reachable)} / ${formatCount(insight.size)} (${share(reachable, insight.size)}%)`,
    percent: share(reachable, insight.size),
  });

  return {
    id: insight.segmentId,
    name: insight.name,
    updated: detailsCopy.updated(
      relativeAgo(segment?.lastComputedAt ?? new Date(now).toISOString(), now),
    ),
    hero: detailsCopy.size(insight.size),
    badge: typeLabel,
    body:
      segment?.description?.trim() ||
      (insight.type === 'dynamic'
        ? describeCriteria(segment?.criteria)
        : liveCopy.staticInsight),
    tags: [typeLabel],
    spend: formatNaira(insight.totalSpend),
    spendDelta: formatDelta(insight.spendDelta),
    aov: formatNaira(insight.avgOrderValue),
    aovDelta: formatDelta(insight.aovDelta),
    frequency: detailsCopy.frequency(insight.visitFrequency),
    frequencyNote: detailsCopy.frequencyNote,
    branchesMeta: insight.branchSplit.length
      ? detailsCopy.branchesMeta
      : detailsCopy.emptyBranches,
    branches: insight.branchSplit.map(branch => ({
      id: branch.branchId,
      label: `${branch.name} (${branch.percent}%)`,
      percent: branch.percent,
    })),
    channels: [
      channel(
        'push',
        detailsCopy.channels.push,
        'notificationsActive',
        insight.reachableByPush,
      ),
      channel('sms', detailsCopy.channels.sms, 'message', insight.reachableBySms),
      channel('email', detailsCopy.channels.email, 'mail', insight.reachableByEmail),
    ],
    favourites: insight.favourites.map(item => ({
      id: item.itemId,
      name: item.name,
      meta: '',
      count: formatCount(item.orders),
    })),
    sampleMeta: detailsCopy.sampleMeta(insight.samplePatrons.length, insight.size),
    patrons: insight.samplePatrons.map(patron => ({
      id: patron.userId,
      initials: initialsOf(patron.name),
      name: patron.name,
      meta: detailsCopy.patronMeta(
        formatNaira(patron.spend),
        patron.lastVisit ? shortDate(patron.lastVisit) : undefined,
      ),
    })),
  };
}
