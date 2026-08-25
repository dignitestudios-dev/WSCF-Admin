import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formService, UpdateFormFieldRequest } from '../services/form.service';
import { toast } from '@/lib/toast';

interface UpdateParams {
  id: string;
  data: UpdateFormFieldRequest;
}

export function useUpdateFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateParams) => formService.updateFormField(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formFields'] });
      toast.success('Form field updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update form field';
      toast.error(message);
    },
  });
}
