import { axiosInstance } from '@/lib/axios';

export type BillingStatus = 'unbilled' | 'invoiced' | 'paid';

/** Registrations and dollars in one billing state. */
export interface BillingBucket {
  count: number;
  amount: number;
}

/**
 * What an organization has been billed.
 *
 * `toInvoice` is the figure WSCF acts on: registrations nobody has invoiced yet.
 */
export interface BillingSummary {
  registrations: number;
  total: number;
  toInvoice: BillingBucket;
  invoiced: BillingBucket;
  paid: BillingBucket;
}

/** An organization and the code assigned to it. */
export interface Coupon {
  _id: string;
  organizationName: string;
  code: string;
  /** Reserved — always 'percentage' at 100 today. */
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  /** Total redemptions allowed across everyone. null = unlimited. */
  usageLimit: number | null;
  usedCount: number;
  /** Both optional. Neither set means the coupon never expires. */
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  archivedAt: string | null;
  /** Codes this organization used to have — revoked, never reusable. */
  previousCodes: { code: string; revokedAt: string }[];
  createdAt: string;

  /** Worked out by the API so every screen agrees on what these mean. */
  isExpired: boolean;
  isScheduled: boolean;
  isExhausted: boolean;
  isArchived: boolean;
  billing: BillingSummary;
}

export interface CouponRegistration {
  _id: string;
  /** The entry fee at the moment the player registered. */
  amount: number;
  billingStatus: BillingStatus;
  invoicedAt: string | null;
  paidAt: string | null;
  invoiceNumber: string | null;
  registeredAt: string;
  player: {
    _id: string;
    name: string;
    membershipId?: string;
    grade?: string;
  } | null;
  parent: { name?: string; email?: string } | null;
}

/** One tournament's registrations, the way an invoice lists them. */
export interface TournamentGroup {
  tournament: {
    _id: string;
    title: string;
    date: string | null;
    /** False when the tournament has since been deleted. */
    exists: boolean;
  };
  count: number;
  total: number;
  registrations: CouponRegistration[];
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

export type CouponListStatus = 'active' | 'inactive' | 'archived';

export interface CreateCouponPayload {
  organizationName: string;
  /** Leave out to have one generated. */
  code?: string;
  validFrom?: string | null;
  validUntil?: string | null;
  usageLimit?: number | null;
}

/** The code never changes once created. */
export interface UpdateCouponPayload {
  organizationName?: string;
  validUntil?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}

export const couponService = {
  getCoupons: async (
    page: number,
    limit: number,
    search = '',
    status?: CouponListStatus
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

  getCoupon: async (couponId: string): Promise<Coupon> => {
    const response = await axiosInstance.get(`/coupon/${couponId}`);
    return response.data.data.coupon;
  },

  createCoupon: async (data: CreateCouponPayload) => {
    const response = await axiosInstance.post('/coupon', data);
    return response.data;
  },

  updateCoupon: async (couponId: string, data: UpdateCouponPayload) => {
    const response = await axiosInstance.patch(`/coupon/${couponId}`, data);
    return response.data;
  },

  /** Revokes the current code and issues a new one; billing is untouched. */
  replaceCode: async (couponId: string, code?: string) => {
    const response = await axiosInstance.post(`/coupon/${couponId}/replace-code`, {
      code: code || undefined,
    });
    return response.data;
  },

  /** Undoes an archive. The organization comes back inactive. */
  restoreCoupon: async (couponId: string) => {
    const response = await axiosInstance.post(`/coupon/${couponId}/restore`);
    return response.data;
  },

  /** The only "delete": the coupon and its billing history move to Archived. */
  archiveCoupon: async (couponId: string) => {
    const response = await axiosInstance.post(`/coupon/${couponId}/archive`);
    return response.data;
  },

  getRegistrations: async (
    couponId: string,
    billingStatus?: BillingStatus
  ): Promise<TournamentGroup[]> => {
    const response = await axiosInstance.get(`/coupon/${couponId}/registrations`, {
      params: { billingStatus: billingStatus || undefined },
    });
    return response.data.data.tournaments;
  },

  updateBilling: async (
    couponId: string,
    data: {
      redemptionIds: string[];
      status: BillingStatus;
      invoiceNumber?: string | null;
    }
  ) => {
    const response = await axiosInstance.patch(`/coupon/${couponId}/billing`, data);
    return response.data;
  },

  exportRegistrations: async (
    couponId: string,
    billingStatus?: BillingStatus
  ): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/coupon/${couponId}/registrations/export`,
      {
        params: { billingStatus: billingStatus || undefined },
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
