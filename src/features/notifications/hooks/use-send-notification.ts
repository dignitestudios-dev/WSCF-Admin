import { useMutation } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { notificationService, SendBulkNotificationRequest, SendBulkNotificationResponse, SendIndividualNotificationRequest, SendIndividualNotificationResponse } from '../services/notification.service';

export function useSendNotification() {
  return useMutation<SendBulkNotificationResponse, Error, SendBulkNotificationRequest>({
    mutationFn: (data) => notificationService.sendBulk(data),
    onSuccess: (data) => {
      toast.success(data.message || 'Push notification sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send notification');
    },
  });
}

export function useSendIndividualNotification() {
  return useMutation<SendIndividualNotificationResponse, Error, SendIndividualNotificationRequest>({
    mutationFn: (data) => notificationService.sendIndividual(data),
    onSuccess: (data) => {
      toast.success(data.message || 'Notification sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send notification');
    },
  });
}
