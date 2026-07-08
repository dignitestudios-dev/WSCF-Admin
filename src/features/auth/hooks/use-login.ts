import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { LoginFormData } from '../schema/login.schema';
import { AuthResponse } from '../types';
import { toast } from 'sonner';

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginFormData>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // TODO: Save token, update state, redirect to dashboard
    },
    onError: (error) => {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });
}
