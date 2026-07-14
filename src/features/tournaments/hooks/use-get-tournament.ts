import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';

export function useGetTournament(id: string) {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: () => tournamentService.getTournament(id),
    enabled: !!id,
  });
}
