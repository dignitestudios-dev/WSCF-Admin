'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Ban, Star, Archive, ArchiveRestore, Eye, TicketPercent } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionIconButton } from '@/components/ui/action-button';
import {
  useArchiveCoupon,
  useCoupons,
  useRestoreCoupon,
  useUpdateCoupon,
} from '@/features/coupons/hooks/use-coupons';
import type {
  Coupon,
  CouponListStatus,
} from '@/features/coupons/services/coupon.service';
import { CreateCouponDialog } from '@/features/coupons/components/create-coupon-dialog';
import { EditCouponDialog } from '@/features/coupons/components/edit-coupon-dialog';
import { ReplaceCodeDialog } from '@/features/coupons/components/replace-code-dialog';
import { formatMoney } from '@/features/coupons/utils/format';
import { CopyCodeButton } from '@/features/coupons/components/copy-code-button';
import { useListParams } from '@/hooks/use-list-params';
import { Highlight } from '@/components/ui/highlight';

const TABS: { value: CouponListStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

/**
 * A coupon is in exactly one state at a time, and the reason matters more than
 * the flag: "expired" and "limit reached" both mean unusable, but only one of
 * them is something the admin can fix by editing the date.
 */
function statusOf(coupon: Coupon) {
  if (coupon.isArchived) return { label: 'Archived', tone: 'bg-[#F4F4F4] text-[#8C8C8C]' };
  if (!coupon.isActive) return { label: 'Inactive', tone: 'bg-[#F4F4F4] text-[#8C8C8C]' };
  if (coupon.isExpired) return { label: 'Expired', tone: 'bg-[#FDECEA] text-[#B42318]' };
  if (coupon.isExhausted)
    return { label: 'Limit reached', tone: 'bg-[#FDECEA] text-[#B42318]' };
  if (coupon.isScheduled)
    return { label: 'Scheduled', tone: 'bg-[#FFF4E5] text-[#B54708]' };
  return { label: 'Active', tone: 'bg-[#E7F6EC] text-[#036B26]' };
}

export default function Coupons() {
  const {
    page: currentPage,
    setPage: setCurrentPage,
    searchInput: searchQuery,
    setSearchInput: setSearchQuery,
    search: debouncedSearchQuery,
    getFilter,
    setFilter,
  } = useListParams({ defaultFilters: { status: 'active' } });
  const itemsPerPage = 10;

  const status = (getFilter('status') || 'active') as CouponListStatus;
  const isArchivedTab = status === 'archived';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [couponToReplace, setCouponToReplace] = useState<Coupon | null>(null);
  const [couponToToggle, setCouponToToggle] = useState<Coupon | null>(null);
  const [couponToArchive, setCouponToArchive] = useState<Coupon | null>(null);
  const [couponToRestore, setCouponToRestore] = useState<Coupon | null>(null);

  const { data, isLoading } = useCoupons(
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    status
  );
  const { mutateAsync: updateCoupon, isPending: isToggling } = useUpdateCoupon();
  const { mutateAsync: archiveCoupon, isPending: isArchiving } = useArchiveCoupon();
  const { mutateAsync: restoreCoupon, isPending: isRestoring } = useRestoreCoupon();

  const coupons = data?.data?.coupons || [];
  const totalPages = data?.pagination?.totalPages || 1;

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

  const confirmArchive = async () => {
    if (!couponToArchive) return;

    try {
      await archiveCoupon(couponToArchive._id);
      setCouponToArchive(null);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  const confirmRestore = async () => {
    if (!couponToRestore) return;

    try {
      await restoreCoupon(couponToRestore._id);
      setCouponToRestore(null);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-none">
            <h1 className="font-poppins font-bold sm:text-[34px] text-[26px] sm:leading-[52px] leading-[34px] text-[#083F92] m-0 shrink-0">
              Coupons &amp; Organizations
            </h1>

            <div className="w-full sm:w-auto">
              <SearchInput
                value={searchQuery}
                onChangeValue={setSearchQuery}
                placeholder="Search organization or code"
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
              Add Organization
            </span>
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex w-fit gap-2 rounded-full bg-[#083F92]/10 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => setFilter('status', tab.value)}
              className={`cursor-pointer rounded-full px-5 py-2 font-poppins text-[13px] font-semibold transition-colors ${
                status === tab.value
                  ? 'bg-[#083F92] text-white shadow-sm'
                  : 'text-[#083F92] hover:bg-[#083F92]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Table Container Card */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden flex-1 relative min-h-[600px] mb-8 pb-20">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                  <th className="px-6 py-3 font-semibold w-auto">Organization</th>
                  <th className="px-6 py-3 font-semibold w-[170px]">Code</th>
                  <th className="px-6 py-3 font-semibold w-[130px]">Registrations</th>
                  <th className="px-6 py-3 font-semibold w-[130px]">To Invoice</th>
                  <th className="px-6 py-3 font-semibold w-[110px]">Status</th>
                  <th className="px-6 py-3 font-semibold text-right w-[200px]">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className="h-[50px] border-b border-[#DADADA]/30 bg-white"
                    >
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[160px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[110px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[40px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[60px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-5 w-[70px] rounded-full" /></td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-8 w-[130px] float-right rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : coupons.length > 0 ? (
                  coupons.map((coupon, index) => {
                    const isEven = index % 2 !== 0;
                    const state = statusOf(coupon);
                    const { billing } = coupon;

                    return (
                      <tr
                        key={coupon._id}
                        className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                          isEven ? 'bg-[#083F92]/10' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold text-black">
                          <Link
                            href={`/coupons/${coupon._id}`}
                            className="hover:underline"
                          >
                            <Highlight
                              text={coupon.organizationName}
                              query={debouncedSearchQuery}
                            />
                          </Link>
                        </td>
                        <td className="px-6 py-3 font-semibold">
                          {/* Monospaced so a code can be read back character by
                              character. */}
                          <span className="flex items-center gap-1">
                            <span className="font-mono tracking-wide">
                              <Highlight text={coupon.code} query={debouncedSearchQuery} />
                            </span>
                            <CopyCodeButton code={coupon.code} />
                          </span>
                        </td>
                        <td className="px-6 py-3 font-semibold">{billing.registrations}</td>
                        <td className="px-6 py-3 font-bold text-[#083F92]">
                          {formatMoney(billing.toInvoice.amount)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${state.tone}`}
                          >
                            {state.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/coupons/${coupon._id}`}>
                              <ActionIconButton
                                icon={Eye}
                                label="View registrations and billing"
                                tabIndex={-1}
                              />
                            </Link>
                            {coupon.isArchived && (
                              <ActionIconButton
                                icon={ArchiveRestore}
                                label="Restore"
                                tone="success"
                                onClick={() => setCouponToRestore(coupon)}
                              />
                            )}
                            {!coupon.isArchived && (
                              <>
                                <ActionIconButton
                                  icon={Edit}
                                  label="Edit"
                                  onClick={() => setCouponToEdit(coupon)}
                                />
                                <ActionIconButton
                                  icon={coupon.isActive ? Ban : Star}
                                  label={coupon.isActive ? 'Deactivate' : 'Activate'}
                                  tone={coupon.isActive ? 'danger' : 'success'}
                                  onClick={() => setCouponToToggle(coupon)}
                                />
                                {/* There is no delete. Archiving keeps the row
                                    and everything billed to it. */}
                                <ActionIconButton
                                  icon={Archive}
                                  label="Archive"
                                  tone="danger"
                                  onClick={() => setCouponToArchive(coupon)}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={TicketPercent}
                        title={
                          debouncedSearchQuery
                            ? 'No organizations found'
                            : isArchivedTab
                              ? 'No archived organizations'
                              : status === 'inactive'
                                ? 'No inactive organizations'
                                : 'No organizations yet'
                        }
                        description={
                          debouncedSearchQuery
                            ? 'Try a different search, or clear it to see everyone.'
                            : isArchivedTab
                              ? 'Organizations you archive will be kept here.'
                              : status === 'inactive'
                                ? 'Organizations you deactivate will be listed here.'
                                : 'Add a school, club or district to give it a coupon code.'
                        }
                      />
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
        onReplaceCode={() => setCouponToReplace(couponToEdit)}
      />

      <ReplaceCodeDialog
        open={Boolean(couponToReplace)}
        onOpenChange={(open) => !open && setCouponToReplace(null)}
        coupon={couponToReplace}
      />

      <ConfirmDialog
        open={Boolean(couponToToggle)}
        onOpenChange={(open) => !open && setCouponToToggle(null)}
        title={couponToToggle?.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
        description={
          couponToToggle?.isActive
            ? `Players will no longer be able to use ${couponToToggle?.code}. Registrations already made with it, and what is owed, are not affected.`
            : `Players will be able to use ${couponToToggle?.code} again.`
        }
        confirmText={couponToToggle?.isActive ? 'Deactivate' : 'Activate'}
        loadingText={couponToToggle?.isActive ? 'Deactivating...' : 'Activating...'}
        tone={couponToToggle?.isActive ? 'danger' : 'primary'}
        icon={couponToToggle?.isActive ? Ban : Star}
        isLoading={isToggling}
        onConfirm={confirmToggle}
      />

      <ConfirmDialog
        open={Boolean(couponToRestore)}
        onOpenChange={(open) => !open && setCouponToRestore(null)}
        title="Restore Organization"
        description={`${couponToRestore?.organizationName} moves back to the Inactive tab with its code ${couponToRestore?.code}. The code stays off until you activate it.`}
        confirmText="Restore"
        loadingText="Restoring..."
        tone="primary"
        icon={ArchiveRestore}
        isLoading={isRestoring}
        onConfirm={confirmRestore}
      />

      <ConfirmDialog
        open={Boolean(couponToArchive)}
        onOpenChange={(open) => !open && setCouponToArchive(null)}
        title="Archive Organization"
        description={`${couponToArchive?.organizationName} and its code ${couponToArchive?.code} will stop working and move to the Archived tab. Nothing is deleted: every registration billed to it stays on record.`}
        confirmText="Archive"
        loadingText="Archiving..."
        tone="danger"
        icon={Archive}
        isLoading={isArchiving}
        onConfirm={confirmArchive}
      />
    </PageTransition>
  );
}
