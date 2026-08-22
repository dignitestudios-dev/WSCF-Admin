'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { useCouponRedemptions } from '../hooks/use-coupons';
import type { Coupon } from '../services/coupon.service';

interface CouponUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

/**
 * Who used this code, and for what.
 *
 * A count alone is not much use when a code stops working — this is what
 * answers "who has already had it?".
 */
export function CouponUsageDialog({ open, onOpenChange, coupon }: CouponUsageDialogProps) {
  const [page, setPage] = useState(1);

  // Opening a different coupon starts from its first page, not wherever the
  // last one was left.
  useEffect(() => {
    if (open) setPage(1);
  }, [open, coupon?._id]);

  const { data, isLoading } = useCouponRedemptions(open ? (coupon?._id ?? null) : null, page, 10);

  const redemptions = data?.data?.redemptions || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalItems = data?.pagination?.totalItems ?? coupon?.usedCount ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] rounded-[24px] p-6">
        <DialogTitle className="font-poppins text-[22px] font-semibold text-[#083F92]">
          Coupon Usage
        </DialogTitle>
        <p className="font-poppins text-[13px] text-[#8C8C8C]">
          <span className="font-mono tracking-wide text-[#181818]">{coupon?.code}</span>
          {' — '}
          used {totalItems} time{totalItems === 1 ? '' : 's'}
        </p>

        <div className="mt-4 max-h-[380px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} className="h-[52px] w-full rounded-[12px]" />
              ))}
            </div>
          ) : redemptions.length === 0 ? (
            <p className="py-10 text-center font-poppins text-[13px] text-[#8C8C8C]">
              This coupon has not been used yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {redemptions.map((redemption) => {
                const player = redemption.playerProfileId;
                const name = player
                  ? [player.firstName, player.lastName].filter(Boolean).join(' ')
                  : 'Unknown player';

                return (
                  <div
                    key={redemption._id}
                    className="flex items-center justify-between gap-4 rounded-[12px] border border-[#DADADA] px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-poppins text-[14px] font-semibold text-[#181818]">
                        {name}
                        {player?.membershipId ? (
                          <span className="ml-2 text-[11px] font-normal text-[#8C8C8C]">
                            {player.membershipId}
                          </span>
                        ) : null}
                      </span>
                      <span className="truncate font-poppins text-[12px] text-[#8C8C8C]">
                        {redemption.tournamentId?.title || 'Tournament removed'}
                        {' · '}
                        {format(new Date(redemption.createdAt), 'dd MMM yyyy')}
                      </span>
                    </div>

                    <span className="shrink-0 font-poppins text-[13px] font-semibold text-[#036B26]">
                      −${redemption.amountDiscounted.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
