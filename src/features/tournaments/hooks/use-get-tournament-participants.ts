import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';

export function useGetTournamentParticipants(id: string, page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ['tournamentParticipants', id, page, limit, search],
    queryFn: () => tournamentService.getTournamentParticipants(id, page, limit, search),
    enabled: !!id,
  });
}
