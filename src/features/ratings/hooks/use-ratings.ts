import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { ratingService } from '../services/rating.service';

export function useRatingRequests(
  page = 1,
  limit = 10,
  search = '',
  status: 'pending' | 'assigned' | 'unrated' = 'pending'
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['rating-requests', page, limit, search, status],
    queryFn: async () => {
      const response = await ratingService.getRatingRequests(page, limit, search, status);
      // Immediately sync the sidebar pending-count badge when viewing the default pending list
      if (status === 'pending' && !search && response?.pagination?.totalItems !== undefined) {
        queryClient.setQueryData(['rating-requests', 'pending-count'], {
          pagination: { totalItems: response.pagination.totalItems },
        });
      }
      return response;
    },
    refetchInterval: 10000, // Poll every 10 seconds in the background
    refetchOnWindowFocus: true,
  });
}

/** How many players are waiting — drives the sidebar badge. */
export function usePendingRatingCount() {
  return useQuery({
    queryKey: ['rating-requests', 'pending-count'],
    queryFn: () => ratingService.getRatingRequests(1, 1, '', 'pending'),
    select: (response) => response?.pagination?.totalItems ?? 0,
    refetchInterval: 10000, // Poll every 10 seconds in the background
    refetchOnWindowFocus: true,
  });
}

/**
 * Master file lookup for the assign panel.
 *
 * Disabled until there is something to search: the file is large, and an empty
 * query would pull the first page of every player in it for no reason.
 */
export function useMasterFileSearch(search: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['master-file', search, page, limit],
    queryFn: () => ratingService.searchMasterFile(search, page, limit),
    enabled: search.trim().length > 0,
  });
}

export function useAssignRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      childId,
      payload,
    }: {
      childId: string;
      payload: Parameters<typeof ratingService.assignRating>[1];
    }) => ratingService.assignRating(childId, payload),

    onSuccess: (response) => {
      // The queue, the badge, the master file and user profiles all update
      queryClient.invalidateQueries({ queryKey: ['rating-requests'] });
      queryClient.invalidateQueries({ queryKey: ['master-file'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response?.message || 'Rating assigned');
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to assign the rating'
      );
    },
  });
}
