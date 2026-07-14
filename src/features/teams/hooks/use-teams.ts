import { useQuery } from '@tanstack/react-query';
import { teamService, TeamsResponse } from '../services/team.service';

export function useTeams(page: number, limit: number, search: string = '') {
  return useQuery<TeamsResponse, Error>({
    queryKey: ['teams', { page, limit, search }],
    queryFn: () => teamService.getTeams(page, limit, search),
    placeholderData: (previousData) => previousData,
  });
}
