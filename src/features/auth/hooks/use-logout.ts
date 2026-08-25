import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { removeCookie } from '@/lib/cookie';

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (data) => {
      // Remove token from cookies
      removeCookie('token');

      toast.success(data?.message || 'Logged out successfully!');
      
      // Redirect to login page
      router.replace('/login');
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      
      // Even if the API call fails, we should clear the local token to ensure the user can't be stuck in a broken state
      removeCookie('token');
      
      toast.error(error.message || 'Logout encountered an issue, but local session was cleared.');
      router.replace('/login');
    },
  });
}
