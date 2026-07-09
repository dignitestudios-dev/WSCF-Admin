import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { LoginFormData } from '../schema/login.schema';
import { AuthResponse } from '../types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { setCookie } from '@/lib/cookie';
export function useLogin() {
  const router = useRouter();

  return useMutation<AuthResponse, any, LoginFormData>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (data) => {
      console.log('Login successful:', data);

      if (data.data?.token) {
        setCookie('token', data.data.token, 7); // Save token for 7 days
      }

      toast.success(data.message || 'Login successful!');
      router.replace('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    },
  });
}
