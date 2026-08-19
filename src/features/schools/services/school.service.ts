import { axiosInstance } from '@/lib/axios';

export interface School {
  _id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolsResponse {
  success: boolean;
  message: string;
  data: {
    schools: School[];
    pagination?: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const schoolService = {
  getSchools: async (page = 1, limit = 10, search = ''): Promise<SchoolsResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const response = await axiosInstance.get<SchoolsResponse>(`/schools?${params.toString()}`);
    return response.data;
  },

  getSchool: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/schools/${id}`);
    return response.data;
  },

  createSchool: async (data: any): Promise<any> => {
    const response = await axiosInstance.post('/schools', data);
    return response.data;
  },

  updateSchool: async (id: string, data: any): Promise<any> => {
    const response = await axiosInstance.put(`/schools/${id}`, data);
    return response.data;
  },

  deleteSchool: async (id: string): Promise<any> => {
    const response = await axiosInstance.delete(`/schools/${id}`);
    return response.data;
  },

  assignUser: async (id: string, userId: string): Promise<any> => {
    const response = await axiosInstance.post(`/schools/${id}/assign-user`, { userId });
    return response.data;
  },
};
