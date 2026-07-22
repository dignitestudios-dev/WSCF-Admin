import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';

export function useUserTournamentHistory(userId: string, status: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['user-tournament-history', userId, status, page, limit],
    queryFn: () => tournamentService.getUserHistory(userId, status, page, limit),
    enabled: !!userId,
  });
}
