import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

export function useResetPassword() {
  return useMutation<any, any, { data: { password: string }; token: string }>({
    mutationFn: ({ data, token }) => authService.resetPassword(data, token),
    onSuccess: (res) => {
      // Clear the temporary reset password token on success
      localStorage.removeItem('reset-pass-token');
      toast.success(res?.message || 'Password updated successfully');
    },
    onError: (error) => {
      console.error('Password reset failed:', error);
      const message = error.response?.data?.message || error.message || 'Password reset failed. Please try again.';
      toast.error(message);
    },
  });
}
