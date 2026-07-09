import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useForgotPassword() {
  const router = useRouter();

  return useMutation<any, any, { email: string }>({
    mutationFn: (data) => authService.forgotPassword(data),
    onSuccess: (data, variables) => {
      localStorage.setItem('otp-timer-expires', String(Date.now() + 60000));
      toast.success(data?.message || 'OTP Sent Successfully');
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => {
      console.error('Forgot password request failed:', error);
      const message = error.response?.data?.message || error.message || 'Failed to send OTP. Please check your credentials.';
      toast.error(message);
    },
  });
}
