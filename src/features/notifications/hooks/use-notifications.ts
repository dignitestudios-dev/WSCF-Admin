import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationService, NotificationsPage } from '../services/notification.service';

const PAGE_SIZE = 15;

/** Both the feed and the badge derive from this, so one invalidate refreshes everything. */
export const notificationKeys = {
  feed: ['notifications', 'feed'] as const,
  unread: ['notifications', 'unread-count'] as const,
};

/**
 * The dropdown's feed. Pages are appended as the user scrolls; the query stops
 * asking once the last page is reached.
 */
export function useNotificationFeed(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: notificationKeys.feed,
    queryFn: ({ pageParam }) => notificationService.getNotifications(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage: NotificationsPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    // Only fetched while the dropdown is open.
    enabled,
  });
}

/**
 * The badge count.
 *
 * Deliberately not realtime and not polled: it is read once when the panel
 * loads, and again after anything that could change it (marking read, clearing,
 * or opening the feed).
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: () => notificationService.getUnreadCount(),
  });
}

function useNotificationMutation<TArgs>(
  mutationFn: (args: TArgs) => Promise<unknown>,
  options: { successMessage?: string; errorMessage: string } = { errorMessage: 'Something went wrong' }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.feed });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread });
      if (options.successMessage) toast.success(options.successMessage);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        options.errorMessage;
      toast.error(message);
    },
  });
}

// Marking one as read is silent — the row visibly changes, so a toast is noise.
export function useMarkNotificationRead() {
  return useNotificationMutation<string>((id) => notificationService.markAsRead(id), {
    errorMessage: 'Could not mark as read',
  });
}

export function useMarkAllNotificationsRead() {
  return useNotificationMutation<void>(() => notificationService.markAllAsRead(), {
    successMessage: 'All notifications marked as read',
    errorMessage: 'Could not mark all as read',
  });
}

export function useRemoveNotification() {
  return useNotificationMutation<string>((id) => notificationService.remove(id), {
    errorMessage: 'Could not remove the notification',
  });
}

export function useClearAllNotifications() {
  return useNotificationMutation<void>(() => notificationService.clearAll(), {
    successMessage: 'Notifications cleared',
    errorMessage: 'Could not clear notifications',
  });
}
