import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationItem } from '@api/notificationsApi';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsApi.list(),
    staleTime: 60_000,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery<number>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: updated => {
      queryClient.setQueryData<NotificationItem[]>(notificationKeys.list(), old =>
        old ? old.map(item => (item.id === updated.id ? updated : item)) : [],
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData<NotificationItem[]>(notificationKeys.list(), old =>
        old ? old.map(item => ({ ...item, isRead: true })) : [],
      );
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
    },
  });
}
