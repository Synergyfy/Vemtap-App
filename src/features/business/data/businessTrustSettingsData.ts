/**
 * Fixture data for the business trust, settings, support, billing, reviews and
 * notification surfaces, plus the customer-mode switch. Screens read from here
 * so alerts, pillars, settings rows, invoices and reviews are never inlined
 * twice.
 */
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

const copy = {
  notifications: strings.businessNotificationsCenter,
  reviews: strings.businessReviewsReputation,
  billing: strings.businessSubscriptionBilling,
  trust: strings.businessVerificationTrust,
  support: strings.businessSupportHelp,
  settings: strings.businessSettings,
  switch: strings.switchToCustomer,
} as const;

/* -------------------------------------------------------------------------- */
/* Notification center                                                        */
/* -------------------------------------------------------------------------- */

export type NotificationCategoryId = 'all' | 'orders' | 'campaigns' | 'system';

export interface BusinessNotification {
  id: string;
  kind: keyof typeof copy.notifications.kinds;
  icon: IconName;
  iconTone: 'brand' | 'success' | 'tertiary' | 'secondary';
  time: string;
  title: string;
  body: string;
  /** Trailing stat block shown under the body (e.g. velocity or till total). */
  stat?: { label?: string; value: string; trend?: string };
  footnote?: string;
  cta: string;
  unread: boolean;
  categories: readonly NotificationCategoryId[];
}

export const businessNotifications: readonly BusinessNotification[] = [
  {
    id: 'deal-velocity',
    kind: 'deal',
    icon: 'fire',
    iconTone: 'tertiary',
    time: '12m ago',
    title: 'Weekend Prime Lunch Combo Spiked!',
    body: '14 new claims in the last 2 hours. Your Wuse II branch is seeing high lunch footfall.',
    stat: {
      label: copy.notifications.velocityLabel,
      value: '+38%',
      trend: 'vs last week',
    },
    cta: 'View Deal Velocity',
    unread: true,
    categories: ['all', 'campaigns'],
  },
  {
    id: 'shift-balanced',
    kind: 'pos',
    icon: 'pointOfSale',
    iconTone: 'success',
    time: '1h ago',
    title: 'Till #01 Shift Drawer Balanced',
    body: 'Cashier Emeka O. closed shift #402 with ₦342,850 gross sales and zero cash variance.',
    footnote: copy.notifications.reconciledAt,
    cta: 'View Z-Report',
    unread: true,
    categories: ['all', 'orders'],
  },
  {
    id: 'new-rating',
    kind: 'feedback',
    icon: 'rateReview',
    iconTone: 'secondary',
    time: '2h ago',
    title: 'New 5★ Rating from Tunde Bakare',
    body: '“The Ribeye was cooked to perfection, and tap redemption took literally two seconds.” Reply within 24h to boost your venue ranking.',
    cta: 'Reply Now',
    unread: false,
    categories: ['all', 'campaigns'],
  },
  {
    id: 'renewal',
    kind: 'billing',
    icon: 'creditCard',
    iconTone: 'brand',
    time: '1d ago',
    title: 'Growth Plan Renews in 5 Days',
    body: 'Your VEMTAP Growth subscription (₦5,000/mo) will renew on Oct 25 via linked Paystack card ending in •••• 4019.',
    footnote: copy.notifications.autoRenew,
    cta: 'Manage Billing',
    unread: false,
    categories: ['all', 'system'],
  },
  {
    id: 'till-sync',
    kind: 'sync',
    icon: 'cloudDone',
    iconTone: 'success',
    time: '2d ago',
    title: 'Local Till Buffer Reconciled',
    body: '52 queued transactions from Till 04 successfully synced to cloud HQ after telco recovery. No data collisions detected.',
    cta: 'View Sync Log',
    unread: false,
    categories: ['all', 'orders', 'system'],
  },
] as const;

export const notificationCategoryIcon: Record<NotificationCategoryId, IconName> = {
  all: 'bellRing',
  orders: 'pointOfSale',
  campaigns: 'fire',
  system: 'manageSearch',
};

export const notificationToneTile: Record<BusinessNotification['iconTone'], string> = {
  brand: 'bg-surface-tint',
  success: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
  secondary: 'bg-secondary-fixed',
};

export const notificationToneIcon: Record<BusinessNotification['iconTone'], string> = {
  brand: 'text-primary',
  success: 'text-badge-discount-text',
  tertiary: 'text-tertiary',
  secondary: 'text-secondary',
};

/* -------------------------------------------------------------------------- */
/* Reviews & reputation                                                       */
/* -------------------------------------------------------------------------- */

export interface ReviewDistributionRow {
  stars: 1 | 2 | 3 | 4 | 5;
  percent: number;
}

export const reviewDistribution: readonly ReviewDistributionRow[] = [
  { stars: 5, percent: 88 },
  { stars: 4, percent: 9 },
  { stars: 3, percent: 2 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 0 },
] as const;

export const reviewTrendingIcons: readonly IconName[] = ['fire', 'directionsCar', 'spa'];

export interface BusinessReview {
  id: string;
  name: string;
  initials: string;
  tier: string;
  time: string;
  rating: number;
  branch: string;
  items: string;
  body: string;
  hasPhoto: boolean;
  verifiedItem: boolean;
  helpful: number;
  replied?: { label: string; time: string; body: string };
}

export const businessReviews: readonly BusinessReview[] = [
  {
    id: 'tunde',
    name: 'Tunde Bakare',
    initials: 'TB',
    tier: 'Diners Club',
    time: '2 hours ago',
    rating: 5,
    branch: 'Wuse II Branch',
    items: 'Woodfire Ribeye & Truffle Fries',
    body: '“The Ribeye was cooked to perfection and using the VEMTAP QR voucher saved us ₦2,400 right at checkout. Seamless service!”',
    hasPhoto: true,
    verifiedItem: true,
    helpful: 21,
    replied: {
      label: copy.reviews.youReplied,
      time: '1 hour ago',
      body: '“Thank you Tunde! Delighted to host your dinner team. See you soon!”',
    },
  },
  {
    id: 'amina',
    name: 'Amina Bello',
    initials: 'AB',
    tier: 'Verified Patron',
    time: 'Yesterday',
    rating: 4,
    branch: 'Maitama Heights',
    items: 'Passionfruit Mojito happy hour',
    body: '“Loved the Passionfruit Mojito during happy hour. Music was a bit lively but great vibes overall.”',
    hasPhoto: false,
    verifiedItem: false,
    helpful: 9,
  },
  {
    id: 'david',
    name: 'David O.',
    initials: 'DO',
    tier: 'Verified Patron',
    time: '3 days ago',
    rating: 5,
    branch: 'Wuse II Branch',
    items: 'Dine-in experience',
    body: '“Great food, fast seating. Service at the till was super fast with the tap to pay.”',
    hasPhoto: false,
    verifiedItem: false,
    helpful: 14,
  },
] as const;

export const reviewTierTone = ['brand', 'success', 'tertiary'] as const;

/* -------------------------------------------------------------------------- */
/* Subscription & billing                                                     */
/* -------------------------------------------------------------------------- */

export interface BusinessInvoice {
  id: string;
  title: string;
  date: string;
  method: string;
  amount: string;
  status: 'upcoming' | 'paid';
}

export const billingValueFigures = [
  {
    id: 'sales',
    label: copy.billing.valueSalesLabel,
    value: '₦4.85M',
    icon: 'payments' as IconName,
  },
  {
    id: 'footfall',
    label: copy.billing.valueFootfallLabel,
    value: '1,420',
    icon: 'group' as IconName,
  },
  {
    id: 'takeRate',
    label: copy.billing.valueTakeRateLabel,
    value: '0%',
    icon: 'percentBadge' as IconName,
  },
] as const;

export const billingPaymentMethod = {
  brand: 'Mastercard',
  brandInitials: 'MC',
  last4: '4821',
} as const;

export interface BusinessAddOn {
  id: string;
  name: string;
  detail: string;
  price: string;
  status: string;
  cta: string;
  featured: boolean;
  locations: string;
}

export const billingAddOns: readonly BusinessAddOn[] = [
  {
    id: 'feed-booster',
    name: 'Local Hyperlocal Feed Booster',
    detail: 'Targeting 3.5km radius shoppers',
    price: '₦10,000',
    status: 'Running • Ends Saturday 11:59 PM',
    cta: 'Extend',
    featured: true,
    locations: '',
  },
  {
    id: 'multibranch',
    name: 'Multi-Branch Pro Pack',
    detail: 'Growth tier inclusion • 3 of 3 branches active',
    price: copy.billing.includedTier,
    status: copy.billing.includedLabel,
    cta: copy.billing.manageHubsCta,
    featured: false,
    locations: 'Ikeja, Lekki Phase 1, Victoria Island',
  },
] as const;

export const billingHistory: readonly BusinessInvoice[] = [
  {
    id: 'inv-oct',
    title: 'VEMTAP Growth Plan',
    date: 'Oct 25, 2024 • Scheduled',
    method: 'Paystack',
    amount: '₦5,000',
    status: 'upcoming',
  },
  {
    id: 'inv-sep',
    title: 'VEMTAP Growth Plan',
    date: 'Sep 25, 2024 • Visa Card',
    method: 'Visa',
    amount: '₦5,000',
    status: 'paid',
  },
  {
    id: 'inv-boost',
    title: 'Weekend Boost Ad Package',
    date: 'Sep 18, 2024 • Mastercard',
    method: 'Mastercard',
    amount: '₦15,000',
    status: 'paid',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Verification & trust                                                       */
/* -------------------------------------------------------------------------- */

export interface VerificationPillar {
  id: string;
  title: string;
  icon: IconName;
  status: string;
  lines: readonly string[];
  detail: string;
  cta?: string;
}

export const verificationPillars: readonly VerificationPillar[] = [
  {
    id: 'cac',
    title: 'Government Business Registration',
    icon: 'accountBalance',
    status: 'Verified (RC-1849204)',
    lines: [
      'Urban Grill & Bistro Limited',
      'Verified on Aug 12, 2024 via Corporate Affairs Commission (CAC)',
    ],
    detail: '',
    cta: 'View CAC Certificate',
  },
  {
    id: 'identity',
    title: 'Director & Owner Identity (NIN / BVN)',
    icon: 'badge',
    status: 'Biometric ID Verified',
    lines: ['Emeka Okafor', '(Managing Director)'],
    detail: 'Cross-matched securely with NDIC & NIMC national biometric database.',
  },
  {
    id: 'storefront',
    title: 'Physical Storefront & Branches',
    icon: 'storefront',
    status: 'Geo-Inspected & Active',
    lines: ['Wuse II Flagship (Aminu Kano Cresc, Abuja) + Maitama Heights'],
    detail:
      'Validated via GPS physical storefront checkpoint and verified premise photographs.',
  },
  {
    id: 'settlement',
    title: 'Merchant Settlement & Bank Account',
    icon: 'payments',
    status: 'Verified for Direct Settlement',
    lines: ['Settlement Account: Access Bank •••• 9102'],
    detail: 'Designated entity name: Urban Grill & Bistro Ltd',
  },
] as const;

export const verificationPerks: readonly string[] = [
  'Trust badge enabled across consumer discovery feeds',
  'Priority placement in “Deals Near You” & Abuja food searches',
  'Unlimited offline buffer caching & multi-terminal POS sync',
  'Zero payout caps on direct contactless NFC & QR dine-in checkouts',
] as const;

/* -------------------------------------------------------------------------- */
/* Support & help                                                             */
/* -------------------------------------------------------------------------- */

export interface KnowledgeCategory {
  id: string;
  title: string;
  icon: IconName;
  count: string;
  articles: readonly string[];
}

export const knowledgeBase: readonly KnowledgeCategory[] = [
  {
    id: 'pos',
    title: 'POS Tills & Offline Buffer',
    icon: 'pointOfSale',
    count: '5 articles',
    articles: [
      'How offline buffer and sales caching works',
      'Z-Report end-of-shift printing procedures',
      'Pairing Bluetooth & NFC contact tap readers',
    ],
  },
  {
    id: 'deals',
    title: 'VEMTAP Deals & Campaign Boost',
    icon: 'localOffer',
    count: '4 articles',
    articles: [
      'Configuring dynamic lunch combos & happy hours',
      'Hyper-local radius boost in Maitama & Wuse 2',
      'Voucher expiration and single-use redemption rules',
    ],
  },
  {
    id: 'branches',
    title: 'Branch Locations & Multi-Till Pricing',
    icon: 'storefront',
    count: '3 articles',
    articles: [
      'Setting distinct branch menu pricing',
      'Staff manager vs supervisor POS access rights',
    ],
  },
  {
    id: 'payouts',
    title: 'Payouts & Merchant Direct Billing',
    icon: 'accountBalance',
    count: '3 articles',
    articles: [
      'Verifying your Nigerian commercial bank account',
      'Downloading monthly platform subscription receipts',
    ],
  },
] as const;

export const supportFaqs = [
  {
    id: 'offline',
    question: 'What happens if the internet goes down during peak dinner service?',
    answer:
      'Your POS till automatically shifts into Offline Buffer mode. Customer payments, card taps, and printed kitchen chits run locally with zero delay. As soon as connectivity returns, encrypted sales data syncs to the VEMTAP Cloud automatically.',
  },
  {
    id: 'commission',
    question: 'How does VEMTAP ensure 0% commission on orders?',
    answer:
      'Unlike traditional aggregators, VEMTAP operates on a flat monthly software subscription. You keep 100% of your menu billings and customer spend with no hidden per-transaction food margins.',
  },
  {
    id: 'export',
    question: 'Can I export daily sales and customer CRM to Excel/CSV?',
    answer:
      'Yes! Go to More Hub → Analytics → Reports. You can export itemized receipts, customer visit frequency, and tax-ready summaries straight to your email in Excel or CSV format.',
  },
] as const;

export const supportChannelIcon: Record<string, IconName> = {
  whatsapp: 'whatsapp',
  call: 'phoneInTalk',
  email: 'markEmailRead',
};

export const supportStatusUptime = '99.98%';

/* -------------------------------------------------------------------------- */
/* Business settings                                                         */
/* -------------------------------------------------------------------------- */

export const settingsBranch = {
  title: 'Wuse II Flagship',
  hours: '11:30 AM – 11:00 PM',
  drawerBase: '₦50,000',

  teamSubtitle: 'Security Policy',
} as const;

export const settingsStoreGroups = [
  {
    id: 'dine-in',
    title: copy.settings.dineInTitle,
    subtitle: copy.settings.dineInSubtitle,
  },
  {
    id: 'alerts',
    title: copy.settings.alertsTitle,
    subtitle: copy.settings.alertsSubtitle,
  },
] as const;

export const settingsHardwareGroups = [
  {
    id: 'printer',
    title: 'Bluetooth Thermal Printer',
    subtitle: '80mm Kitchen & Receipt slips',
    value: 'Sunmi Cloud Connected',
  },
  {
    id: 'scanner',
    title: copy.settings.scannerTitle,
    subtitle: copy.settings.scannerSubtitle,
    value: 'High Precision',
  },
] as const;

export const settingsTeamGroups = [
  {
    id: 'refund-pin',
    title: 'Require PIN for Refunds & Voids',
    subtitle: 'Manager verification modal on terminal',
  },
  {
    id: 'mask-phone',
    title: 'Mask Customer Phone Numbers',
    subtitle: 'NDPR',
    badge: 'NDPR',
    value: 'Staff only view: +234 ••• ••• 4912',
  },
] as const;

export const settingsDispatchGroups = [
  {
    id: 'whatsapp',
    title: 'Instant WhatsApp Shift Closing',
    subtitle: 'Auto-deliver day summary to owners',
    value: undefined,
  },
  {
    id: 'email-digest',
    title: 'Daily Sales Digest via Email',
    subtitle: 'Dispatched daily at 11:30 PM',
    value: 'emeka@urbangrillbistro.com',
  },
] as const;

export const settingsSecurityGroups = [
  {
    id: '2fa',
    title: 'Two-Factor Authentication',
    subtitle: 'SMS & Authenticator App backup',
    value: 'Enabled',
  },
  {
    id: 'pin',
    title: 'Change Merchant PIN / Password',
    subtitle: 'Last updated 18 days ago',
    value: undefined,
  },
  {
    id: 'devices',
    title: 'Active Logged-In Devices',
    subtitle: 'Manage session authorizations',
    value: '3 POS, 1 iPhone',
  },
] as const;

export const settingsSessionGroups = [
  {
    id: 'pause',
    title: 'Deactivate Storefront',
    subtitle: 'Temporary pause new incoming orders',
    value: 'Pause',
  },
  {
    id: 'signout',
    title: 'Sign Out of Business Portal',
    subtitle: 'Clears offline POS register cache',
    value: undefined,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Switch to customer                                                         */
/* -------------------------------------------------------------------------- */

export const switchCustomerCards = [
  {
    id: 'claims',
    label: copy.switch.claimsLabel,
    hint: copy.switch.claimsHint,
    detail: copy.switch.claimsDetail,
    icon: 'redeem' as IconName,
  },
  {
    id: 'spots',
    label: copy.switch.spotsLabel,
    hint: copy.switch.spotsHint,
    detail: copy.switch.spotsDetail,
    icon: 'bookmark' as IconName,
  },
] as const;

export const switchCustomerDeal = {
  id: 'coffee',
  name: copy.switch.dealName,
  discount: copy.switch.dealDiscount,
  hint: copy.switch.dealHint,
} as const;
