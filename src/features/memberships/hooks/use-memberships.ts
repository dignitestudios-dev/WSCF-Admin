import { useQuery, useMutation } from '@tanstack/react-query';
import { membershipService } from '../services/membership.service';
import { LIST_BATCH_SIZE, useInfiniteList } from '@/hooks/use-infinite-list';

export function useMemberships(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ['memberships', page, limit, search],
    queryFn: () => membershipService.getMemberships(page, limit, search),
  });
}

export function useInfiniteMemberships(search: string) {
  return useInfiniteList({
    queryKey: ['memberships', 'infinite', { search }],
    fetchPage: (page) => membershipService.getMemberships(page, LIST_BATCH_SIZE, search),
  });
}

export function useExportMemberships() {
  return useMutation({
    mutationFn: () => membershipService.exportMemberships(),
  });
}
