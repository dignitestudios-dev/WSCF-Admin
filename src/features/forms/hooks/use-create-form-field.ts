import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formService, CreateFormFieldRequest } from '../services/form.service';
import { toast } from '@/lib/toast';

export function useCreateFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFormFieldRequest) => formService.createFormField(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formFields'] });
      toast.success('Form field created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create form field';
      toast.error(message);
    },
  });
}
