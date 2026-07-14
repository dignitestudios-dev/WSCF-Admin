import { axiosInstance } from '@/lib/axios';

export interface BackendTeam {
  _id: string;
  name: string;
  teamCode?: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TeamsResponse {
  success: boolean;
  message: string;
  data: {
    teams: BackendTeam[];
  };
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface BackendMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    isEmailVerified?: boolean;
  };
  teamId: string;
  name: string;
  grade?: string;
  rating?: number;
  totalTournaments?: number;
  totalWins?: number;
  createdAt?: string;
  updatedAt?: string;
  membershipId?: string;
  teamMemberId?: string;
}

export interface TeamMembersResponse {
  success: boolean;
  message: string;
  data: {
    members: BackendMember[];
  };
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export const teamService = {
  getTeams: async (page: number, limit: number, search: string = ''): Promise<TeamsResponse> => {
    const response = await axiosInstance.get<TeamsResponse>('/team', {
      params: {
        page,
        limit,
        search,
      },
    });
    return response.data;
  },
  createTeam: async (data: { name: string; teamCode: string }): Promise<any> => {
    const response = await axiosInstance.post('/team', data);
    return response.data;
  },
  deleteTeam: async (id: string): Promise<any> => {
    const response = await axiosInstance.delete(`/team/${id}`);
    return response.data;
  },
  getTeamMembers: async (teamId: string, page: number, limit: number, search: string = ''): Promise<TeamMembersResponse> => {
    const response = await axiosInstance.get<TeamMembersResponse>(`/team/${teamId}/members`, {
      params: {
        page,
        limit,
        search,
      },
    });
    return response.data;
  },
  addTeamMember: async (teamId: string, data: { userId: string }): Promise<any> => {
    const response = await axiosInstance.post(`/team/${teamId}/members`, data);
    return response.data;
  },
};
