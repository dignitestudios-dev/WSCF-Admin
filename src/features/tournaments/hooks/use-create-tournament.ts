import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';
import { toast } from '@/lib/toast';

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => tournamentService.createTournament(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create tournament');
    }
  });
}
