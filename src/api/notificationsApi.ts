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
});
export type NotificationItem = z.infer<typeof notificationSchema>;

export const notificationListSchema = z.array(notificationSchema);
export type NotificationList = z.infer<typeof notificationListSchema>;

export const notificationUnreadCountSchema = z.union([
  z.number(),
  z.object({ count: z.number() }).transform(val => val.count),
]);

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
