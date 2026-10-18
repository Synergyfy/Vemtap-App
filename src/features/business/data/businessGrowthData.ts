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
    reach: '',
    detail: '',
    icon: 'locationOn',
  },
  {
    id: 'district',
    title: '5km District Coverage',
    reach: '',
    detail: '',
    icon: 'travelExplore',
  },
  {
    id: 'metro',
    title: '10km Metro Boost',
    reach: '',
    detail: '',
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
