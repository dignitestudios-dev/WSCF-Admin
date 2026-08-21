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

/** One notification as this admin sees it — `isRead` is per-recipient. */
export interface NotificationItem {
  _id: string;
  type:
    | 'tournament.registered'
    | 'tournament.rescheduled'
    | 'membership.renewed'
    | 'membership.expired'
    | 'membership.payment_failed'
    | 'team.member_added'
    | 'result.uploaded'
    | 'custom';
  audience: 'player' | 'admin';
  title: string;
  body: string;
  data?: { entity?: string; entityId?: string | null; [key: string]: unknown };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsPage {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationItem[];
    unreadCount: number;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: { unreadCount: number };
}

export const notificationService = {
  getNotifications: async (page: number, limit: number): Promise<NotificationsPage> => {
    const response = await axiosInstance.get<NotificationsPage>('/notification', {
      params: { page, limit },
    });
    return response.data;
  },
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await axiosInstance.get<UnreadCountResponse>('/notification/unread-count');
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await axiosInstance.patch(`/notification/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/notification/read-all');
    return response.data;
  },
  remove: async (id: string) => {
    const response = await axiosInstance.delete(`/notification/${id}`);
    return response.data;
  },
  clearAll: async () => {
    const response = await axiosInstance.delete('/notification/clear-all');
    return response.data;
  },
  sendBulk: async (data: SendBulkNotificationRequest): Promise<SendBulkNotificationResponse> => {
    const response = await axiosInstance.post<SendBulkNotificationResponse>('/notification/send-bulk', data);
    return response.data;
  },
  sendIndividual: async (data: SendIndividualNotificationRequest): Promise<SendIndividualNotificationResponse> => {
    const response = await axiosInstance.post<SendIndividualNotificationResponse>('/notification/send-individual', data);
    return response.data;
  },
};
