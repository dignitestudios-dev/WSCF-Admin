import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  resultService,
  type DivisionUploadEntry,
} from '../services/result.service';

export function usePublishedResults(tournamentId: string | null) {
  return useQuery({
    queryKey: ['results', tournamentId],
    queryFn: () => resultService.get(tournamentId as string),
    enabled: Boolean(tournamentId),
  });
}

export function usePreviewResults() {
  return useMutation({
    mutationFn: ({
      tournamentId,
      entries,
    }: {
      tournamentId: string;
      entries: DivisionUploadEntry[];
    }) => resultService.preview(tournamentId, entries),
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
      entries,
      director,
    }: {
      tournamentId: string;
      entries: DivisionUploadEntry[];
      director: string;
    }) => resultService.publish(tournamentId, entries, director),
    onSuccess: (response: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ['results', variables.tournamentId] });
      // Ratings, histories and the tournament's own record all moved.
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response?.message || 'Results published');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || 'Could not publish the results'
      );
    },
  });
}
