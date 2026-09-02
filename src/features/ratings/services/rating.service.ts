import { axiosInstance } from '@/lib/axios';

/** A player waiting for — or already given — a rating. */
export interface RatingRequestPlayer {
  _id: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  rating: number;
  membershipId: string | null;
  ratingStatus: 'pending' | 'assigned' | 'unrated';
  ratingAssignedAt: string | null;
  createdAt: string;
  /** The parent account, populated by the API. */
  userId: { _id: string; name: string; email: string } | null;
  /** The linked master file record, populated once assigned. */
  masterPlayerId: {
    _id: string;
    rawName: string;
    firstName: string;
    lastName: string;
    localRating: number;
    uscfId: string | null;
  } | null;
}

/** One row of the imported master players file. */
export interface MasterFileRecord {
  _id: string;
  rawName: string;
  firstName: string;
  lastName: string;
  localRating: number;
  grade: string | null;
  team: string | null;
  uscfId: string | null;
  /**
   * A record already given to a player. Shown rather than hidden, so an admin
   * can see the record exists and is taken instead of assuming the import
   * missed it.
   */
  isClaimed: boolean;
}

interface Paginated<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const ratingService = {
  getRatingRequests: async (
    page = 1,
    limit = 10,
    search = '',
    status: 'pending' | 'assigned' | 'unrated' = 'pending'
  ): Promise<Paginated<{ players: RatingRequestPlayer[] }>> => {
    const response = await axiosInstance.get('/player/rating-requests', {
      params: { page, limit, search, status },
    });
    return response.data;
  },

  searchMasterFile: async (
    search = '',
    page = 1,
    limit = 10
  ): Promise<Paginated<{ records: MasterFileRecord[] }>> => {
    const response = await axiosInstance.get('/player/master-file', {
      params: { search, page, limit },
    });
    return response.data;
  },

  /**
   * Send `masterPlayerId` to link a record, or `noRating` to record that there
   * is nothing to link. `confirmReassign` is required when the player already
   * has a rating — the API refuses without it, so a correction cannot happen
   * by accident from the pending queue.
   */
  assignRating: async (
    childId: string,
    payload:
      | { masterPlayerId: string; confirmReassign?: boolean }
      | { noRating: true; confirmReassign?: boolean }
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.patch(
      `/player/children/${childId}/rating`,
      payload
    );
    return response.data;
  },
};
