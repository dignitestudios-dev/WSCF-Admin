import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';

export function useUsers(
  page: number,
  limit: number,
  search: string = '',
  schoolId?: string
) {
  return useQuery({
    // schoolId must be part of the key, or the cached unfiltered list is served
    queryKey: ['users', { page, limit, search, schoolId }],
    queryFn: () => userService.getUsers(page, limit, search, schoolId),
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

export function useDeactivateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => userService.deactivateUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useActivateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
