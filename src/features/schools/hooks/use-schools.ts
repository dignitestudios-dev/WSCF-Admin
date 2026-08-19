import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolService } from '../services/school.service';
import { toast } from 'sonner';

export function useSchools(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: ['schools', page, limit, search],
    queryFn: () => schoolService.getSchools(page, limit, search),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSchoolDetails(id: string) {
  return useQuery({
    queryKey: ['school', id],
    queryFn: () => schoolService.getSchool(id),
    enabled: !!id,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => schoolService.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create school');
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => schoolService.updateSchool(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update school');
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolService.deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete school');
    },
  });
}

export function useAssignUserToSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => schoolService.assignUser(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] });
      toast.success('User assigned to school successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign user');
    },
  });
}
