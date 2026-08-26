import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';

export function useUsers(
  page: number,
  limit: number,
  search: string = '',
) {
  return useQuery({
    queryKey: ['users', { page, limit, search }],
    queryFn: () => userService.getUsers(page, limit, search),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserDetails(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserDetails(id),
    enabled: !!id,
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * Status is a property of the ACCOUNT, not of one player: a parent signs in
 * once for every child they have, so `accountId` is the parent and `playerId`
 * is only there to refresh the page that triggered it.
 *
 * The account id arrives with the loaded row, so it may be empty on the first
 * render — the caller keeps the button disabled until it is not.
 */
export function useDeactivateUser(accountId: string, playerId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => userService.deactivateUser(accountId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', playerId ?? accountId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useActivateUser(accountId: string, playerId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userService.activateUser(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', playerId ?? accountId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
