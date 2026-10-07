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
import { generateCode } from '../utils/code';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createCouponSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(2, 'Enter the organization name')
      .max(100, 'Name must be at most 100 characters'),
    code: z
      .string()
      .trim()
      .min(3, 'Code must be at least 3 characters')
      .max(32, 'Code must be at most 32 characters')
      .refine((value) => !value.includes(' '), 'Spaces are not allowed'),
    validFrom: z.string().optional().or(z.literal('')),
    validUntil: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => !data.validUntil || data.validUntil >= getTodayDateString(),
    { message: 'Valid until date cannot be in the past', path: ['validUntil'] }
  )
  .refine(
    (data) =>
      !data.validFrom || !data.validUntil || data.validFrom <= data.validUntil,
    { message: 'The end date must be on or after the start date', path: ['validUntil'] }
  );

type CreateCouponFormData = z.infer<typeof createCouponSchema>;

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * An organization and its coupon code, created together: one organization has
 * one code. Students who use the code register without paying; what they would
 * have paid is recorded against the organization to be invoiced later.
 */
export function CreateCouponDialog({ open, onOpenChange }: CreateCouponDialogProps) {
  const { mutateAsync: createCoupon, isPending } = useCreateCoupon();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCouponFormData>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: {
      organizationName: '',
      code: '',
      validFrom: '',
      validUntil: '',
    },
  });

  const todayStr = getTodayDateString();
  const validFromVal = watch('validFrom');
  const minUntilDate = validFromVal && validFromVal > todayStr ? validFromVal : todayStr;

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  /** Upper case and no whitespace, applied as it is typed. */
  const formatCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = event.target.value.toUpperCase().replace(/\s+/g, '');
    if (cleaned !== event.target.value) {
      setValue('code', cleaned, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CreateCouponFormData) => {
    try {
      await createCoupon({
        organizationName: data.organizationName,
        code: data.code,
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
      <DialogContent className="sm:max-w-[520px] rounded-[24px] p-6">
        <DialogTitle className="font-poppins text-[22px] font-semibold text-[#083F92]">
          Add Organization
        </DialogTitle>
        <p className="font-poppins text-[13px] text-[#8C8C8C]">
          Students who enter the code register without paying. The entry fee is
          recorded against the organization so you can invoice it later.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          {/* Locked while the request is in flight: disabling only the submit
              button leaves every field editable after the values have already
              been sent. `contents` keeps the fieldset out of the layout. */}
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
                placeholder="Horicon High School"
                autoComplete="off"
                className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
                {...register('organizationName')}
              />
              {errors.organizationName ? (
                <p className="text-[12px] text-[#CE2D32]">{errors.organizationName.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="code"
                className="font-poppins text-[14px] font-medium text-[#181818]"
              >
                Coupon Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  maxLength={32}
                  placeholder="Z234W2"
                  autoComplete="off"
                  className="h-11 rounded-full border-[#3D3775] px-4 font-mono tracking-wide"
                  {...register('code', { onChange: formatCode })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-full border-[#083F92] px-5 text-[#083F92] hover:bg-[#083F92]/5"
                  onClick={() => setValue('code', generateCode(), { shouldValidate: true })}
                >
                  Generate
                </Button>
              </div>
              {errors.code ? (
                <p className="text-[12px] text-[#CE2D32]">{errors.code.message}</p>
              ) : null}
              <p className="font-poppins text-[11px] text-[#8C8C8C]">
                Type a code or press Generate. Always upper case, no spaces — applied
                as you type. The code cannot be changed once created.
              </p>
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
                  min={todayStr}
                  className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
                  {...register('validFrom')}
                />
                {errors.validFrom ? (
                  <p className="text-[12px] text-[#CE2D32]">{errors.validFrom.message}</p>
                ) : null}
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
              </div>
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
                {isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
