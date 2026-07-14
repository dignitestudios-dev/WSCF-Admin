import { useQuery } from '@tanstack/react-query';
import { formService, FormFieldsResponse } from '../services/form.service';

export function useFormFields() {
  return useQuery<FormFieldsResponse, Error>({
    queryKey: ['formFields'],
    queryFn: () => formService.getFormFields(),
  });
}
