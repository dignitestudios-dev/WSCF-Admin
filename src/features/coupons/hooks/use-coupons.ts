import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  couponService,
  type CreateCouponPayload,
  type UpdateCouponPayload,
} from '../services/coupon.service';

export function useCoupons(page = 1, limit = 10, search = '', status?: string) {
  return useQuery({
    // Every parameter is in the key: without them, changing the page or the
    // filter would show the previous result.
    queryKey: ['coupons', page, limit, search, status],
    queryFn: () => couponService.getCoupons(page, limit, search, status),
  });
}

export function useCouponRedemptions(
  couponId: string | null,
  page = 1,
  limit = 10
) {
  return useQuery({
    queryKey: ['coupon-redemptions', couponId, page, limit],
    queryFn: () => couponService.getRedemptions(couponId as string, page, limit),
    enabled: Boolean(couponId),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponPayload) => couponService.createCoupon(data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(response?.message || 'Coupon created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to create coupon'
      );
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      couponId,
      data,
    }: {
      couponId: string;
      data: UpdateCouponPayload;
    }) => couponService.updateCoupon(couponId, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(response?.message || 'Coupon updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to update coupon'
      );
    },
  });
}
