'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit, Ban, Star, Users } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionIconButton } from '@/components/ui/action-button';
import { useCoupons, useUpdateCoupon } from '@/features/coupons/hooks/use-coupons';
import type { Coupon } from '@/features/coupons/services/coupon.service';
import { CreateCouponDialog } from '@/features/coupons/components/create-coupon-dialog';
import { EditCouponDialog } from '@/features/coupons/components/edit-coupon-dialog';
import { CouponUsageDialog } from '@/features/coupons/components/coupon-usage-dialog';
import { useListParams } from '@/hooks/use-list-params';
import { Highlight } from '@/components/ui/highlight';

/**
 * A coupon is in exactly one state at a time, and the reason matters more than
 * the flag: "expired" and "limit reached" both mean unusable, but only one of
 * them is something the admin can fix by editing the date.
 */
function statusOf(coupon: Coupon) {
  if (!coupon.isActive) return { label: 'Inactive', tone: 'bg-[#F4F4F4] text-[#8C8C8C]' };
  if (coupon.isExpired) return { label: 'Expired', tone: 'bg-[#FDECEA] text-[#B42318]' };
  if (coupon.isExhausted)
    return { label: 'Limit reached', tone: 'bg-[#FDECEA] text-[#B42318]' };
  if (coupon.isScheduled)
    return { label: 'Scheduled', tone: 'bg-[#FFF4E5] text-[#B54708]' };
  return { label: 'Active', tone: 'bg-[#E7F6EC] text-[#036B26]' };
}

const dateLabel = (value: string | null) =>
  value ? format(new Date(value), 'dd MMM yyyy') : '—';

export default function Coupons() {
  const {
    page: currentPage,
    setPage: setCurrentPage,
    searchInput: searchQuery,
    setSearchInput: setSearchQuery,
    search: debouncedSearchQuery,
  } = useListParams();
  const itemsPerPage = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [couponToToggle, setCouponToToggle] = useState<Coupon | null>(null);
  const [couponToInspect, setCouponToInspect] = useState<Coupon | null>(null);

  const { data, isLoading } = useCoupons(currentPage, itemsPerPage, debouncedSearchQuery);
  const { mutateAsync: updateCoupon, isPending: isToggling } = useUpdateCoupon();

  const coupons = data?.data?.coupons || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // A new search starts at the first page; page 3 of the old results says
    // nothing about the new ones.
    setCurrentPage(1);
  };

  const confirmToggle = async () => {
    if (!couponToToggle) return;

    try {
      await updateCoupon({
        couponId: couponToToggle._id,
        data: { isActive: !couponToToggle.isActive },
      });
      setCouponToToggle(null);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-[500px]">
            <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0 shrink-0">
              Coupons
            </h1>

            <div className="w-full sm:w-auto">
              <SearchInput
                value={searchQuery}
                onChangeValue={handleSearch}
                placeholder="Search by coupon code"
              />
            </div>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
              Create Coupon
            </span>
          </button>
        </div>

        {/* Main Table Container Card */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden flex-1 relative min-h-[600px] mb-8 pb-20">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                  <th className="px-6 py-3 font-semibold w-auto">Code</th>
                  <th className="px-6 py-3 font-semibold w-[110px]">Discount</th>
                  <th className="px-6 py-3 font-semibold w-[100px]">Used</th>
                  <th className="px-6 py-3 font-semibold w-[140px]">Valid From</th>
                  <th className="px-6 py-3 font-semibold w-[140px]">Valid Until</th>
                  <th className="px-6 py-3 font-semibold w-[140px]">Status</th>
                  <th className="px-6 py-3 font-semibold text-right w-[160px]">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className="h-[50px] border-b border-[#DADADA]/30 bg-white"
                    >
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[50px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[40px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[90px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[90px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-5 w-[70px] rounded-full" /></td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-8 w-[100px] float-right rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : coupons.length > 0 ? (
                  coupons.map((coupon, index) => {
                    const isEven = index % 2 !== 0;
                    const status = statusOf(coupon);

                    return (
                      <tr
                        key={coupon._id}
                        className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                          isEven ? 'bg-[#083F92]/10' : 'bg-white'
                        }`}
                      >
                        <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>
                          {/* Monospaced so a code can be read back character by
                              character — it is case sensitive. */}
                          <span className="font-mono tracking-wide">
                            <Highlight text={coupon.code} query={debouncedSearchQuery} />
                          </span>
                        </td>
                        <td className="px-6 py-3 font-semibold">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                        </td>
                        <td className="px-6 py-3 font-semibold">
                          {coupon.usedCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                        </td>
                        <td className="px-6 py-3 font-semibold">{dateLabel(coupon.validFrom)}</td>
                        <td className="px-6 py-3 font-semibold">{dateLabel(coupon.validUntil)}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.tone}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ActionIconButton
                              icon={Users}
                              label="View usage"
                              onClick={() => setCouponToInspect(coupon)}
                            />
                            <ActionIconButton
                              icon={Edit}
                              label="Edit coupon"
                              onClick={() => setCouponToEdit(coupon)}
                            />
                            {/* No delete: a used code has to stay resolvable so
                                past registrations still explain themselves. */}
                            <ActionIconButton
                              icon={coupon.isActive ? Ban : Star}
                              label={coupon.isActive ? 'Deactivate' : 'Activate'}
                              tone={coupon.isActive ? 'danger' : 'success'}
                              onClick={() => setCouponToToggle(coupon)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center font-poppins text-[14px] text-[#8C8C8C]"
                    >
                      {debouncedSearchQuery
                        ? `No coupon matches "${debouncedSearchQuery}".`
                        : 'No coupons yet. Create one to make a tournament entry free.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="absolute right-[24px] bottom-[16px]"
            />
          )}
        </div>
      </div>

      <CreateCouponDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <EditCouponDialog
        open={Boolean(couponToEdit)}
        onOpenChange={(open) => !open && setCouponToEdit(null)}
        coupon={couponToEdit}
      />

      <CouponUsageDialog
        open={Boolean(couponToInspect)}
        onOpenChange={(open) => !open && setCouponToInspect(null)}
        coupon={couponToInspect}
      />

      <ConfirmDialog
        open={Boolean(couponToToggle)}
        onOpenChange={(open) => !open && setCouponToToggle(null)}
        title={couponToToggle?.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
        description={
          couponToToggle?.isActive
            ? `Players will no longer be able to use ${couponToToggle?.code}. Registrations already made with it are not affected.`
            : `Players will be able to use ${couponToToggle?.code} again.`
        }
        confirmText={couponToToggle?.isActive ? 'Deactivate' : 'Activate'}
        loadingText={couponToToggle?.isActive ? 'Deactivating...' : 'Activating...'}
        tone={couponToToggle?.isActive ? 'danger' : 'primary'}
        icon={couponToToggle?.isActive ? Ban : Star}
        isLoading={isToggling}
        onConfirm={confirmToggle}
      />
    </PageTransition>
  );
}
