import { useQuery, useMutation } from '@tanstack/react-query';
import { membershipService } from '../services/membership.service';

export function useMemberships(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ['memberships', page, limit, search],
    queryFn: () => membershipService.getMemberships(page, limit, search),
  });
}

export function useExportMemberships() {
  return useMutation({
    mutationFn: () => membershipService.exportMemberships(),
  });
}
