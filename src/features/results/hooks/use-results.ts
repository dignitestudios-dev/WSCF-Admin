import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { resultService, type PublishPayload } from '../services/result.service';

/**
 * The published results, and their progress while they are still being built.
 *
 * Polls while a job is in flight and stops the moment it finishes — an
 * unconditional interval would keep hitting the API for every tournament whose
 * results were published months ago.
 */
export function usePublishedResults(tournamentId: string | null) {
  return useQuery({
    queryKey: ['results', tournamentId],
    queryFn: () => resultService.get(tournamentId as string),
    enabled: Boolean(tournamentId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.results?.status;
      return status === 'queued' || status === 'processing' ? 2000 : false;
    },
    // While a job is running the answer changes every couple of seconds, so a
    // cached copy is worse than none.
    staleTime: 0,
  });
}

export function usePreviewResults() {
  return useMutation({
    mutationFn: ({
      tournamentId,
      payload,
    }: {
      tournamentId: string;
      payload: PublishPayload;
    }) => resultService.preview(tournamentId, payload),
    onError: (error: any) => {
      // The server's message names the division and what is wrong with it, so
      // it is shown as-is rather than replaced with something generic.
      toast.error(
        error?.response?.data?.message || error?.message || 'Could not read the files'
      );
    },
  });
}

export function usePublishResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tournamentId,
      payload,
    }: {
      tournamentId: string;
      payload: PublishPayload;
    }) => resultService.publish(tournamentId, payload),
    onSuccess: (response: any, variables) => {
      // Starts the polling above; ratings, histories and the tournament's own
      // record all move once the job finishes.
      queryClient.invalidateQueries({ queryKey: ['results', variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response?.message || 'Results accepted');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || 'Could not publish the results'
      );
    },
  });
}
