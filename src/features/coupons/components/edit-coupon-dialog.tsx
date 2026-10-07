'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  /** Opens the replace-code dialog; the code cannot be edited in place. */
  onReplaceCode?: () => void;
}

/** A date input needs yyyy-MM-dd; the API sends an ISO timestamp. */
const toDateInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : '';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createEditCouponSchema = (coupon: Coupon | null) =>
  z
    .object({
      organizationName: z
        .string()
        .trim()
        .min(2, 'Enter the organization name')
        .max(100, 'Name must be at most 100 characters'),
      validUntil: z.string().optional().or(z.literal('')),
    })
    .refine(
      (data) => !data.validUntil || data.validUntil >= getTodayDateString(),
      { message: 'Valid until date cannot be in the past', path: ['validUntil'] }
    )
    .refine(
      (data) => {
        if (!data.validUntil || !coupon?.validFrom) return true;
        return data.validUntil >= toDateInput(coupon.validFrom);
      },
      {
        message: 'The end date must be on or after the start date',
        path: ['validUntil'],
      }
    );

type EditCouponFormData = z.infer<ReturnType<typeof createEditCouponSchema>>;

/**
 * Editing is deliberately narrow: the name, the limit and the end date.
 *
 * The code itself is fixed once created: it may already be printed, shared or
 * used, and changing it would silently invalidate every copy already out
 * there. It is shown here read-only so the admin can see what they are
 * editing.
 */
export function EditCouponDialog({
  open,
  onOpenChange,
  coupon,
  onReplaceCode,
}: EditCouponDialogProps) {
  const { mutateAsync: updateCoupon, isPending } = useUpdateCoupon();

  const schema = useMemo(() => createEditCouponSchema(coupon), [coupon]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCouponFormData>({
    resolver: zodResolver(schema),
    defaultValues: { organizationName: '', validUntil: '' },
  });

  const todayStr = getTodayDateString();
  const validFromStr = toDateInput(coupon?.validFrom ?? null);
  const minUntilDate = validFromStr && validFromStr > todayStr ? validFromStr : todayStr;

  useEffect(() => {
    if (open && coupon) {
      reset({
        organizationName: coupon.organizationName,
        validUntil: toDateInput(coupon.validUntil),
      });
    }
  }, [open, coupon, reset]);

  const onSubmit = async (data: EditCouponFormData) => {
    if (!coupon) return;

    try {
      await updateCoupon({
        couponId: coupon._id,
        data: {
          organizationName: data.organizationName,
          // Cleared means no end date at all.
          validUntil: data.validUntil || null,
        },
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
          Edit Organization
        </DialogTitle>
        <p className="font-poppins text-[13px] text-[#8C8C8C]">
          The code itself cannot be changed.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        {/* Locked while the request is in flight: disabling only the
            submit button leaves every field editable after the values
            have already been sent. `contents` keeps the fieldset out
            of the layout. */}
        <fieldset disabled={isPending} className="contents">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="organizationName"
              className="font-poppins text-[14px] font-medium text-[#181818]"
            >
              School, Club or District
            </Label>
            <Input
              id="organizationName"
              maxLength={100}
              autoComplete="off"
              className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
              {...register('organizationName')}
            />
            {errors.organizationName ? (
              <p className="text-[12px] text-[#CE2D32]">{errors.organizationName.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-poppins text-[14px] font-medium text-[#181818]">
              Coupon Code
            </Label>
            <div className="flex gap-2">
              <Input
                value={coupon?.code ?? ''}
                readOnly
                disabled
                className="h-11 cursor-not-allowed rounded-full border-[#DADADA] bg-[#F4F4F4] px-4 font-mono tracking-wide text-[#8C8C8C]"
              />
              {onReplaceCode ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-full border-[#CE2D32] px-5 text-[#CE2D32] hover:bg-[#CE2D32]/5"
                  onClick={() => {
                    onOpenChange(false);
                    onReplaceCode();
                  }}
                >
                  Replace
                </Button>
              ) : null}
            </div>
            <p className="font-poppins text-[11px] text-[#8C8C8C]">
              A code is not edited in place. Replace it to revoke this one and issue a
              new code.
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
              min={minUntilDate}
              className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
              {...register('validUntil')}
            />
            {errors.validUntil ? (
              <p className="text-[12px] text-[#CE2D32]">{errors.validUntil.message}</p>
            ) : null}
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
        </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
