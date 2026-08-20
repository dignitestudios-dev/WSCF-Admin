import { axiosInstance } from '@/lib/axios';

export interface SendBulkNotificationRequest {
  subject: string;
  message: string;
  /** Omit to email every user; set to email only that tournament's participants. */
  tournamentId?: string;
}

export interface SendBulkNotificationResponse {
  success: boolean;
  message: string;
  data: {
    jobId: string;
    audience: 'all' | 'tournament';
    tournamentId?: string;
    tournamentTitle?: string;
    recipientCount?: number;
  };
}

export interface SendIndividualNotificationRequest {
  userId: string;
  email: string;
  message: string;
}

export interface SendIndividualNotificationResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  sendBulk: async (data: SendBulkNotificationRequest): Promise<SendBulkNotificationResponse> => {
    const response = await axiosInstance.post<SendBulkNotificationResponse>('/notification/send-bulk', data);
    return response.data;
  },
  sendIndividual: async (data: SendIndividualNotificationRequest): Promise<SendIndividualNotificationResponse> => {
    const response = await axiosInstance.post<SendIndividualNotificationResponse>('/notification/send-individual', data);
    return response.data;
  },
};
