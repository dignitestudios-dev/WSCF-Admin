import { axiosInstance } from '@/lib/axios';

/**
 * The account behind a player: the parent.
 *
 * Siblings share one of these, so its email, address, guardian details and
 * status apply to every player on it — deactivating hits all of them.
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt: string;
  address?: {
    city?: string | null;
    streetAddress?: string | null;
    zipCode?: number | null;
  };
  parents?: {
    father?: ParentDetails;
    mother?: ParentDetails;
  };
}

/**
 * A row from GET /user.
 *
 * A user in this panel is a player, and a player is a child: `_id` is the
 * player profile, and every action that targets a player takes it. Email,
 * status and address come from `account` — the parent — and are mirrored at
 * the top level for the columns that already read them there.
 */
export interface UserListItem {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  membershipId?: string;
  grade?: string;
  gender?: string;
  dob?: string;
  rating?: number;
  createdAt: string;

  /** The parent account. Deactivation and email target this, not the player. */
  account?: {
    _id: string;
    name: string;
    email: string;
    phone?: string | null;
    status: string;
    address?: {
      city?: string | null;
      streetAddress?: string | null;
      zipCode?: number | null;
    };
    parents?: {
      father?: ParentDetails;
      mother?: ParentDetails;
    };
  } | null;

  email: string | null;
  status: string | null;

  team?: {
    _id: string;
    name: string;
  } | null;
  membership?: {
    _id: string;
    status: string;
    currentPeriodEnd?: string;
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

export interface TeamSummary {
  _id: string;
  name: string;
}

/**
 * One player in full. The address and guardian details live on `account`
 * because they belong to the household, not to this child.
 */
export interface PlayerProfile extends UserListItem {
  totalTournaments?: number;
  totalWins?: number;
  updatedAt?: string;
  masterFileChecked?: boolean;
}

export interface UserDetailsResponse {
  success: boolean;
  message: string;
  data: {
    /** The player. */
    player: PlayerProfile;
    /** The parent account behind them. */
    user: (User & { isEmailVerified?: boolean; updatedAt?: string }) | null;
    /** Same object as `player`, under the key the panel already reads. */
    playerProfile: PlayerProfile | null;
    membership: { _id: string; status: string; currentPeriodEnd?: string } | null;
  };
}

export const userService = {
  getUsers: async (
    page: number,
    limit: number,
    search: string = ''
  ): Promise<UsersResponse> => {
    const response = await axiosInstance.get<UsersResponse>('/user', {
      params: { page, limit, search },
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
  /**
   * Takes the ACCOUNT id, not the player id. A parent signs in once for all of
   * their children, so there is no way to disable one player on their own —
   * pass `account._id` from the row.
   */
  deactivateUser: async (accountId: string, reason?: string): Promise<any> => {
    const response = await axiosInstance.patch(`/user/${accountId}/deactivate`, { reason });
    return response.data;
  },
  activateUser: async (accountId: string): Promise<any> => {
    const response = await axiosInstance.patch(`/user/${accountId}/activate`);
    return response.data;
  },
};
