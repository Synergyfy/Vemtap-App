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

export type CampaignStatus = 'live' | 'scheduled' | 'completed';

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

/* -------------------------------------------------------------------------- */
/* Master business QR                                                         */
/* -------------------------------------------------------------------------- */

export const businessQrIdentity = {
  brand: 'Urban Grill & Bistro',
  shortcode: 'vemtap.com/@urbangrill',
  code: 'VT-UB-8820',
} as const;

export const businessQrScanStats = [
  {
    id: 'scans',
    label: copy.qr.totalScansLabel,
    value: '1,420',
    delta: '+24%',
    icon: 'qrCodeScanner' as IconName,
  },
  {
    id: 'signups',
    label: copy.qr.newSignupsLabel,
    value: '382',
    delta: '+18%',
    icon: 'personAdd' as IconName,
  },
  {
    id: 'claimed',
    label: copy.qr.dealClaimedLabel,
    value: '68%',
    delta: 'Conv. rate',
    icon: 'localOffer' as IconName,
  },
] as const;

export interface QrRoutingOption {
  id: string;
  title: string;
  body: string;
  icon: IconName;
  badge?: string;
}

export const businessQrRouting: readonly QrRoutingOption[] = [
  {
    id: 'smart',
    title: 'Auto Smart-Route',
    body: "Dynamically opens the customer's nearest physical branch using live GPS & active storefront availability.",
    icon: 'altRoute',
    badge: 'Recommended',
  },
  {
    id: 'main',
    title: 'Main Branch (Downtown Flagship)',
    body: 'Always drives patrons directly to the flagship Downtown profile and full a la carte ordering deck.',
    icon: 'storefront',
  },
  {
    id: 'deals',
    title: 'Active Deals & Promos',
    body: 'Immediate landing on “20% OFF Prime Lunch” with instant 1-tap Google/Apple Pay redemption.',
    icon: 'localOffer',
    badge: 'High Conversion',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Location QR scan points                                                    */
/* -------------------------------------------------------------------------- */

export interface ScanPoint {
  id: string;
  name: string;
  /** Branch group id, matching `strings.locationQr.branchGroups`. */
  branchId: 'wuse' | 'maitama' | 'garki';
  branch: string;
  branchCode: string;
  icon: IconName;
  meta: string;
  weeklyScans: string;
  status: string;
  badges: readonly string[];
  ctas: readonly string[];
  hero?: boolean;
}

export const scanPoints: readonly ScanPoint[] = [
  {
    id: 'till-01',
    branchId: 'wuse',
    name: 'Main Counter & Till 01',
    branch: 'Wuse II Flagship Branch',
    branchCode: 'High Resolution',
    icon: 'pointOfSale',
    meta: 'Till 01 • Main Counter',
    weeklyScans: '412 scans/wk',
    status: 'Active',
    badges: ['Express Lane Enabled', 'Ready for NFC Tap + Optical Scan'],
    ctas: ['View Tag', 'Share', 'Save PNG'],
    hero: true,
  },
  {
    id: 'table-04',
    branchId: 'wuse',
    name: 'Table 04',
    branch: 'Wuse II Flagship Branch',
    branchCode: 'Dine-In Seating',
    icon: 'tableBar',
    meta: 'Patio Row • Window Seats',
    weeklyScans: '238 scans/wk',
    status: 'Active',
    badges: ['Curbside Bay A', 'Express Lane Enabled'],
    ctas: ['View Tag', 'Print Sticker'],
  },
  {
    id: 'front-desk',
    branchId: 'maitama',
    name: 'Front Desk Host Stand',
    branch: 'Maitama Heights Branch',
    branchCode: 'Branch #2',
    icon: 'lounge',
    meta: 'Danube Close',
    weeklyScans: '182 scans/wk',
    status: 'Active',
    badges: [
      'Storefront Discovery, Menu & Waitlist',
      'Pylon Acrylic',
      'Includes Instant Waitlist',
    ],
    ctas: ['View Tag', 'Print Sticker'],
  },
  {
    id: 'vip-lounge',
    branchId: 'wuse',
    name: 'VIP Lounge Section',
    branch: 'Wuse II Flagship Branch',
    branchCode: 'VIP Tier',
    icon: 'diamond',
    meta: 'Exclusive High-Value Deal Routing',
    weeklyScans: '46 scans/wk',
    status: 'Active',
    badges: ['Custom Welcome Video: Active'],
    ctas: ['View Tag', 'Print Sticker'],
  },
] as const;

export const locationQrRules = [
  {
    id: 'table-numbering',
    title: 'Dynamic Table Numbering',
    body: "Automatically injects Table 01–20 context into the customer's self-ordering cart for zero-friction kitchen routing.",
    icon: 'pinInvoke' as IconName,
  },
  {
    id: 'off-hours',
    title: 'Off-Hours Smart Redirect',
    body: 'When a branch is closed, scans auto-route customers to direct WhatsApp booking or reservations for tomorrow.',
    icon: 'schedule' as IconName,
  },
] as const;

export const locationQrNetwork = [
  { id: 'points', label: 'Active Points', value: '14', icon: 'pinDrop' as IconName },
  {
    id: 'scans',
    label: 'Weekly Scans',
    value: '4,860',
    icon: 'qrCodeScanner' as IconName,
  },
  { id: 'branches', label: 'Branches Live', value: '3', icon: 'storefront' as IconName },
] as const;

/* -------------------------------------------------------------------------- */
/* Consumer discovery feed                                                    */
/* -------------------------------------------------------------------------- */

export const discoveryHealthStats = [
  {
    id: 'reach',
    label: '7d Reach',
    value: '18.5k',
    delta: '+14%',
    icon: 'insights' as IconName,
  },
  {
    id: 'radius',
    label: 'Avg Radius',
    value: '3.8 km',
    delta: 'Hyperlocal',
    icon: 'nearMe' as IconName,
  },
  {
    id: 'category',
    label: 'Category',
    value: 'Top 3',
    delta: 'Abuja Steaks',
    icon: 'grade' as IconName,
  },
] as const;

export const discoveryFeedCard = {
  name: 'Urban Grill & Bistro',
  discount: '20% OFF',
  distance: '0.8 km away',
  locality: 'Wuse II, Abuja',
  rating: 4.9,
  reviews: 128,
  category: 'Steakhouse & Grill',
  price: '$$$ • Open till 11:30 PM',
  icon: 'fire' as IconName,
} as const;

export const discoveryControls = [
  {
    id: 'deals-near-you',
    title: 'Appear in "Deals Near You"',
    body: 'Feature 20% off lunch vouchers on user feeds',
    icon: 'percentBadge' as IconName,
    enabled: true,
    status: 'Active',
  },
  {
    id: 'trending-spot',
    title: 'Trending Businesses Spot',
    body: 'Unlocked via 4.9★ rating and peak walk-in traffic',
    icon: 'fire' as IconName,
    enabled: true,
    status: 'Active',
  },
  {
    id: 'walkin-radar',
    title: 'Instant Walk-in Push Radar',
    body: 'Nudge users within 500m during peak lunch hours',
    icon: 'notificationsActive' as IconName,
    enabled: true,
    status: 'Active',
  },
  {
    id: 'auto-hide',
    title: 'Auto-Hide When Closed',
    body: 'Supress feed ranking outside business operating hours',
    icon: 'schedule' as IconName,
    enabled: false,
    status: 'Off',
  },
] as const;

export const discoveryIndexRows = [
  {
    id: 'menu',
    label: 'Menu & Pricelist',
    value: 'Live',
    icon: 'restaurant' as IconName,
  },
  { id: 'catalogue', label: 'Catalogue Items', value: '64', icon: 'catalog' as IconName },
  { id: 'deals', label: 'Active Deals', value: '3', icon: 'localOffer' as IconName },
  { id: 'hours', label: 'Opening Hours', value: 'Synced', icon: 'schedule' as IconName },
] as const;

export const discoveryZones = [
  { id: 'wuse', label: 'Wuse II Hub', radius: '0–3 km', active: true },
  { id: 'maitama', label: 'Maitama', radius: '3–6 km', active: true },
  { id: 'garki', label: 'Garki', radius: '3–6 km', active: true },
  { id: 'jabi', label: 'Jabi', radius: '6–12 km', active: true },
] as const;
