import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tournamentService } from '../services/tournament.service';

export function useTournaments(page: number, limit: number, search: string, status?: string) {
  return useQuery({
    queryKey: ['tournaments', page, limit, search, status],
    queryFn: () => tournamentService.getTournaments(page, limit, search, status),
  });
}

/**
 * Marks an ongoing tournament completed. The API refuses a tournament that
 * has not started yet, so the error message is worth surfacing verbatim.
 */
export function useMarkTournamentCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentService.markCompleted(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
      toast.success((result as { message?: string })?.message || 'Tournament marked as completed');
    },
    onError: (error) =>
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not mark the tournament as completed',
      ),
  });
}
