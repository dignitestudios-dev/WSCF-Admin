import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { toast } from 'sonner';

export function useAddTeamMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string }) => 
      teamService.addTeamMember(teamId, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Member added to team successfully');
      queryClient.invalidateQueries({ queryKey: ['teamMembers', { teamId }] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to add member';
      toast.error(message);
    },
  });
}
