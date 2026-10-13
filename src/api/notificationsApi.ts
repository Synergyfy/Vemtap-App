import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.string().nullish().default('info'),
  isRead: z.boolean().nullish().default(false),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  actionUrl: z.string().nullable().optional(),
  /**
   * Structured payload the row was written with — `{ stat, footnote, cta }`.
   * Two-argument `z.record` (key, value) rather than the single-argument form,
   * which needs a second type argument in this Zod version. Unknown values
   * rather than `any`: the payload's shape is the backend's to extend.
   */
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type NotificationItem = z.infer<typeof notificationSchema>;

export const notificationListSchema = z.array(notificationSchema);
export type NotificationList = z.infer<typeof notificationListSchema>;

export const notificationUnreadCountSchema = z.union([
  z.number(),
  z.object({ count: z.number() }).transform(val => val.count),
]);

/**
 * The business feed's page envelope. `data` is already validated as
 * notifications; the counters ride alongside so the badge does not need a
 * second round trip that could disagree with the list it labels.
 */
export const businessNotificationPageSchema = z.object({
  data: notificationListSchema,
  total: z.number().nullish().default(0),
  unreadCount: z.number().nullish().default(0),
  page: z.number().nullish().default(1),
  limit: z.number().nullish().default(20),
});
export type BusinessNotificationPage = z.infer<typeof businessNotificationPageSchema>;

/**
 * The shape every notification writer stamps into `metadata`.
 *
 * One definition read by both notification screens: the backend owns this
 * payload, and a second copy of its shape in each screen is how the two start
 * disagreeing about what a stat block is.
 */
export interface NotificationMetadata {
  stat?: { label?: string; value?: string; trend?: string };
  footnote?: string;
  cta?: string;
}

/** Reads the stat block, or undefined when there is no figure to show. */
export function notificationStat(
  metadata: Record<string, unknown> | null | undefined,
): NotificationMetadata['stat'] | undefined {
  const stat = metadata?.stat;
  if (!stat || typeof stat !== 'object') return undefined;
  const record = stat as Record<string, unknown>;
  return {
    label: typeof record.label === 'string' ? record.label : undefined,
    value: typeof record.value === 'string' ? record.value : undefined,
    trend: typeof record.trend === 'string' ? record.trend : undefined,
  };
}

/** Reads a string out of `metadata` without trusting its shape. */
export function notificationText(
  metadata: Record<string, unknown> | null | undefined,
  key: 'footnote' | 'cta',
): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/** Keys the Messages-style filter chips address, plus the `all` catch-all. */
export type NotificationCategoryKey = 'deals' | 'bookings' | 'rewards' | 'system';
export type NotificationFilterKey = NotificationCategoryKey | 'all';

/**
 * The filter chip a row belongs under, derived from the backend's `type`.
 *
 * `type` is a free-text column, so this is driven by the values the writers
 * actually emit rather than by a guess at the shape. The exact list comes from
 * the notification call sites (`deal_spike`, `promotion_claim`, `new_order`,
 * `order_status`, `new_pos_order`, `new_message`, `password_reset`, and the
 * `announcement`/`info`/`warning` defaults).
 *
 * The substring arms exist for writers that namespace instead (`deal.claimed`,
 * `booking.confirmed`, `loyalty.points`), which is why matching is on segments
 * rather than equality.
 *
 * Deliberately total: an unrecognised type lands in `system` rather than
 * vanishing from the list, so a new writer is visible instead of invisible.
 */
export function notificationCategory(
  type: string | null | undefined,
): NotificationCategoryKey {
  const value = (type ?? '').toLowerCase();
  if (!value) return 'system';
  if (value.includes('deal') || value.includes('offer') || value.includes('claim')) {
    return 'deals';
  }
  if (value.includes('booking') || value.includes('order') || value.includes('pos')) {
    return 'bookings';
  }
  if (value.includes('reward') || value.includes('point') || value.includes('loyalty')) {
    return 'rewards';
  }
  return 'system';
}

export const notificationsApi = {
  /**
   * List all notifications for the current authenticated user.
   */
  async list(options: ApiRequestOptions = {}): Promise<NotificationItem[]> {
    return requestValidated<NotificationItem[]>(
      {
        method: 'GET',
        url: '/notifications',
        ...options,
      },
      notificationListSchema,
    );
  },

  /**
   * A venue's notifications, across everyone who works there.
   *
   * Distinct from `list`, which is the caller's own rows: a business needs the
   * events that happened at the business, whoever the row was addressed to.
   * Unread rides with the page so the bell and the list that fills it come off
   * one read.
   */
  async businessFeed(
    options: { page?: number; limit?: number } = {},
    apiOptions: ApiRequestOptions = {},
  ): Promise<BusinessNotificationPage> {
    return requestValidated<BusinessNotificationPage>(
      {
        method: 'GET',
        url: '/notifications/business',
        ...(options.page != null ? { page: String(options.page) } : {}),
        ...(options.limit != null ? { limit: String(options.limit) } : {}),
        ...apiOptions,
      },
      businessNotificationPageSchema,
    );
  },

  /**
   * Get unread notifications count.
   */
  async getUnreadCount(options: ApiRequestOptions = {}): Promise<number> {
    return requestValidated<number>(
      {
        method: 'GET',
        url: '/notifications/unread-count',
        ...options,
      },
      notificationUnreadCountSchema,
    );
  },

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(
    id: string,
    options: ApiRequestOptions = {},
  ): Promise<NotificationItem> {
    return requestValidated<NotificationItem>(
      {
        method: 'PATCH',
        url: `/notifications/${id}/read`,
        ...options,
      },
      notificationSchema,
    );
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(options: ApiRequestOptions = {}): Promise<void> {
    await requestValidated<unknown>(
      {
        method: 'PATCH',
        url: '/notifications/read-all',
        ...options,
      },
      z.unknown(),
    );
  },
};
