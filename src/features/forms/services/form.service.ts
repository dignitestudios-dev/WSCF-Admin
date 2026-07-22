import { axiosInstance } from '@/lib/axios';

export interface FormField {
  _id: string;
  fieldName: string;
  fieldType: string;
  nature: string;
  minLength: number;
  options: string[];
  isTournamentSpecific: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface FormFieldsResponse {
  success: boolean;
  message: string;
  data: {
    fields: FormField[];
  };
}

export interface CreateFormFieldRequest {
  fieldName: string;
  fieldType: string;
  nature: string;
  minLength: number;
  options: string[];
  isTournamentSpecific: boolean;
}

export interface UpdateFormFieldRequest extends Partial<CreateFormFieldRequest> {}

export const formService = {
  getFormFields: async (isTournamentSpecific?: boolean): Promise<FormFieldsResponse> => {
    const params: any = {};
    if (isTournamentSpecific !== undefined) {
      params.isTournamentSpecific = isTournamentSpecific;
    }
    const { data } = await axiosInstance.get<FormFieldsResponse>('/tournament/form-fields', { params });
    return data;
  },

  createFormField: async (payload: CreateFormFieldRequest): Promise<any> => {
    const { data } = await axiosInstance.post('/tournament/form-fields', payload);
    return data;
  },

  updateFormField: async (id: string, payload: UpdateFormFieldRequest): Promise<any> => {
    const { data } = await axiosInstance.put(`/tournament/form-fields/${id}`, payload);
    return data;
  },

  deleteFormField: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete(`/tournament/form-fields/${id}`);
    return data;
  }
};
