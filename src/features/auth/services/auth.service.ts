import { axiosInstance } from '@/lib/axios';
import { LoginFormData } from '../schema/login.schema';
import { AuthResponse } from '../types';

export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/admin/signin', data);
    return response.data;
  },
  logout: async (): Promise<any> => {
    const response = await axiosInstance.post('/auth/admin/logout');
    return response.data;
  },
  forgotPassword: async (data: { email: string }): Promise<any> => {
    const response = await axiosInstance.post('/auth/admin/forgot-password', data);
    return response.data;
  },
  verifyOtp: async (data: { email: string; otp: string }): Promise<any> => {
    const response = await axiosInstance.post('/auth/admin/verify-otp', data);
    return response.data;
  },
  resetPassword: async (data: { password: string }, token: string): Promise<any> => {
    const response = await axiosInstance.post('/auth/admin/reset-password', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
