import { useQuery } from '@tanstack/react-query';
import { formService, FormFieldsResponse } from '../services/form.service';

export function useFormFields(isTournamentSpecific?: boolean) {
  return useQuery<FormFieldsResponse, Error>({
    queryKey: ['formFields', isTournamentSpecific],
    queryFn: () => formService.getFormFields(isTournamentSpecific),
  });
}
