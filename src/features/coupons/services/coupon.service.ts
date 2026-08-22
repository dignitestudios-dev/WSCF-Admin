import { axiosInstance } from '@/lib/axios';

export interface Coupon {
  _id: string;
  code: string;
  /** Reserved — always 'percentage' at 100 today. */
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  /** Reserved — total redemptions allowed across everyone. null = unlimited. */
  usageLimit: number | null;
  usedCount: number;
  /** Both optional. Neither set means the coupon never expires. */
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;

  /** Worked out by the API so every screen agrees on what these mean. */
  isExpired: boolean;
  isScheduled: boolean;
  isExhausted: boolean;
}

export interface CouponRedemption {
  _id: string;
  amountDiscounted: number;
  createdAt: string;
  playerProfileId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    membershipId?: string;
  } | null;
  tournamentId: { _id: string; title: string; date: string } | null;
}

export interface Pagination {
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CouponsResponse {
  success: boolean;
  message: string;
  data: { coupons: Coupon[] };
  pagination: Pagination;
}

export interface RedemptionsResponse {
  success: boolean;
  message: string;
  data: { redemptions: CouponRedemption[] };
  pagination: Pagination;
}

export interface CreateCouponPayload {
  code: string;
  validFrom?: string | null;
  validUntil?: string | null;
}

/** Only these can change once a coupon exists — the code never can. */
export interface UpdateCouponPayload {
  validUntil?: string | null;
  isActive?: boolean;
}

export const couponService = {
  getCoupons: async (
    page: number,
    limit: number,
    search = '',
    status?: string
  ): Promise<CouponsResponse> => {
    const response = await axiosInstance.get<CouponsResponse>('/coupon', {
      params: {
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      },
    });
    return response.data;
  },

  createCoupon: async (data: CreateCouponPayload) => {
    const response = await axiosInstance.post('/coupon', data);
    return response.data;
  },

  updateCoupon: async (couponId: string, data: UpdateCouponPayload) => {
    const response = await axiosInstance.patch(`/coupon/${couponId}`, data);
    return response.data;
  },

  getRedemptions: async (
    couponId: string,
    page: number,
    limit: number
  ): Promise<RedemptionsResponse> => {
    const response = await axiosInstance.get<RedemptionsResponse>(
      `/coupon/${couponId}/redemptions`,
      { params: { page, limit } }
    );
    return response.data;
  },
};
