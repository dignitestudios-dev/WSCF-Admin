import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import {
  couponService,
  type BillingStatus,
  type CouponListStatus,
  type CreateCouponPayload,
  type UpdateCouponPayload,
} from '../services/coupon.service';

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export function useCoupons(
  page = 1,
  limit = 10,
  search = '',
  status?: CouponListStatus
) {
  return useQuery({
    // Every parameter is in the key: without them, changing the page or the
    // filter would show the previous result.
    queryKey: ['coupons', page, limit, search, status],
    queryFn: () => couponService.getCoupons(page, limit, search, status),
  });
}

export function useCoupon(couponId: string) {
  return useQuery({
    queryKey: ['coupon', couponId],
    queryFn: () => couponService.getCoupon(couponId),
    enabled: Boolean(couponId),
  });
}

export function useCouponRegistrations(couponId: string, status?: BillingStatus) {
  return useQuery({
    queryKey: ['coupon-registrations', couponId, status],
    queryFn: () => couponService.getRegistrations(couponId, status),
    enabled: Boolean(couponId),
  });
}

/** Everything that shows a coupon or its money goes stale together. */
function useInvalidateCoupons() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['coupons'] });
    queryClient.invalidateQueries({ queryKey: ['coupon'] });
    queryClient.invalidateQueries({ queryKey: ['coupon-registrations'] });
  };
}

export function useCreateCoupon() {
  const invalidate = useInvalidateCoupons();
  return useMutation({
    mutationFn: (data: CreateCouponPayload) => couponService.createCoupon(data),
    onSuccess: (response: any) => {
      invalidate();
      toast.success(response?.message || 'Coupon created successfully');
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, 'Failed to create coupon'));
    },
  });
}

export function useUpdateCoupon() {
  const invalidate = useInvalidateCoupons();
  return useMutation({
    mutationFn: ({
      couponId,
      data,
    }: {
      couponId: string;
      data: UpdateCouponPayload;
    }) => couponService.updateCoupon(couponId, data),
    onSuccess: (response: any) => {
      invalidate();
      toast.success(response?.message || 'Coupon updated successfully');
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, 'Failed to update coupon'));
    },
  });
}

export function useReplaceCouponCode() {
  const invalidate = useInvalidateCoupons();
  return useMutation({
    mutationFn: ({ couponId, code }: { couponId: string; code?: string }) =>
      couponService.replaceCode(couponId, code),
    onSuccess: (response: any) => {
      invalidate();
      toast.success(response?.message || 'Code replaced');
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, 'Failed to replace the code'));
    },
  });
}

export function useRestoreCoupon() {
  const invalidate = useInvalidateCoupons();
  return useMutation({
    mutationFn: (couponId: string) => couponService.restoreCoupon(couponId),
    onSuccess: (response: any) => {
      invalidate();
      toast.success(response?.message || 'Organization restored');
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, 'Failed to restore'));
    },
  });
}

export function useArchiveCoupon() {
  const invalidate = useInvalidateCoupons();
  return useMutation({
    mutationFn: (couponId: string) => couponService.archiveCoupon(couponId),
    onSuccess: (response: any) => {
      invalidate();
      toast.success(response?.message || 'Coupon archived');
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, 'Failed to archive coupon'));
    },
  });
}

export function useUpdateBilling(couponId: string) {
  const invalidate = useInvalidateCoupons();
  return useMutation({
    mutationFn: (data: {
      redemptionIds: string[];
      status: BillingStatus;
      invoiceNumber?: string | null;
    }) => couponService.updateBilling(couponId, data),
    onSuccess: (response: any) => {
      invalidate();
      toast.success(response?.message || 'Billing updated');
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, 'Failed to update billing'));
    },
  });
}
