'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCoupon } from '../hooks/use-coupons';

/**
 * Codes are matched exactly as typed, so SUMMER25 and summer25 are two
 * different codes — the hint under the field says so, because it is not what
 * most people expect.
 */
const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Code must be at least 3 characters')
      .max(32, 'Code must be at most 32 characters')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Only letters, numbers, hyphens and underscores'
      ),
    validFrom: z.string().optional().or(z.literal('')),
    validUntil: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) =>
      !data.validFrom ||
      !data.validUntil ||
      new Date(data.validFrom) <= new Date(data.validUntil),
    { message: 'The end date must be after the start date', path: ['validUntil'] }
  );

type CreateCouponFormData = z.infer<typeof createCouponSchema>;

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCouponDialog({ open, onOpenChange }: CreateCouponDialogProps) {
  const { mutateAsync: createCoupon, isPending } = useCreateCoupon();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCouponFormData>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: { code: '', validFrom: '', validUntil: '' },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = async (data: CreateCouponFormData) => {
    try {
      await createCoupon({
        code: data.code,
        // Empty means no limit, which the API stores as null.
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
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
          Create Coupon
        </DialogTitle>
        <p className="font-poppins text-[13px] text-[#8C8C8C]">
          A coupon makes a tournament entry free. Each player can use a code once.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code" className="font-poppins text-[14px] font-medium text-[#181818]">
              Coupon Code
            </Label>
            <Input
              id="code"
              placeholder="SUMMER25"
              autoComplete="off"
              className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
              {...register('code')}
            />
            <p className="font-poppins text-[11px] text-[#8C8C8C]">
              Case sensitive — SUMMER25 and summer25 are different codes. The code
              cannot be changed once created.
            </p>
            {errors.code ? (
              <p className="text-[12px] text-[#CE2D32]">{errors.code.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="validFrom"
                className="font-poppins text-[14px] font-medium text-[#181818]"
              >
                Valid From <span className="text-[#8C8C8C]">(optional)</span>
              </Label>
              <Input
                id="validFrom"
                type="date"
                className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
                {...register('validFrom')}
              />
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
              {errors.validUntil ? (
                <p className="text-[12px] text-[#CE2D32]">{errors.validUntil.message}</p>
              ) : null}
            </div>
          </div>

          <p className="font-poppins text-[11px] text-[#8C8C8C]">
            Leave both dates empty and the coupon never expires.
          </p>

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
              {isPending ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
