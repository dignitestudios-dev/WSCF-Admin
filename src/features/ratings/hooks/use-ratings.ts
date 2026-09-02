import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { ratingService } from '../services/rating.service';

export function useRatingRequests(
  page = 1,
  limit = 10,
  search = '',
  status: 'pending' | 'assigned' | 'unrated' = 'pending'
) {
  return useQuery({
    queryKey: ['rating-requests', page, limit, search, status],
    queryFn: () => ratingService.getRatingRequests(page, limit, search, status),
  });
}

/** How many players are waiting — drives the sidebar badge. */
export function usePendingRatingCount() {
  return useQuery({
    queryKey: ['rating-requests', 'pending-count'],
    queryFn: () => ratingService.getRatingRequests(1, 1, '', 'pending'),
    select: (response) => response.pagination?.totalItems ?? 0,
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
      // The queue, the badge and the master file all change together: the
      // player leaves Pending, and the record they took is now claimed.
      queryClient.invalidateQueries({ queryKey: ['rating-requests'] });
      queryClient.invalidateQueries({ queryKey: ['master-file'] });
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
