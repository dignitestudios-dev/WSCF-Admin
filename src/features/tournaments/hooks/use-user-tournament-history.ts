import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';
import { LIST_BATCH_SIZE, useInfiniteList } from '@/hooks/use-infinite-list';

export function useUserTournamentHistory(userId: string, status: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['user-tournament-history', userId, status, page, limit],
    queryFn: () => tournamentService.getUserHistory(userId, status, page, limit),
    enabled: !!userId,
  });
}

export function useInfiniteUserTournamentHistory(userId: string, status: string) {
  return useInfiniteList({
    queryKey: ['user-tournament-history', userId, status, 'infinite'],
    fetchPage: (page) => tournamentService.getUserHistory(userId, status, page, LIST_BATCH_SIZE),
    enabled: !!userId,
  });
}
