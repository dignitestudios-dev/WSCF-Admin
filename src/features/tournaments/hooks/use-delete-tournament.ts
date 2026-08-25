import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';
import { toast } from '@/lib/toast';

export function useDeleteTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentService.deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] });
      toast.success('Tournament deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete tournament');
    }
  });
}
