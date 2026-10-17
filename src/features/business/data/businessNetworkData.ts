/**
 * Static configuration for the VEMTAP Business Network surfaces: sub-tab
 * strips and their icons, and the knowledge-base guide (tier perks, fairness
 * rules, FAQs). Live figures — referrals, milestones, partners — come from
 * `/business-network`.
 */
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = {
  intro: strings.businessNetworkIntroHub,
  network: strings.myBusinessNetwork,
  milestones: strings.networkMilestones,
  dashboard: strings.businessNetworkDashboard,
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

/** Mirrors the backend milestone ladder (`network-tiers.ts`): verified referrals only. */
export const guideTiers: readonly GuideTier[] = [
  {
    id: 'starter',
    name: 'Network Starter',
    threshold: '3 verified referrals',
    badge: 'Tier 1',
    badgeTone: 'success',
    perks: ['Network recognition', 'Eligible for selected network opportunities'],
  },
  {
    id: 'partner',
    name: 'Network Partner',
    threshold: '5 verified referrals',
    badge: 'Tier 2',
    badgeTone: 'brand',
    perks: [
      'Network Partner status',
      'Partner badge on merchant profiles',
      'Eligible for selected promotional opportunities',
    ],
  },
  {
    id: 'community',
    name: 'Community Network Partner',
    threshold: '10 verified referrals',
    badge: 'Tier 3',
    badgeTone: 'tertiary',
    perks: [
      'Community recognition',
      'Additional network opportunities',
      'Eligible for selected local campaigns',
    ],
  },
  {
    id: 'builder',
    name: 'Local Network Builder',
    threshold: '25 verified referrals',
    badge: 'Tier 4',
    badgeTone: 'brand',
    perks: ['Local Network Builder recognition', 'District-wide campaign eligibility'],
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
    body: 'VemTap charges 0% commission on orders generated between partner cross-promotions.',
    icon: 'percentBadge' as IconName,
  },
] as const;

export const networkFaqs = [
  {
    id: 'city',
    question: 'Do my referrals have to be in the same city?',
    answer:
      'No. Any business in Nigeria can join through your referral link. Your network dashboard highlights verified merchants within 10 km of your business, since nearby partners share the most foot traffic.',
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
      'A referral counts toward your milestones as soon as the business you invited passes VemTap verification. Tiers unlock automatically at 3, 5, 10 and 25 verified referrals.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Invite-a-business sheet                                                    */
/* -------------------------------------------------------------------------- */
