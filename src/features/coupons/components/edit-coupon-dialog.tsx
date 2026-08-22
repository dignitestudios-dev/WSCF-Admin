'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateCoupon } from '../hooks/use-coupons';
import type { Coupon } from '../services/coupon.service';

interface EditCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

/** A date input needs yyyy-MM-dd; the API sends an ISO timestamp. */
const toDateInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : '';

/**
 * Editing is deliberately limited to the end date.
 *
 * The code itself is fixed once created: it may already be printed, shared or
 * used, and changing it would silently invalidate every copy already out
 * there. It is shown here read-only so the admin can see what they are
 * editing.
 */
export function EditCouponDialog({ open, onOpenChange, coupon }: EditCouponDialogProps) {
  const { mutateAsync: updateCoupon, isPending } = useUpdateCoupon();

  const { register, handleSubmit, reset } = useForm<{ validUntil: string }>({
    defaultValues: { validUntil: '' },
  });

  useEffect(() => {
    if (open && coupon) {
      reset({ validUntil: toDateInput(coupon.validUntil) });
    }
  }, [open, coupon, reset]);

  const onSubmit = async (data: { validUntil: string }) => {
    if (!coupon) return;

    try {
      await updateCoupon({
        couponId: coupon._id,
        // Cleared means no end date at all, so the coupon stops expiring.
        data: { validUntil: data.validUntil || null },
      });
      onOpenChange(false);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[24px] p-6">
        <DialogTitle className="font-poppins text-[22px] font-semibold text-[#083F92]">
          Edit Coupon
        </DialogTitle>
        <p className="font-poppins text-[13px] text-[#8C8C8C]">
          Only the end date can be changed.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="font-poppins text-[14px] font-medium text-[#181818]">
              Coupon Code
            </Label>
            <Input
              value={coupon?.code ?? ''}
              readOnly
              disabled
              className="h-11 cursor-not-allowed rounded-full border-[#DADADA] bg-[#F4F4F4] px-4 font-poppins text-[#8C8C8C]"
            />
            <p className="font-poppins text-[11px] text-[#8C8C8C]">
              The code cannot be changed — it may already have been shared or used.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="validUntil"
              className="font-poppins text-[14px] font-medium text-[#181818]"
            >
              Valid Until <span className="text-[#8C8C8C]">(optional)</span>
            </Label>
            <Input
              id="validUntil"
              type="date"
              className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
              {...register('validUntil')}
            />
            <p className="font-poppins text-[11px] text-[#8C8C8C]">
              Leave empty and the coupon never expires.
            </p>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full px-6"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-full bg-[#083F92] px-6 hover:bg-[#062f6e]"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
