import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface SingleTeamResponse {
  success: boolean;
  message: string;
  data: {
    team: {
      _id: string;
      name: string;
      teamCode: string;
      isDeleted: boolean;
      deletedAt: string | null;
      createdAt: string;
      updatedAt: string;
      __v: number;
      memberCount: number;
    };
  };
}

export function useTeamDetails(id: string) {
  return useQuery<SingleTeamResponse, Error>({
    queryKey: ['team', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/team/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
