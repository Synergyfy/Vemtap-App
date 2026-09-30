/**
 * Fixture data for the VEMTAP Business Network surfaces: the intro hub, the
 * merchant's own network, the milestone ladder, the knowledge-base guide, the
 * referral directory, referral detail and the active dashboard, plus the
 * invite-a-business sheet. Screens read from here so milestones, partners,
 * referrals and timeline steps are never inlined twice.
 */
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = {
  intro: strings.businessNetworkIntroHub,
  network: strings.myBusinessNetwork,
  milestones: strings.networkMilestones,
  info: strings.businessNetworkInfo,
  referrals: strings.myReferrals,
  detail: strings.referralDetail,
  dashboard: strings.businessNetworkDashboard,
  invite: strings.inviteABusiness,
} as const;

/* -------------------------------------------------------------------------- */
/* Shared sub-tab strips                                                      */
/* -------------------------------------------------------------------------- */

export const networkSubTabs = [...copy.intro.subTabs] as const;
export const myNetworkSubTabs = [...copy.network.subTabs] as const;
export const milestoneSubTabs = [...copy.milestones.subTabs] as const;
export const dashboardSubTabs = [...copy.dashboard.subTabs] as const;

export const networkSubTabIcon: Record<string, IconName> = {
  'Business Network': 'hub',
  Boost: 'bolt',
  Campaigns: 'campaign',
  Segments: 'group',
  Deals: 'localOffer',
  Manage: 'monitoring',
  Partners: 'handshake',
  Promos: 'campaign',
  Analytics: 'insights',
};

/* -------------------------------------------------------------------------- */
/* Milestone ladder                                                           */
/* -------------------------------------------------------------------------- */

export type MilestoneState = 'unlocked' | 'active' | 'locked';

/** Per-state affordance label, matching the design's wording per tier. */
export const milestoneStateLabel: Record<MilestoneState, string> = {
  unlocked: 'Unlocked',
  active: 'Active Tier',
  locked: 'Locked',
};

export const milestoneStateTone: Record<MilestoneState, 'success' | 'brand' | 'neutral'> =
  {
    unlocked: 'success',
    active: 'brand',
    locked: 'neutral',
  };

export interface MilestonePerk {
  text: string;
}

export interface NetworkMilestone {
  id: string;
  name: string;
  threshold: string;
  state: MilestoneState;
  icon: IconName;
  /** Shown on the active tier, e.g. `Active Tier (7/5)`. */
  tierNote?: string;
  /** Shown on a locked tier, e.g. `Locked` or `3 more needed`. */
  progressNote?: string;
  /** 0–100 toward this tier; only meaningful for `active`. */
  percent?: number;
  /** `7 of 10 verified` caption. */
  verifiedCaption?: string;
  perks: readonly MilestonePerk[];
}

export const networkMilestones: readonly NetworkMilestone[] = [
  {
    id: 'starter',
    name: 'Network Starter',
    threshold: '3 Verified Businesses',
    state: 'unlocked',
    icon: 'checkBold',
    perks: [
      { text: 'Network recognition' },
      { text: 'Eligible for selected network opportunities' },
    ],
  },
  {
    id: 'partner',
    name: 'Network Partner',
    threshold: '5 Verified Businesses',
    state: 'active',
    icon: 'workspacePremium',
    tierNote: 'Active Tier (7/5)',
    percent: 100,
    perks: [
      { text: 'Network Partner status' },
      { text: 'Partner badge on merchant profiles' },
      { text: 'Eligible for selected promotional opportunities' },
    ],
  },
  {
    id: 'community',
    name: 'Community Network Partner',
    threshold: '10 Verified Businesses',
    state: 'locked',
    icon: 'groupNetwork',
    progressNote: '3 more needed',
    percent: 70,
    verifiedCaption: '7 of 10 verified',
    perks: [
      { text: 'Community recognition' },
      { text: 'Additional network opportunities' },
      { text: 'Eligible for selected local campaigns' },
    ],
  },
  {
    id: 'builder',
    name: 'Local Network Builder',
    threshold: '25 Verified Businesses',
    state: 'locked',
    icon: 'domainAdd',
    progressNote: 'Locked',
    percent: 28,
    verifiedCaption: '7 of 25 verified',
    perks: [
      { text: 'Local Network Builder recognition' },
      { text: 'District-wide campaign eligibility' },
    ],
  },
] as const;

/** The tier the merchant is currently working toward. */
export const activeMilestoneId = 'community';

/* -------------------------------------------------------------------------- */
/* Network growth summary (shared by the network + dashboard screens)          */
/* -------------------------------------------------------------------------- */

export const networkGrowth = {
  referralLink: copy.network.referralLink,
  verifiedCount: '7',
  nextTierName: 'Community Network Partner',
  remaining: '3',
  remainingTotal: '10',
  currentTierName: 'Tier 2: Growth Partner',
  nextMilestoneBody: copy.network.nextMilestoneBody,
  percent: 70,
} as const;

/* -------------------------------------------------------------------------- */
/* Partners / connections                                                     */
/* -------------------------------------------------------------------------- */

export interface NetworkPartner {
  id: string;
  name: string;
  initials: string;
  category: string;
  district: string;
  status: 'Active' | 'Pending';
  meta: string;
  icon: IconName;
}

export const networkPartners: readonly NetworkPartner[] = [
  {
    id: 'artisan-bakery',
    name: 'Artisan Bakery & Cafe',
    initials: 'AB',
    category: 'Bakery & Dining',
    district: 'Wuse II',
    status: 'Active',
    meta: 'Verified 2d ago',
    icon: 'bakery',
  },
  {
    id: 'pulse-fitness',
    name: 'Pulse Fitness & Wellness',
    initials: 'PF',
    category: 'Fitness',
    district: 'Apo District',
    status: 'Active',
    meta: 'Verified 5d ago',
    icon: 'fitnessCenter' as IconName,
  },
  {
    id: 'velvet-stitch',
    name: 'Velvet Stitch Couture',
    initials: 'VS',
    category: 'Fashion',
    district: 'Garki II',
    status: 'Active',
    meta: 'Verified 1w ago',
    icon: 'styler',
  },
] as const;

/** Compact initials-only list for the dashboard's recent connections. */
export const dashboardConnections: readonly {
  id: string;
  name: string;
  initials: string;
}[] = [
  { id: 'abc', name: 'ABC Electronics', initials: 'AB' },
  { id: 'ktech', name: 'K-Tech Access...', initials: 'KT' },
  { id: 'nexus', name: 'Nexus Cafe', initials: 'NC' },
] as const;

/* -------------------------------------------------------------------------- */
/* Nearby merchants (intro hub)                                               */
/* -------------------------------------------------------------------------- */

export interface NearbyMerchant {
  id: string;
  name: string;
  category: string;
  distance: string;
}

export const nearbyMerchants: readonly NearbyMerchant[] = [
  {
    id: 'bean',
    name: 'Artisan Bean Roastery',
    category: 'Food & Beverage',
    distance: '0.2 km away',
  },
  {
    id: 'glow',
    name: 'Glow Studio Lagos',
    category: 'Health & Beauty',
    distance: '0.6 km away',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Referral directory                                                         */
/* -------------------------------------------------------------------------- */

export type ReferralStatus =
  'verified' | 'pending' | 'registered' | 'invited' | 'notQualified';

export const referralStatusLabel: Record<ReferralStatus, string> = {
  verified: 'Verified',
  pending: 'Pending Verification',
  registered: 'Registered',
  invited: 'Invited',
  notQualified: 'Not Qualified',
};

export const referralStatusIcon: Record<ReferralStatus, IconName> = {
  verified: 'checkCircle',
  pending: 'hourglass',
  registered: 'storefront',
  invited: 'send',
  notQualified: 'block',
};

export interface Referral {
  id: string;
  name: string;
  initials: string;
  refId: string;
  category: string;
  district: string;
  status: ReferralStatus;
  joined: string;
  verified?: string;
  note: string;
  icon: IconName;
}

export const referrals: readonly Referral[] = [
  {
    id: 'abc',
    name: 'ABC Electronics',
    initials: 'AB',
    refId: '#VE-9021',
    category: 'Retail & Gadgets',
    district: 'Abuja',
    status: 'verified',
    joined: 'Joined 28 Sep 2026',
    verified: 'Verified 2 days later',
    note: 'Verified • 100% active order routing',
    icon: 'devices',
  },
  {
    id: 'xyz',
    name: 'XYZ Phones',
    initials: 'XP',
    refId: '#VE-8990',
    category: 'Mobile & Tech Accessories',
    district: 'Wuse II',
    status: 'pending',
    joined: 'Joined Yesterday',
    note: 'CAC document review in progress',
    icon: 'mobile',
  },
  {
    id: 'ktech',
    name: 'K-Tech Accessories',
    initials: 'KT',
    refId: '#VE-8842',
    category: 'Computer Hardware',
    district: 'Garki II',
    status: 'verified',
    joined: 'Joined 22 Sep 2026',
    verified: 'Verified 3 days later',
    note: 'Verified • 100% active order routing',
    icon: 'computerChip',
  },
  {
    id: 'prime',
    name: 'Prime Computers',
    initials: 'PC',
    refId: '#VE-8830',
    category: 'Office IT & Electronics',
    district: 'Central District',
    status: 'pending',
    joined: 'Joined 3 days ago',
    note: 'Storefront geofence pending',
    icon: 'laptopMac',
  },
  {
    id: 'solitude',
    name: 'Solitude Spa & Wellness',
    initials: 'SS',
    refId: '#VE-8760',
    category: 'Health & Beauty',
    district: 'Maitama',
    status: 'registered',
    joined: 'Joined 14 Sep 2026',
    verified: 'Verified',
    note: 'Account created, pending onboarding',
    icon: 'spa',
  },
  {
    id: 'mamas',
    name: "Mama's Kitchen Delight",
    initials: 'MK',
    refId: '#VE-8702',
    category: 'Fast Casual Restaurant',
    district: 'Apo District',
    status: 'invited',
    joined: 'Invited 1 week ago',
    note: 'Via WhatsApp • Link opened 2h ago',
    icon: 'restaurant',
  },
  {
    id: 'apex',
    name: 'Apex Logistics Hub',
    initials: 'AL',
    refId: '#VE-8699',
    category: 'Freight & Warehousing',
    district: 'Abuja',
    status: 'notQualified',
    joined: 'Invited 2 weeks ago',
    note: 'Non-retail / outside operational district policy',
    icon: 'localShipping',
  },
  {
    id: 'nexus',
    name: 'Nexus Cafe & Bakery',
    initials: 'NC',
    refId: '#VE-7104',
    category: 'Cafe & Dining',
    district: 'Jabi',
    status: 'verified',
    joined: 'Joined 9 Sep 2026',
    verified: 'Verified',
    note: 'Verified • 100% active order routing',
    icon: 'localCafe',
  },
] as const;

export const referralStatusTone: Record<
  ReferralStatus,
  'success' | 'warning' | 'brand' | 'neutral'
> = {
  verified: 'success',
  pending: 'warning',
  registered: 'brand',
  invited: 'neutral',
  notQualified: 'neutral',
};

/* -------------------------------------------------------------------------- */
/* Referral detail timeline                                                   */
/* -------------------------------------------------------------------------- */

export interface ReferralStep {
  id: string;
  title: string;
  when: string;
  body: string;
  /** The design shows the referral link on the first step only. */
  reference?: string;
}

export const referralTimeline: readonly ReferralStep[] = [
  {
    id: 'invited',
    title: 'Invitation Sent',
    when: '27 Sep 2026, 11:20 AM',
    body: 'Shared via unique invite link',
    reference: copy.network.referralLink,
  },
  {
    id: 'registered',
    title: 'Account Registered',
    when: '28 Sep 2026, 02:45 PM',
    body: 'Merchant completed phone verification & onboarding profile setup',
  },
  {
    id: 'verified',
    title: 'Business Verification Passed',
    when: '30 Sep 2026, 09:15 AM',
    body: 'CAC incorporation and physical retail storefront validated by compliance officers',
  },
  {
    id: 'partner',
    title: 'Network Partner Active',
    when: '30 Sep 2026',
    body: 'Both businesses unlocked mutual discovery badges and network priority status',
  },
] as const;

/** The referral the detail screen opens by default. */
export const featuredReferralId = 'abc';

/* -------------------------------------------------------------------------- */
/* Info guide: tier perks, fairness rules, FAQs                               */
/* -------------------------------------------------------------------------- */

export interface GuideTier {
  id: string;
  name: string;
  threshold: string;
  badge: string;
  badgeTone: 'success' | 'brand' | 'tertiary';
  perks: readonly string[];
}

export const guideTiers: readonly GuideTier[] = [
  {
    id: 'tier1',
    name: 'Tier 1: 1st Verified Partner',
    threshold: '1 verified partner',
    badge: 'Starter',
    badgeTone: 'success',
    perks: [
      'Nearby Network Badge showcased prominently on your customer-facing merchant profile.',
      'Priority listing in the consumer "Recommended by Neighbors" proximity feed.',
    ],
  },
  {
    id: 'tier2',
    name: 'Tier 2: 3 Verified Partners',
    threshold: '3 verified partners',
    badge: 'Accelerated',
    badgeTone: 'brand',
    perks: [
      'Cross-Promotional Deals Tray: Reciprocally feature offers on partner receipts & in-app confirmation screens.',
      '₦15,000 Complimentary Ad Boost: Automatically deposited to your Boost Wallet.',
    ],
  },
  {
    id: 'tier3',
    name: 'Tier 3: 5+ Verified Partners',
    threshold: '5+ verified partners',
    badge: 'Circle Elite',
    badgeTone: 'tertiary',
    perks: [
      'Official Verified Merchant Circle recognition icon visible platform-wide.',
      'Co-funded District Spotlight: VEMTAP sponsors localized geofenced push campaigns highlighting your cluster.',
      'VIP early beta access to upcoming integrated POS hardware & customer CRM features.',
    ],
  },
] as const;

export interface FairNetworkRule {
  id: string;
  title: string;
  body: string;
  icon: IconName;
}

export const fairNetworkRules: readonly FairNetworkRule[] = [
  {
    id: 'genuine',
    title: 'Genuine Local Businesses',
    body: 'Invited partners must maintain a physical walk-in storefront, food truck, or registered local fulfillment hub with verifiable operations.',
    icon: 'domainVerification',
  },
  {
    id: 'ndpr',
    title: 'NDPR & Anti-Spam Guardrails',
    body: 'Strict compliance with privacy guidelines. Automated broadcast spam or buying merchant contacts is prohibited. Invitations must be directly shared.',
    icon: 'security' as IconName,
  },
  {
    id: 'take-rate',
    title: 'Zero Take Rate Assurance',
    body: 'VEMTAP charges 0% commission on orders generated between partner cross-promotions. Network privileges are completely inclusive with your Growth Plan.',
    icon: 'percentBadge' as IconName,
  },
] as const;

export const networkFaqs = [
  {
    id: 'city',
    question: 'Do my referrals have to be in the same city?',
    answer:
      'No. Any verified commercial establishment registered within Nigeria can join your network. However, local cross-promotion trays automatically prioritize partners within a 5km radius to maximize physical footfall.',
  },
  {
    id: 'cost',
    question: 'Is there any extra cost to join?',
    answer:
      'Joining and participating in the Business Network is 100% free for all active VEMTAP merchants. There are no surprise fees, subscription add-ons, or transaction cuts.',
  },
  {
    id: 'unlock',
    question: 'When do benefits unlock?',
    answer:
      'Benefits unlock automatically in real-time as soon as your invited merchant completes verification and their first successful deal transaction on the VEMTAP terminal.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Invite-a-business sheet                                                    */
/* -------------------------------------------------------------------------- */

export const inviteMerchantStats = [
  { id: 'volume', label: 'Monthly Tap Volume', value: '₦4,850,200' },
  { id: 'terminals', label: 'Active Terminals', value: '6 Ready' },
  { id: 'network', label: 'Network Connections', value: '14 Merchants' },
] as const;

export const inviteMessage = `Hi, I'm using VEMTAP to help my business connect with customers and grow. You can set up your business on VEMTAP using my referral link:\n${copy.network.referralLink}`;

/* -------------------------------------------------------------------------- */
/* Badges (dashboard)                                                         */
/* -------------------------------------------------------------------------- */

export interface NetworkBadge {
  id: string;
  name: string;
  meta: string;
  icon: IconName;
  tone: 'brand' | 'tertiary';
}

export const networkBadges: readonly NetworkBadge[] = [
  {
    id: 'partner',
    name: 'Network Partner',
    meta: 'Active Tier 1 Verified',
    icon: 'workspacePremium',
    tone: 'brand',
  },
  {
    id: 'founding',
    name: 'Founding Member',
    meta: 'Abuja District 2026',
    icon: 'shield',
    tone: 'tertiary',
  },
] as const;
