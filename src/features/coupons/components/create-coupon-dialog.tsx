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
      // Matches the server rule: upper case, and no whitespace anywhere. The
      // input formats as you type, so neither of these should ever be seen —
      // they are the backstop for a paste that slips through.
      .refine((value) => !/\s/.test(value), 'Spaces are not allowed')
      .regex(/^[^a-z\s]+$/, 'Use upper case only'),
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
    setValue,
    formState: { errors },
  } = useForm<CreateCouponFormData>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: { code: '', validFrom: '', validUntil: '' },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  /**
   * Formats the code as it is typed: upper case, and no whitespace at all.
   *
   * Codes are read off a flyer and typed back in, so one that differs only by
   * case — or that carries a space nobody can see — becomes a support ticket.
   * Fixing it here means the admin never types an invalid code in the first
   * place, rather than being told off after pressing save.
   */
  const formatCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = event.target.value.toUpperCase().replace(/\s+/g, '');
    if (cleaned !== event.target.value) {
      setValue('code', cleaned, { shouldValidate: true });
    }
  };

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
        {/* Locked while the request is in flight: disabling only the
            submit button leaves every field editable after the values
            have already been sent. `contents` keeps the fieldset out
            of the layout. */}
        <fieldset disabled={isPending} className="contents">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code" className="font-poppins text-[14px] font-medium text-[#181818]">
              Coupon Code
            </Label>
            <Input
              id="code"
              placeholder="SUMMER25"
              autoComplete="off"
              className="h-11 rounded-full border-[#3D3775] px-4 font-poppins tracking-wide"
              {...register('code', { onChange: formatCode })}
            />
            <p className="font-poppins text-[11px] text-[#8C8C8C]">
              Upper case only, no spaces — both are applied as you type. The code
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
        </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
