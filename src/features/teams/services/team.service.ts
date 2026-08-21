import { axiosInstance } from '@/lib/axios';

export interface Team {
  _id: string;
  name: string;
  /** Only present on the list endpoint, which counts members per team. */
  memberCount?: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamPagination {
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface TeamsResponse {
  success: boolean;
  message: string;
  data: { teams: Team[] };
  pagination: TeamPagination;
}

export interface TeamDetailsResponse {
  success: boolean;
  message: string;
  data: { team: Team & { memberCount: number } };
}

/**
 * A row from GET /team/:id/members.
 *
 * `_id` is the player — a child — and that is what add and remove take. The
 * account underneath is the parent: their email is the contact address, and
 * their status is what decides whether the player can be added at all.
 */
export interface TeamMember {
  _id: string;
  teamMemberId?: string;
  teamId: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  membershipId?: string;
  grade?: string;
  rating?: number;
  totalTournaments?: number;
  userId: {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  } | null;
}

export interface TeamMembersResponse {
  success: boolean;
  message: string;
  data: { members: TeamMember[] };
  pagination: TeamPagination;
}

/**
 * Per-member outcome from the bulk add/remove endpoints. A bad id never fails
 * the whole request, so the UI reports what actually happened.
 */
export interface MemberResult {
  playerId: string;
  name: string;
  status: 'added' | 'switched' | 'skipped' | 'failed' | 'removed';
  reason?: string;
  fromTeam?: { _id: string; name: string } | null;
}

export interface MemberBatchSummary {
  requested: number;
  added?: number;
  switched?: number;
  skipped?: number;
  failed?: number;
  removed?: number;
}

export interface MemberBatchResponse {
  success: boolean;
  message: string;
  data: {
    team?: Team;
    summary: MemberBatchSummary;
    results: MemberResult[];
  } | null;
}

export const teamService = {
  getTeams: async (page: number, limit: number, search = ''): Promise<TeamsResponse> => {
    const response = await axiosInstance.get<TeamsResponse>('/team', {
      params: { page, limit, search: search || undefined },
    });
    return response.data;
  },

  getTeamDetails: async (teamId: string): Promise<TeamDetailsResponse> => {
    const response = await axiosInstance.get<TeamDetailsResponse>(`/team/${teamId}`);
    return response.data;
  },

  getTeamMembers: async (
    teamId: string,
    page: number,
    limit: number,
    search = ''
  ): Promise<TeamMembersResponse> => {
    const response = await axiosInstance.get<TeamMembersResponse>(`/team/${teamId}/members`, {
      params: { page, limit, search: search || undefined },
    });
    return response.data;
  },

  /** Members are optional — a team can be created empty and filled later. */
  createTeam: async (data: {
    name: string;
    playerIds?: string[];
  }): Promise<MemberBatchResponse> => {
    const response = await axiosInstance.post<MemberBatchResponse>('/team', data);
    return response.data;
  },

  /** Only the name is editable. */
  updateTeam: async (teamId: string, data: { name: string }) => {
    const response = await axiosInstance.put(`/team/${teamId}`, data);
    return response.data;
  },

  deleteTeam: async (teamId: string) => {
    const response = await axiosInstance.delete(`/team/${teamId}`);
    return response.data;
  },

  addMembers: async (teamId: string, playerIds: string[]): Promise<MemberBatchResponse> => {
    const response = await axiosInstance.post<MemberBatchResponse>(`/team/${teamId}/members`, {
      playerIds,
    });
    return response.data;
  },

  removeMembers: async (teamId: string, playerIds: string[]): Promise<MemberBatchResponse> => {
    // axios needs the body under `data` for DELETE.
    const response = await axiosInstance.delete<MemberBatchResponse>(`/team/${teamId}/members`, {
      data: { playerIds },
    });
    return response.data;
  },
};

/** The backend caps every bulk member request. */
export const MAX_MEMBERS_PER_REQUEST = 50;
