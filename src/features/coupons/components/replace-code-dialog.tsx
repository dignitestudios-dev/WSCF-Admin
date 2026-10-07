'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReplaceCouponCode } from '../hooks/use-coupons';
import type { Coupon } from '../services/coupon.service';
import { generateCode } from '../utils/code';

interface ReplaceCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

/**
 * Revokes an organization's code and issues a new one.
 *
 * The old code stops working the moment this is confirmed. Everything already
 * registered with it stays where it is — still billed to the organization — so
 * the only effect is on future registrations, which now need the new code.
 */
export function ReplaceCodeDialog({ open, onOpenChange, coupon }: ReplaceCodeDialogProps) {
  const { mutateAsync: replaceCode, isPending } = useReplaceCouponCode();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCode(generateCode());
      setError(null);
    }
  }, [open]);

  /** Upper case and no whitespace, applied as it is typed. */
  const format = (value: string) => value.toUpperCase().replace(/\s+/g, '');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!coupon) return;

    if (code.length < 3) return setError('Code must be at least 3 characters');
    if (code === coupon.code) return setError("That is already this organization's code");

    try {
      await replaceCode({ couponId: coupon._id, code });
      onOpenChange(false);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="rounded-[24px] p-6 sm:max-w-[500px]">
        <DialogTitle className="font-poppins text-[22px] font-semibold text-[#083F92]">
          Replace Code
        </DialogTitle>
        <p className="font-poppins text-[13px] text-[#8C8C8C]">
          {coupon?.organizationName} gets a new code, and the current one is revoked.
        </p>

        <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
          <fieldset disabled={isPending} className="contents">
            <div className="flex flex-col gap-2">
              <Label className="font-poppins text-[14px] font-medium text-[#181818]">
                Current code
              </Label>
              <Input
                value={coupon?.code ?? ''}
                readOnly
                disabled
                className="h-11 cursor-not-allowed rounded-full border-[#DADADA] bg-[#F4F4F4] px-4 font-mono tracking-wide text-[#8C8C8C]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="newCode"
                className="font-poppins text-[14px] font-medium text-[#181818]"
              >
                New code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="newCode"
                  maxLength={32}
                  autoComplete="off"
                  value={code}
                  onChange={(event) => {
                    setCode(format(event.target.value));
                    setError(null);
                  }}
                  className="h-11 rounded-full border-[#3D3775] px-4 font-mono tracking-wide"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-full border-[#083F92] px-5 text-[#083F92] hover:bg-[#083F92]/5"
                  onClick={() => {
                    setCode(generateCode());
                    setError(null);
                  }}
                >
                  Generate
                </Button>
              </div>
              {error ? <p className="text-[12px] text-[#CE2D32]">{error}</p> : null}
            </div>

            <ul className="flex list-disc flex-col gap-1 rounded-[16px] bg-[#FFF4E5] py-3 pl-8 pr-4 font-poppins text-[12px] leading-[18px] text-[#B54708]">
              <li>
                <span className="font-mono font-semibold">{coupon?.code}</span> stops
                working immediately and can never be used again.
              </li>
              <li>
                Students already registered keep their place, and what is owed stays
                with the organization.
              </li>
              <li>Anyone registering from now on needs the new code.</li>
            </ul>

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
                className="h-11 rounded-full bg-[#CE2D32] px-6 hover:bg-[#CE2D32]/90"
                disabled={isPending}
              >
                {isPending ? 'Replacing...' : 'Replace Code'}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
