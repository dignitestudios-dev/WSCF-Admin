import { axiosInstance } from '@/lib/axios';

export interface DashboardKPIsResponse {
  success: boolean;
  message: string;
  data: {
    totalUsers: number;
    activeUsers: number;
    tournaments: {
      upcoming: number;
      ongoing: number;
      completed: number;
    };
  };
}

export const dashboardService = {
  getKPIs: async (): Promise<DashboardKPIsResponse> => {
    const { data } = await axiosInstance.get<DashboardKPIsResponse>('/dashboard/kpis');
    return data;
  },
};
