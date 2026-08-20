import { axiosInstance } from '@/lib/axios';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  sigma?: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

/** A row from GET /user — the list endpoint returns more than the bare User. */
export interface UserListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  playerProfile?: {
    membershipId?: string;
    grade?: string;
    city?: string;
    rating?: number;
  } | null;
  team?: {
    _id: string;
    name: string;
    teamCode?: string;
  } | null;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: any[];
    pagination: {
      totalItems: number;
      currentPage: number;
      itemsPerPage: number;
      totalPages: number;
    };
  };
}

export interface ParentDetails {
  name: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface School {
  _id: string;
  name: string;
  address?: string;
}

export interface TeamSummary {
  _id: string;
  name: string;
  teamCode?: string;
}

export interface PlayerProfile {
  _id: string;
  userId: string;
  /** Populated by the user-details endpoint; null when the player has no team. */
  teamId?: TeamSummary | null;
  /** Populated school, or null when the player is unassigned. */
  school?: School | null;
  city: string;
  streetAddress: string;
  zipCode: number;
  grade: string;
  dob: string;
  rating: number;
  totalTournaments: number;
  totalWins: number;
  createdAt: string;
  updatedAt: string;
  membershipId: string;
  parents?: {
    father?: ParentDetails;
    mother?: ParentDetails;
  };
}

export interface UserDetailsResponse {
  success: boolean;
  message: string;
  data: {
    user: User & { isEmailVerified?: boolean; updatedAt?: string };
    playerProfile: PlayerProfile | null;
    membership: any | null;
  };
}

export const userService = {
  getUsers: async (
    page: number,
    limit: number,
    search: string = '',
    schoolId?: string
  ): Promise<UsersResponse> => {
    const response = await axiosInstance.get<UsersResponse>('/user', {
      params: {
        page,
        limit,
        search,
        // Omitted unless set, so the unfiltered list is unaffected
        ...(schoolId ? { schoolId } : {}),
      },
    });
    return response.data;
  },
  getUserDetails: async (id: string): Promise<UserDetailsResponse> => {
    const response = await axiosInstance.get<UserDetailsResponse>(`/user/${id}`);
    return response.data;
  },
  exportUsers: async (): Promise<Blob> => {
    const response = await axiosInstance.get(`/user/export`, {
      responseType: 'blob'
    });
    return response.data;
  },
  updateUser: async (id: string, data: any): Promise<any> => {
    const response = await axiosInstance.put(`/user/${id}`, data);
    return response.data;
  },
  deactivateUser: async (id: string, reason?: string): Promise<any> => {
    const response = await axiosInstance.patch(`/user/${id}/deactivate`, { reason });
    return response.data;
  },
  activateUser: async (id: string): Promise<any> => {
    const response = await axiosInstance.patch(`/user/${id}/activate`);
    return response.data;
  },
};
