import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { toast } from '@/lib/toast';

/**
 * Resending from the verify screen.
 *
 * Separate from useForgotPassword, which navigates to /verify-otp on success.
 * Reusing it here pushed the route the user was already on, and the cooldown
 * belongs to whoever triggered the send rather than to this hook.
 */
export function useResendOtp() {
  return useMutation<any, any, { email: string; purpose?: 'verify' | 'reset' }>({
    mutationFn: (data) => authService.resendOtp(data),
    onSuccess: (data) => {
      localStorage.setItem('otp-timer-expires', String(Date.now() + 60000));
      toast.success(data?.message || 'A new code has been sent.');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to resend the code. Please try again.';
      toast.error(message);
    },
  });
}
