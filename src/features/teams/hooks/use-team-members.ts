import { useQuery } from '@tanstack/react-query';
import { teamService, TeamMembersResponse } from '../services/team.service';

export function useTeamMembers(teamId: string, page: number, limit: number, search: string = '') {
  return useQuery<TeamMembersResponse, Error>({
    queryKey: ['teamMembers', { teamId, page, limit, search }],
    queryFn: () => teamService.getTeamMembers(teamId, page, limit, search),
    enabled: !!teamId,
    placeholderData: (previousData) => previousData,
  });
}
