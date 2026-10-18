/**
 * Fixture data for the business trust, settings, support, billing, reviews and
 * notification surfaces, plus the customer-mode switch. Screens read from here
 * so alerts, pillars, settings rows, invoices and reviews are never inlined
 * twice.
 */
import type { IconName } from '@components/ui/Icon';
import { strings } from '@constants/strings';

/* -------------------------------------------------------------------------- */
/* Notification center                                                        */
/* -------------------------------------------------------------------------- */

export type NotificationCategoryId = 'all' | 'orders' | 'campaigns' | 'system';

export interface BusinessNotification {
  id: string;
  kind: keyof typeof strings.businessNotificationsCenter.kinds;
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
