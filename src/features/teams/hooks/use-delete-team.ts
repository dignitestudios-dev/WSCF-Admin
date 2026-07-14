import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { toast } from 'sonner';

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Team deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete team';
      toast.error(message);
    },
  });
}
