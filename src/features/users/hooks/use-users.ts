import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';

export function useUsers(page: number, limit: number, search: string = '') {
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
