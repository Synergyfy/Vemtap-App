import type {
  DiscoveryPresence,
  NetworkSummary,
  NetworkTier,
  ReferralCard,
  ReferralDetail,
  ReferralStatus,
  ReferralsPage,
} from '@api/businessNetworkApi';
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';
import { formatShortDate } from '@utils/formatters';
import { count, deltaView, naira } from './analyticsMappers';
import { initials } from './posMappers';

const intro = strings.businessNetworkIntroHub;
const mine = strings.myBusinessNetwork;
const ladder = strings.networkMilestones;
const refs = strings.myReferrals;
const detailCopy = strings.referralDetail;

const TIER_ICON: Record<string, IconName> = {
  starter: 'checkBold',
  partner: 'workspacePremium',
  community: 'groupNetwork',
  builder: 'domainAdd',
};

export const REFERRAL_TONE: Record<
  ReferralStatus,
  'success' | 'brand' | 'neutral' | 'warning'
> = {
  verified: 'success',
  pending: 'warning',
  registered: 'brand',
  notQualified: 'neutral',
};

const REFERRAL_ICON: Record<ReferralStatus, IconName> = {
  verified: 'checkCircle',
  pending: 'hourglass',
  registered: 'storefront',
  notQualified: 'block',
};

/** `https://vemtap.com/get-started?ref=X` → `vemtap.com/get-started?ref=X`. */
export const displayLink = (url: string) => url.replace(/^https?:\/\//, '');

export interface MilestoneCardView {
  id: string;
  name: string;
  threshold: string;
  state: NetworkTier['state'];
  icon: IconName;
  tierNote?: string;
  progressNote?: string;
  percent: number;
  verifiedCaption?: string;
  perks: { text: string }[];
}

export function toMilestoneCards(summary: NetworkSummary): MilestoneCardView[] {
  const { verified } = summary.counts;
  return summary.tiers.map(tier => ({
    id: tier.id,
    name: tier.name,
    threshold: ladder.threshold(tier.threshold),
    state: tier.state,
    icon: TIER_ICON[tier.id] ?? 'workspacePremium',
    tierNote:
      tier.state === 'active' ? ladder.activeNote(verified, tier.threshold) : undefined,
    progressNote:
      tier.state === 'locked' ? ladder.remainingNote(tier.remaining) : undefined,
    percent: Math.round(tier.progress * 100),
    verifiedCaption:
      tier.state === 'locked'
        ? ladder.verifiedCaption(verified, tier.threshold)
        : undefined,
    perks: tier.perks.map(text => ({ text })),
  }));
}

export interface GrowthSummaryView {
  verifiedCount: string;
  tierName: string;
  nextTierName: string;
  remaining: string;
  remainingTotal: string;
  percent: number;
  nextMilestoneBody: string;
}

export function toGrowthSummary(summary: NetworkSummary): GrowthSummaryView {
  const { next } = summary;
  return {
    verifiedCount: count(summary.counts.verified),
    tierName: summary.current?.name ?? mine.noTier,
    nextTierName: next?.name ?? summary.current?.name ?? '',
    remaining: count(next?.remaining ?? 0),
    remainingTotal: count(next?.threshold ?? summary.counts.verified),
    percent: Math.round((next?.progress ?? 1) * 100),
    nextMilestoneBody: next
      ? mine.nextMilestoneBody(next.remaining, next.name)
      : mine.topTierBody,
  };
}

export interface ReferralRowView {
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  meta: string;
  status: string;
  statusKey: ReferralStatus;
  tone: (typeof REFERRAL_TONE)[ReferralStatus];
  icon: IconName;
}

export function toReferralRow(card: ReferralCard): ReferralRowView {
  return {
    id: card.id,
    name: card.name,
    initials: initials(card.name),
    subtitle: [card.category, card.location].filter(Boolean).join(' • '),
    meta:
      card.status === 'verified' && card.verifiedAt
        ? refs.verifiedOn(formatShortDate(card.verifiedAt))
        : refs.joined(formatShortDate(card.joinedAt)),
    status: refs.statusLabel[card.status],
    statusKey: card.status,
    tone: REFERRAL_TONE[card.status],
    icon: REFERRAL_ICON[card.status],
  };
}

export interface NetworkHubView {
  referralLink: string;
  displayLink: string;
  verified: number;
  milestones: MilestoneCardView[];
  growth: GrowthSummaryView;
  recent: ReferralRowView[];
  total: number;
  nearby: { id: string; name: string; category: string; distance: string }[];
  nearbyTotal: string;
  nearbyKm: string;
  networkValue: string;
  tierName: string;
  milestoneBody: string;
  milestoneHighlight: string;
}

export function toNetworkHubView(summary: NetworkSummary): NetworkHubView {
  const km = (meters: number) => (meters / 1000).toFixed(1).replace(/\.0$/, '');
  return {
    referralLink: summary.referralLink,
    displayLink: displayLink(summary.referralLink),
    verified: summary.counts.verified,
    milestones: toMilestoneCards(summary),
    growth: toGrowthSummary(summary),
    recent: summary.recent.map(toReferralRow),
    total: summary.counts.total,
    nearby: summary.nearby.merchants.map(merchant => ({
      id: merchant.branchId,
      name: merchant.businessName || merchant.name,
      category: merchant.category ?? '',
      distance: intro.distance(km(merchant.distanceMeters)),
    })),
    nearbyTotal: count(summary.nearby.total),
    nearbyKm: km(summary.nearby.radiusMeters),
    networkValue: intro.networkValue(summary.counts.verified),
    tierName: summary.current?.name ?? intro.noTier,
    milestoneBody: summary.next
      ? intro.milestoneBody(summary.next.remaining)
      : intro.milestoneTop,
    milestoneHighlight: summary.next?.name ?? summary.current?.name ?? '',
  };
}

export interface ReferralsView {
  rows: ReferralRowView[];
  results: string;
  filters: { key: 'all' | ReferralStatus; label: string; count: string }[];
  verified: string;
  totalLine: string;
  conversion: string;
  tierLine: string;
}

export function toReferralsView(
  page: ReferralsPage,
  summary?: NetworkSummary,
): ReferralsView {
  const counts = page.meta.statusCounts;
  const keys = ['all', 'verified', 'pending', 'registered', 'notQualified'] as const;
  return {
    rows: page.data.map(toReferralRow),
    results: refs.resultsLabel.replace('{count}', count(page.total)),
    filters: keys.map(key => ({
      key,
      label: refs.filters[key],
      count: count(counts[key]),
    })),
    verified: count(summary?.counts.verified ?? counts.verified),
    totalLine: refs.growthTotal.replace(
      '{total}',
      count(summary?.counts.total ?? counts.all),
    ),
    conversion: refs.growthConversion.replace(
      '{percent}',
      String(Math.round((summary?.conversionRate ?? 0) * 100)),
    ),
    tierLine: summary?.next
      ? refs.tierRemaining(summary.next.remaining, summary.next.name)
      : refs.topTier,
  };
}

export interface ReferralDetailView {
  id: string;
  name: string;
  initials: string;
  code: string;
  status: string;
  tone: (typeof REFERRAL_TONE)[ReferralStatus];
  subtitle: string;
  referredOn: string;
  creditedTo: string;
  milestone: string;
  verificationTitle: string;
  verificationBody: string;
  verified: boolean;
  timelineSummary: string;
  timeline: { id: string; label: string; when: string; done: boolean }[];
}

export function toReferralDetailView(detail: ReferralDetail): ReferralDetailView {
  const done = detail.timeline.filter(step => step.done).length;
  const verified = detail.status === 'verified';
  return {
    id: detail.id,
    name: detail.name,
    initials: initials(detail.name),
    code: `#${detail.code}`,
    status: refs.statusLabel[detail.status],
    tone: REFERRAL_TONE[detail.status],
    subtitle: [detail.category, detail.location].filter(Boolean).join(' • '),
    referredOn: formatShortDate(detail.joinedAt),
    creditedTo: detail.creditedTo.name,
    milestone: detail.countsTowardMilestone
      ? detailCopy.milestoneYes
      : detailCopy.milestoneNo,
    verificationTitle: verified
      ? detailCopy.verificationTitle
      : detailCopy.verificationPending,
    verificationBody:
      verified && detail.verifiedAt
        ? detailCopy.verificationBody(formatShortDate(detail.verifiedAt))
        : detailCopy.verificationPendingBody,
    verified,
    timelineSummary:
      done === detail.timeline.length
        ? detailCopy.timelineDone
        : detailCopy.timelineProgress(done, detail.timeline.length),
    timeline: detail.timeline.map(step => ({
      id: step.id,
      label: detailCopy.timelineSteps[step.id] ?? step.id,
      when: step.at ? formatShortDate(step.at) : detailCopy.timelinePendingStep,
      done: step.done,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Discovery presence                                                         */
/* -------------------------------------------------------------------------- */

export interface DiscoveryView {
  branchId: string;
  businessName: string;
  statusSub: string;
  live: boolean;
  health: { score: string; badge: string; missing: string[] };
  stats: { id: string; label: string; value: string; note: string; icon: IconName }[];
  card: {
    name: string;
    deal: string | null;
    dealName: string | null;
    locality: string;
    rating: number | null;
    reviews: string;
    category: string;
    imageUri: string | null;
  };
  index: { id: string; label: string; value: string; icon: IconName }[];
  zones: { id: string; label: string; area: string; active: boolean }[];
  controls: {
    id: keyof DiscoveryPresence['settings'];
    title: string;
    body: string;
    icon: IconName;
    enabled: boolean;
  }[];
}

const CONTROL_ICON: Record<keyof DiscoveryPresence['settings'], IconName> = {
  joinDiscoveryNetwork: 'nearMe',
  receivePartnerRequests: 'groupNetwork',
  allowPromotions: 'percentBadge',
  pushNotifications: 'notificationsActive',
  smsAlerts: 'sms',
  emailSummary: 'mail',
};

export function toDiscoveryView(presence: DiscoveryPresence): DiscoveryView {
  const copy = strings.businessDiscoveryFeed;
  const { score } = presence.health;
  const live = presence.settings.joinDiscoveryNetwork;
  const deal = presence.card.topDeal;
  const dealLabel = deal
    ? deal.discountValue && /percent/i.test(deal.pricingType ?? '')
      ? strings.businessIntelligence.deals.percentOff(String(deal.discountValue))
      : deal.price
        ? naira(deal.price)
        : null
    : null;
  const engagement = deltaView(presence.engagement);
  return {
    branchId: presence.branch.id,
    businessName: presence.card.name,
    statusSub: live ? copy.statusLive : copy.statusHidden,
    live,
    health: {
      score: String(score),
      badge:
        score >= 80
          ? copy.healthExcellent
          : score >= 50
            ? copy.healthGood
            : copy.healthLow,
      missing: Object.entries(presence.health.checks)
        .filter(([, passed]) => !passed)
        .map(([key]) => copy.checks[key] ?? key),
    },
    stats: [
      {
        id: 'engagement',
        label: copy.stats.engagement,
        value: count(presence.engagement.current),
        note: engagement.label,
        icon: 'insights',
      },
      {
        id: 'deals',
        label: copy.stats.deals,
        value: count(presence.index.liveDeals),
        note: copy.stats.dealsNote,
        icon: 'localOffer',
      },
      {
        id: 'rating',
        label: copy.stats.rating,
        value: presence.card.rating != null ? String(presence.card.rating) : '—',
        note: copy.stats.reviews(count(presence.card.reviews)),
        icon: 'grade',
      },
    ],
    card: {
      name: presence.card.name,
      deal: dealLabel,
      dealName: deal?.name ?? null,
      locality: presence.card.locality ?? '',
      rating: presence.card.rating,
      reviews: count(presence.card.reviews),
      category: presence.card.category ?? '',
      imageUri: presence.card.coverImage ?? presence.card.logoUrl,
    },
    index: [
      {
        id: 'catalogue',
        label: copy.indexRows.catalogue,
        value: count(presence.index.catalogueItems),
        icon: 'catalog',
      },
      {
        id: 'services',
        label: copy.indexRows.services,
        value: count(presence.index.bookableServices),
        icon: 'calendar',
      },
      {
        id: 'deals',
        label: copy.indexRows.deals,
        value: count(presence.index.liveDeals),
        icon: 'localOffer',
      },
      {
        id: 'hours',
        label: copy.indexRows.hours,
        value: presence.index.hoursSet ? copy.indexRows.synced : copy.indexRows.missing,
        icon: 'schedule',
      },
    ],
    zones: presence.zones.map(zone => ({
      id: zone.id,
      label: zone.name,
      area: zone.area ?? '',
      active: zone.active,
    })),
    controls: (Object.keys(CONTROL_ICON) as (keyof DiscoveryPresence['settings'])[]).map(
      id => ({
        id,
        title: copy.controls[id].title,
        body: copy.controls[id].body,
        icon: CONTROL_ICON[id],
        enabled: presence.settings[id],
      }),
    ),
  };
}
