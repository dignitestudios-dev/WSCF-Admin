import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';

export function useTournaments(page: number, limit: number, search: string, status?: string) {
  return useQuery({
    queryKey: ['tournaments', page, limit, search, status],
    queryFn: () => tournamentService.getTournaments(page, limit, search, status),
  });
}
