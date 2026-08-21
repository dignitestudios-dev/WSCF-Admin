import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MemberBatchResponse, teamService } from '../services/team.service';
import {
  collectMemberMoves,
  collectMemberProblems,
} from '../components/member-result-summary';

const teamKeys = {
  list: 'teams',
  detail: 'team',
  members: 'team-members',
};

function apiMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  );
}

// No `placeholderData`: keeping the previous page's rows on screen would leave
// `isLoading` false while a new search is in flight, so the table never showed
// its skeletons. Every other list in the panel behaves this way.
export function useTeams(page: number, limit: number, search = '') {
  return useQuery({
    queryKey: [teamKeys.list, { page, limit, search }],
    queryFn: () => teamService.getTeams(page, limit, search),
  });
}

export function useTeamDetails(teamId: string) {
  return useQuery({
    queryKey: [teamKeys.detail, teamId],
    queryFn: () => teamService.getTeamDetails(teamId),
    enabled: Boolean(teamId),
  });
}

export function useTeamMembers(teamId: string, page: number, limit: number, search = '') {
  return useQuery({
    queryKey: [teamKeys.members, teamId, { page, limit, search }],
    queryFn: () => teamService.getTeamMembers(teamId, page, limit, search),
    enabled: Boolean(teamId),
  });
}

/**
 * Every mutation refreshes the list, the team and its roster — a member moving
 * between teams changes the counts on both, so a narrower invalidation would
 * leave stale numbers on screen.
 */
function useTeamMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  fallbackError: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [teamKeys.list] });
      queryClient.invalidateQueries({ queryKey: [teamKeys.detail] });
      queryClient.invalidateQueries({ queryKey: [teamKeys.members] });

      // The API's own message summarises the batch ("3 of 4 added"), which is
      // more informative than anything generic. Anything that did not simply
      // succeed gets its own line explaining why.
      const batch = result as MemberBatchResponse;
      const message = batch?.message;
      const problems = collectMemberProblems(batch?.data?.results);
      const moves = collectMemberMoves(batch?.data?.results);

      if (message) {
        toast.success(message, {
          description:
            [...problems, ...moves].length > 0
              ? [...problems, ...moves].join('\n')
              : undefined,
          // Long enough to read a few lines of explanation.
          duration: problems.length > 0 ? 8000 : 4000,
        });
      }
    },
    onError: (error) => toast.error(apiMessage(error, fallbackError)),
  });
}

export function useCreateTeam() {
  return useTeamMutation(
    (data: { name: string; playerIds?: string[] }) => teamService.createTeam(data),
    'Could not create the team'
  );
}

export function useUpdateTeam() {
  return useTeamMutation(
    ({ teamId, name }: { teamId: string; name: string }) =>
      teamService.updateTeam(teamId, { name }),
    'Could not update the team'
  );
}

export function useDeleteTeam() {
  return useTeamMutation(
    (teamId: string) => teamService.deleteTeam(teamId),
    'Could not delete the team'
  );
}

export function useAddTeamMembers() {
  return useTeamMutation(
    ({ teamId, playerIds }: { teamId: string; playerIds: string[] }) =>
      teamService.addMembers(teamId, playerIds),
    'Could not add members'
  );
}

export function useRemoveTeamMembers() {
  return useTeamMutation(
    ({ teamId, playerIds }: { teamId: string; playerIds: string[] }) =>
      teamService.removeMembers(teamId, playerIds),
    'Could not remove members'
  );
}
