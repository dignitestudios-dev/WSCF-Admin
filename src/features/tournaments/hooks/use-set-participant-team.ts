import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';
import { toast } from '@/lib/toast';

export function useSetParticipantTeam(tournamentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participantId, teamId }: { participantId: string; teamId: string | null }) =>
      tournamentService.setParticipantTeam(tournamentId, participantId, teamId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tournamentParticipants', tournamentId] });
      toast.success(response?.message || 'Team updated for this tournament entry');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || 'Failed to update the team');
    },
  });
}
