import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { toast } from 'sonner';

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; teamCode: string; schoolId: string }) => teamService.createTeam(data),
    onSuccess: (data) => {
      toast.success(data.message || 'Team created successfully');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to create team';
      toast.error(message);
    },
  });
}
