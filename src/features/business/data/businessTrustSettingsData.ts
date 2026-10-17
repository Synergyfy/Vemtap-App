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
/* Business settings                                                         */
/* -------------------------------------------------------------------------- */

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
