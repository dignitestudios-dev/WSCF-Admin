import { axiosInstance } from '@/lib/axios';

export interface MembershipUser {
  _id: string;
  userId: string;
  name: string;
  membershipId: string;
  purchaseDate: string;
  status: string;
}

export interface MembershipsResponse {
  success: boolean;
  message: string;
  data: MembershipUser[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export const membershipService = {
  getMemberships: async (page: number, limit: number, search: string): Promise<MembershipsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const { data } = await axiosInstance.get<MembershipsResponse>(`/membership/admin/all?${params}`);
    return data;
  },
  exportMemberships: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/membership/admin/export', {
      responseType: 'blob'
    });
    return response.data;
  },
};
