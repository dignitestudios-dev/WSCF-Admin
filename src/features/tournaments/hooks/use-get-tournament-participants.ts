import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../services/tournament.service';
import { LIST_BATCH_SIZE, useInfiniteList } from '@/hooks/use-infinite-list';

export function useGetTournamentParticipants(id: string, page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ['tournamentParticipants', id, page, limit, search],
    queryFn: () => tournamentService.getTournamentParticipants(id, page, limit, search),
    enabled: !!id,
  });
}

export function useInfiniteTournamentParticipants(id: string, search?: string) {
  return useInfiniteList({
    queryKey: ['tournamentParticipants', id, 'infinite', { search }],
    fetchPage: (page) =>
      tournamentService.getTournamentParticipants(id, page, LIST_BATCH_SIZE, search),
    enabled: !!id,
  });
}
