/**
 * Fixture data for the growth surfaces (campaigns, segments, boost engine) and
 * the QR/discovery surfaces (Master QR, location scan points, feed health).
 * Screens read from here so campaign cards, cohorts, budget tiers, scan points
 * and feed cards are never inlined twice.
 */
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = {
  campaigns: strings.campaignsHub,
  segments: strings.customerSegments,
  boost: strings.boostEngine,
  qr: strings.businessQr,
  locationQr: strings.locationQr,
  discovery: strings.businessDiscoveryFeed,
} as const;

/* -------------------------------------------------------------------------- */
/* Shared sub-tab strips                                                      */
/* -------------------------------------------------------------------------- */

export const growthSubTabs = [...copy.campaigns.subTabs] as const;
export const qrSubTabs = [...copy.qr.subTabs] as const;

export const growthSubTabIcon: Record<(typeof growthSubTabs)[number], IconName> = {
  Campaigns: 'campaign',
  Boost: 'bolt',
  Segments: 'group',
  Insights: 'insights',
};

export const qrSubTabIcon: Record<(typeof qrSubTabs)[number], IconName> = {
  Campaigns: 'campaign',
  'QR & Tap': 'qrCodeScanner',
  Analytics: 'monitoring',
  Hub: 'appsHub',
};

/* -------------------------------------------------------------------------- */
/* Campaigns hub                                                              */
/* -------------------------------------------------------------------------- */

export interface CampaignLiveStat {
  label: string;
  value: string;
  note?: string;
}

/** `paused` and `draft` only occur on live campaigns from `/promotions`. */
export type CampaignStatus = 'live' | 'scheduled' | 'completed' | 'paused' | 'draft';

export interface CampaignCard {
  id: string;
  name: string;
  offer: string;
  status: CampaignStatus;
  statusLabel: string;
  icon: IconName;
  iconTone: 'brand' | 'success' | 'tertiary' | 'secondary';
  audience: string;
  audienceNote: string;
  stats: readonly CampaignLiveStat[];
  /** Present on live campaigns only. */
  cta?: string;
  /** Present on scheduled campaigns only. */
  scheduleNote?: string;
  channelLabel?: string;
  channelIcon?: IconName;
}

const statusPill: Record<
  CampaignStatus,
  { tone: 'success' | 'brand' | 'neutral'; icon: IconName }
> = {
  live: { tone: 'success', icon: 'timelapse' },
  scheduled: { tone: 'brand', icon: 'calendarTask' },
  completed: { tone: 'neutral', icon: 'checkBold' },
  paused: { tone: 'neutral', icon: 'pauseCircle' },
  draft: { tone: 'neutral', icon: 'edit' },
};

export const campaignStatusMeta = statusPill;

export const campaigns: readonly CampaignCard[] = [
  {
    id: 'happy-hour',
    name: 'Friday Happy Hour Flash Rush',
    offer: 'Buy 1 Mojito Get 1 50% Off',
    status: 'live',
    statusLabel: 'Active • 4h Left',
    icon: 'timelapse',
    iconTone: 'tertiary',
    audience: '1,840 Nearby Foodies (3km radius)',
    audienceNote: 'Hyperlocal radius audience',
    channelLabel: copy.campaigns.channelLabels.push,
    channelIcon: 'notificationsActive',
    stats: [
      { label: copy.campaigns.stats.claimLabel, value: '184' },
      { label: copy.campaigns.stats.redeemLabel, value: '86' },
      { label: copy.campaigns.stats.rateLabel, value: '46.7%' },
    ],
    cta: copy.campaigns.pauseCta,
  },
  {
    id: 'loyalty-blast',
    name: 'Loyalty Blast',
    offer: 'VIP Patron Appreciation Week',
    status: 'live',
    statusLabel: 'Active • 5 Days Left',
    icon: 'verified',
    iconTone: 'brand',
    audience: '76 VIP Patrons (Top 5% Spenders)',
    audienceNote: 'Loyalty VIPs converted',
    channelLabel: copy.campaigns.channelLabels.push,
    channelIcon: 'notificationsActive',
    stats: [
      { label: copy.campaigns.stats.claimLabel, value: '52' },
      { label: 'Incremental GMV', value: '₦342,000' },
    ],
    cta: copy.campaigns.pauseCta,
  },
  {
    id: 'sunday-brunch',
    name: 'Sunday Family Brunch Special',
    offer: 'Free Dessert with Steak Course',
    status: 'scheduled',
    statusLabel: 'Scheduled for Oct 20, 9:00 AM',
    icon: 'calendarTask',
    iconTone: 'success',
    audience: 'Family Diners & Weekend Regulars (420 patrons)',
    audienceNote: 'Targeting',
    channelLabel: copy.campaigns.channelLabels.sms,
    channelIcon: 'markEmailUnread',
    stats: [],
  },
] as const;

export const campaignRetention = {
  id: 'retention-playbook',
  icon: 'personAlert' as IconName,
  title: copy.campaigns.playbookTitle,
  subtitle: copy.campaigns.playbookSubtitle,
  body: copy.campaigns.playbookBody,
  offer: '"We Miss You" 15% Off',
  value: '~₦450,000 footfall',
} as const;

/* -------------------------------------------------------------------------- */
/* Customer segments                                                          */
/* -------------------------------------------------------------------------- */

export interface CustomerSegmentCard {
  id: string;
  name: string;
  detail: string;
  icon: IconName;
  iconTone: 'brand' | 'success' | 'tertiary' | 'secondary';
  badge: string;
  badgeTone: 'brand' | 'success' | 'tertiary' | 'neutral';
  size: string;
  sizeNote?: string;
  aov?: string;
  generatesLabel?: string;
  generatesNote?: string;
  insight: string;
  cta: string;
  trendDown?: boolean;
}

export const customerSegments: readonly CustomerSegmentCard[] = [
  {
    id: 'vip',
    name: 'VIP Patrons (Top 5%)',
    detail: '₦150k+ spend • 12+ lifetime visits',
    icon: 'crown',
    iconTone: 'brand',
    badge: 'Highest LTV',
    badgeTone: 'brand',
    size: '92',
    sizeNote: copy.segments.footfallUnit,
    aov: '₦14,200',
    generatesLabel: copy.segments.generatesLabel,
    generatesNote: '58% of Gross Revenue (₦13.8M)',
    insight: copy.segments.welcomeCta,
    cta: 'Create VIP Campaign',
  },
  {
    id: 'regulars',
    name: 'Regular Diners',
    detail: '3–5 visits every 30 days',
    icon: 'restaurant',
    iconTone: 'success',
    badge: 'Core Engine',
    badgeTone: 'brand',
    size: '482',
    sizeNote: copy.segments.audiencePoolLabel,
    insight: 'Prefers Lunch Combos & Weekend Dinners',
    cta: 'Reward Loyalty',
  },
  {
    id: 'explorers',
    name: 'Deal Explorers',
    detail: 'Voucher driven • 1–2 lifetime visits',
    icon: 'percentBadge',
    iconTone: 'tertiary',
    badge: 'Deal Sensitive',
    badgeTone: 'tertiary',
    size: '640',
    sizeNote: copy.segments.audiencePoolLabel,
    insight: '74% claim rate when discount ≥ 20%',
    cta: 'Send Flash Deal',
  },
  {
    id: 'at-risk',
    name: 'At-Risk / Lapsed',
    detail: 'No recorded check-in in 45+ days',
    icon: 'historyOff',
    iconTone: 'secondary',
    badge: 'Re-engage',
    badgeTone: 'neutral',
    size: '124',
    sizeNote: 'Dormant Cohort',
    generatesLabel: 'Trend',
    generatesNote: '₦950k estimated lost monthly spend',
    insight: copy.segments.winBackCta,
    cta: copy.segments.winBackCta,
    trendDown: true,
  },
  {
    id: 'new-walkins',
    name: 'New Walk-ins (This Month)',
    detail: 'Discovered via VEMTAP Discovery Feed',
    icon: 'waving',
    iconTone: 'brand',
    badge: 'First-Timers',
    badgeTone: 'brand',
    size: '186',
    sizeNote: 'Recent Discovery',
    insight: 'Goal: Convert to 2nd visit within 14 days',
    cta: copy.segments.welcomeCta,
  },
] as const;

export const segmentCustomFilterIcon: Record<string, IconName> = {
  frequency: 'eventRepeat',
  spend: 'payments',
  taste: 'restaurant',
  district: 'pinDrop',
};

/* -------------------------------------------------------------------------- */
/* Boost engine                                                               */
/* -------------------------------------------------------------------------- */

export interface BoostRadiusOption {
  id: string;
  title: string;
  reach: string;
  detail: string;
  icon: IconName;
}

export const boostRadii: readonly BoostRadiusOption[] = [
  {
    id: 'hyperlocal',
    title: '3km Neighborhood (Hyperlocal)',
    reach: '8,200 Foodies',
    detail: 'Wuse II, Banex & Adetokunbo Crescent',
    icon: 'locationOn',
  },
  {
    id: 'district',
    title: '5km District Coverage',
    reach: '22,400 Reach',
    detail: 'Expands into Maitama, Utako & Garki',
    icon: 'travelExplore',
  },
  {
    id: 'metro',
    title: '10km Metro Boost',
    reach: '54,000 Reach',
    detail: 'High-frequency Abuja citywide feed',
    icon: 'earth',
  },
] as const;

export interface BoostAudienceOption {
  id: string;
  title: string;
  detail: string;
  icon: IconName;
}

export const boostAudiences: readonly BoostAudienceOption[] = [
  {
    id: 'regulars',
    title: 'Past Customers & Regulars',
    detail: 'Highest repeat conversion',
    icon: 'loyalty',
  },
  {
    id: 'competitors',
    title: 'Competitor Deal Claimers',
    detail: 'Target active neighborhood diners',
    icon: 'localOffer',
  },
  {
    id: 'walkins',
    title: 'New Walk-ins in 1km Radius',
    detail: 'Live walking-distance triggers',
    icon: 'personPin',
  },
] as const;

export interface BoostBudgetTier {
  id: string;
  name: string;
  price: string;
  detail: string;
  recommended: boolean;
}

export const boostBudgetTiers: readonly BoostBudgetTier[] = [
  {
    id: 'starter',
    name: copy.boost.tiers.starter,
    price: '₦3,000',
    detail: '~1,500 views /d',
    recommended: false,
  },
  {
    id: 'top',
    name: copy.boost.tiers.top,
    price: '₦5,000',
    detail: '3,500 views • 85 claims',
    recommended: true,
  },
  {
    id: 'turbo',
    name: copy.boost.tiers.turbo,
    price: '₦10,000',
    detail: '8,000+ views',
    recommended: false,
  },
] as const;

export const boostSelection = {
  dealDiscount: '20% OFF',
  dealName: 'Weekend Prime Lunch Combo',
  dealWas: '₦12,000',
  dealNow: '₦9,600',
  dealNote: '• 2 Days Left',
} as const;

export const boostFeedPreview = {
  name: 'Weekend Prime Lunch Combo Special',
  branch: 'Downtown Hub • Wuse II',
  distance: '0.8km away',
  rating: 4.9,
  reviews: 128,
} as const;
