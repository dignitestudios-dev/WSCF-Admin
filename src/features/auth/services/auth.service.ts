import { axiosInstance } from '@/lib/axios';
import { LoginFormData } from '../schema/login.schema';
import { AuthResponse } from '../types';

export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};
