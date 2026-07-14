import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formService } from '../services/form.service';
import { toast } from 'sonner';

export function useDeleteFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formService.deleteFormField(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formFields'] });
      toast.success('Form field deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete form field';
      toast.error(message);
    },
  });
}
