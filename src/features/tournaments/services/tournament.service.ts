import { axiosInstance } from '@/lib/axios';

export interface Tournament {
  _id: string;
  isDeleted: boolean;
  title: string;
  date: string;
  location: string;
  entryFee: number;
  isPaid: boolean;
  tournamentDirector: string;
  tournamentHost: string;
  status: string; // 'upcoming' | 'completed' etc
  customDropdownOptions: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TournamentsResponse {
  success: boolean;
  message: string;
  data: {
    tournaments: Tournament[];
  };
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

export const tournamentService = {
  getTournaments: async (page: number, limit: number, search: string = '', status?: string): Promise<TournamentsResponse> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;

    const response = await axiosInstance.get<TournamentsResponse>('/tournament', { params });
    return response.data;
  },

  createTournament: async (data: any): Promise<any> => {
    const response = await axiosInstance.post('/tournament', data);
    return response.data;
  },

  getTournament: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/tournament/${id}`);
    return response.data;
  },

  updateTournament: async (id: string, data: any): Promise<any> => {
    const response = await axiosInstance.put(`/tournament/${id}`, data);
    return response.data;
  },

  getTournamentParticipants: async (id: string, page: number, limit: number, search?: string): Promise<any> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    const response = await axiosInstance.get(`/tournament/${id}/participants`, { params });
    return response.data;
  },

  deleteTournament: async (id: string): Promise<any> => {
    const response = await axiosInstance.delete(`/tournament/${id}`);
    return response.data;
  },

  exportTournamentParticipants: async (id: string, divisionId?: string): Promise<Blob> => {
    const params: any = {};
    if (divisionId) params.divisionId = divisionId;
    const response = await axiosInstance.get(`/tournament/${id}/participants/export`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  getUserHistory: async (userId: string, status: string, page: number, limit: number): Promise<any> => {
    const response = await axiosInstance.get(`/tournament/user-history/${userId}`, {
      params: { status, page, limit }
    });
    return response.data;
  },
};
