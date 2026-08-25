import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export function useVerifyOtp() {
  const router = useRouter();

  return useMutation<any, any, { email: string; otp: string }>({
    mutationFn: (data) => authService.verifyOtp(data),
    onSuccess: (data) => {
      console.log('OTP verification successful:', data);

      if (data?.data?.token) {
        localStorage.setItem('reset-pass-token', data.data.token);
      }

      localStorage.removeItem('otp-timer-expires');

      toast.success(data?.message || 'OTP Verified Successfully');
      router.push('/reset-password');
    },
    onError: (error) => {
      console.error('OTP verification failed:', error);
      const message = error.response?.data?.message || error.message || 'Invalid or Expired OTP';
      toast.error(message);
    },
  });
}
