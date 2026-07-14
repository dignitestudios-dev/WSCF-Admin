import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';

export function useGetTournamentParticipants(id: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['tournamentParticipants', id, page, limit],
    queryFn: () => tournamentService.getTournamentParticipants(id, page, limit),
    enabled: !!id,
  });
}
