'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, Download, Edit, FileText, CircleDollarSign, RotateCcw, Users, ArchiveRestore } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/animations/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionPillButton } from '@/components/ui/action-button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import {
  useCoupon,
  useCouponRegistrations,
  useRestoreCoupon,
  useUpdateBilling,
} from '@/features/coupons/hooks/use-coupons';
import {
  couponService,
  type BillingStatus,
  type CouponRegistration,
} from '@/features/coupons/services/coupon.service';
import { EditCouponDialog } from '@/features/coupons/components/edit-coupon-dialog';
import { ReplaceCodeDialog } from '@/features/coupons/components/replace-code-dialog';
import { formatMoney } from '@/features/coupons/utils/format';
import { CopyCodeButton } from '@/features/coupons/components/copy-code-button';

const STATUS_TABS: { value: BillingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unbilled', label: 'To invoice' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
];

const STATUS_BADGE: Record<BillingStatus, { label: string; tone: string }> = {
  unbilled: { label: 'To invoice', tone: 'bg-[#FFF4E5] text-[#B54708]' },
  invoiced: { label: 'Invoiced', tone: 'bg-[#E8F0FE] text-[#083F92]' },
  paid: { label: 'Paid', tone: 'bg-[#E7F6EC] text-[#036B26]' },
};

const dateLabel = (value: string | null) =>
  value ? format(new Date(value), 'dd MMM yyyy') : '—';

function StatCard({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-[16px] border px-5 py-4 ${
        emphasis ? 'border-[#083F92] bg-[#083F92] text-white' : 'border-[#DADADA] bg-white'
      }`}
    >
      <span
        className={`font-poppins text-[12px] font-medium ${emphasis ? 'text-white/80' : 'text-[#8C8C8C]'}`}
      >
        {label}
      </span>
      <span
        className={`font-poppins text-[24px] font-bold leading-8 ${emphasis ? 'text-white' : 'text-[#083F92]'}`}
      >
        {value}
      </span>
      {hint ? (
        <span className={`font-poppins text-[11px] ${emphasis ? 'text-white/80' : 'text-[#8C8C8C]'}`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export default function CouponDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // What the selection is about to be marked as, awaiting confirmation.
  const [pendingStatus, setPendingStatus] = useState<BillingStatus | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const { data: coupon, isLoading: isCouponLoading } = useCoupon(id);
  const { data: groups = [], isLoading: isGroupsLoading } = useCouponRegistrations(
    id,
    statusFilter === 'all' ? undefined : statusFilter
  );
  const { mutateAsync: updateBilling, isPending: isUpdating } = useUpdateBilling(id);
  const { mutateAsync: restoreCoupon, isPending: isRestoring } = useRestoreCoupon();
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  const allRegistrations: CouponRegistration[] = groups.flatMap((g) => g.registrations);
  const selectedTotal = allRegistrations
    .filter((r) => selected.has(r._id))
    .reduce((sum, r) => sum + r.amount, 0);

  const changeFilter = (value: BillingStatus | 'all') => {
    setStatusFilter(value);
    // A selection of rows that are no longer on screen would be edited blind.
    setSelected(new Set());
  };

  const toggleOne = (registrationId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(registrationId)) next.delete(registrationId);
      else next.add(registrationId);
      return next;
    });

  const toggleGroup = (ids: string[]) =>
    setSelected((current) => {
      const next = new Set(current);
      const allIn = ids.every((registrationId) => next.has(registrationId));
      ids.forEach((registrationId) =>
        allIn ? next.delete(registrationId) : next.add(registrationId)
      );
      return next;
    });

  const applyStatus = async () => {
    if (!pendingStatus) return;

    try {
      await updateBilling({
        redemptionIds: [...selected],
        status: pendingStatus,
        invoiceNumber: invoiceNumber.trim() || null,
      });
      setSelected(new Set());
      setPendingStatus(null);
      setInvoiceNumber('');
    } catch {
      // surfaced by the mutation's toast
    }
  };

  const exportCsv = async () => {
    if (!coupon) return;
    try {
      setIsExporting(true);
      const blob = await couponService.exportRegistrations(
        id,
        statusFilter === 'all' ? undefined : statusFilter
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${coupon.organizationName.replace(/[^a-z0-9]+/gi, '_')}_${coupon.code}_registrations.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export registrations.');
    } finally {
      setIsExporting(false);
    }
  };

  const billing = coupon?.billing;

  return (
    <PageTransition>
      <div className="flex w-full flex-col gap-6 pb-28 font-sans">
        {/* Back + title */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.back()}
              className="flex w-fit items-center gap-1.5 text-[#083F92] transition-opacity hover:opacity-80 focus:outline-none"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
              <span className="font-poppins text-[18px] font-medium leading-[27px]">Back</span>
            </button>

            {isCouponLoading || !coupon ? (
              <Skeleton className="h-9 w-72" />
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <h1 className="m-0 break-words font-poppins text-[28px] font-bold leading-[36px] text-[#083F92] [overflow-wrap:anywhere] sm:text-[32px]">
                  {coupon.organizationName}
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-[#083F92]/10 py-1 pl-3 pr-1.5 font-mono text-[14px] font-semibold tracking-wide text-[#083F92]">
                  {coupon.code}
                  <CopyCodeButton code={coupon.code} />
                </span>
                {coupon.isArchived ? (
                  <span className="rounded-full bg-[#F4F4F4] px-2.5 py-0.5 text-[11px] font-semibold text-[#8C8C8C]">
                    Archived
                  </span>
                ) : !coupon.isActive ? (
                  <span className="rounded-full bg-[#F4F4F4] px-2.5 py-0.5 text-[11px] font-semibold text-[#8C8C8C]">
                    Inactive
                  </span>
                ) : null}
              </div>
            )}
            {coupon && coupon.previousCodes.length > 0 ? (
              <p className="font-poppins text-[12px] text-[#8C8C8C]">
                Replaced codes:{' '}
                {coupon.previousCodes.map((previous, index) => (
                  <span key={previous.code}>
                    {index > 0 ? ', ' : ''}
                    <span className="font-mono line-through">{previous.code}</span> (
                    {dateLabel(previous.revokedAt)})
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <ActionPillButton
              icon={Download}
              label={isExporting ? 'Exporting...' : 'Export CSV'}
              onClick={exportCsv}
              disabled={isExporting || !coupon || allRegistrations.length === 0}
            />
            {coupon && !coupon.isArchived ? (
              <ActionPillButton icon={Edit} label="Edit" onClick={() => setIsEditOpen(true)} />
            ) : null}
            {coupon?.isArchived ? (
              <ActionPillButton
                icon={ArchiveRestore}
                label="Restore"
                tone="success"
                onClick={() => setIsRestoreOpen(true)}
              />
            ) : null}
          </div>
        </div>

        {/* Money */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {isCouponLoading || !billing ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[98px] rounded-[16px]" />
            ))
          ) : (
            <>
              <StatCard
                emphasis
                label="To be invoiced"
                value={formatMoney(billing.toInvoice.amount)}
                hint={`${billing.toInvoice.count} registration${billing.toInvoice.count === 1 ? '' : 's'}`}
              />
              <StatCard
                label="Invoiced, awaiting payment"
                value={formatMoney(billing.invoiced.amount)}
                hint={`${billing.invoiced.count} registration${billing.invoiced.count === 1 ? '' : 's'}`}
              />
              <StatCard
                label="Paid"
                value={formatMoney(billing.paid.amount)}
                hint={`${billing.paid.count} registration${billing.paid.count === 1 ? '' : 's'}`}
              />
              <StatCard
                label="Total registered"
                value={formatMoney(billing.total)}
                hint={`${billing.registrations} registration${billing.registrations === 1 ? '' : 's'}`}
              />
              <StatCard
                label="Valid until"
                value={coupon?.validUntil ? dateLabel(coupon.validUntil) : 'No end date'}
                hint={coupon?.validFrom ? `From ${dateLabel(coupon.validFrom)}` : undefined}
              />
            </>
          )}
        </div>

        {/* Filter */}
        <div role="tablist" className="flex w-fit flex-wrap gap-2 rounded-full bg-[#083F92]/10 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={statusFilter === tab.value}
              onClick={() => changeFilter(tab.value)}
              className={`cursor-pointer rounded-full px-5 py-2 font-poppins text-[13px] font-semibold transition-colors ${
                statusFilter === tab.value
                  ? 'bg-[#083F92] text-white shadow-sm'
                  : 'text-[#083F92] hover:bg-[#083F92]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Registrations by tournament */}
        {isGroupsLoading ? (
          <Skeleton className="h-[220px] w-full rounded-[24px]" />
        ) : groups.length === 0 ? (
          <div className="rounded-[24px] border border-[#DADADA] bg-white">
            <EmptyState
              icon={Users}
              title={
                statusFilter === 'all'
                  ? 'No registrations yet'
                  : 'Nothing in this status'
              }
              description={
                statusFilter === 'all'
                  ? 'Students who register with this code will be listed here.'
                  : 'No registrations are in this billing status.'
              }
            />
          </div>
        ) : (
          groups.map((group) => {
            const ids = group.registrations.map((r) => r._id);
            const allSelected = ids.every((registrationId) => selected.has(registrationId));

            return (
              <section
                key={group.tournament._id}
                className="overflow-hidden rounded-[24px] border border-[#DADADA] bg-white shadow-sm"
              >
                <header className="flex flex-col gap-1 border-b border-[#DADADA]/60 bg-[#083F92]/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col">
                    {group.tournament.exists ? (
                      <Link
                        href={`/tournaments/${group.tournament._id}`}
                        className="font-poppins text-[18px] font-bold text-[#083F92] hover:underline"
                      >
                        {group.tournament.title}
                      </Link>
                    ) : (
                      <span className="font-poppins text-[18px] font-bold text-[#8C8C8C]">
                        {group.tournament.title}
                      </span>
                    )}
                    <span className="font-poppins text-[12px] text-[#636363]">
                      {dateLabel(group.tournament.date)}
                    </span>
                  </div>
                  <span className="font-poppins text-[14px] font-semibold text-[#083F92]">
                    {group.count} student{group.count === 1 ? '' : 's'} ·{' '}
                    {formatMoney(group.total)}
                  </span>
                </header>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse">
                    <thead>
                      <tr className="h-[44px] bg-[#083F92] text-left font-poppins text-[13px] font-semibold text-white">
                        <th className="w-[48px] px-6 py-2">
                          <input
                            type="checkbox"
                            aria-label={`Select all for ${group.tournament.title}`}
                            checked={allSelected}
                            onChange={() => toggleGroup(ids)}
                            className="h-4 w-4 cursor-pointer accent-white"
                          />
                        </th>
                        <th className="px-4 py-2">Player</th>
                        <th className="w-[110px] px-4 py-2">Member ID</th>
                        <th className="w-[70px] px-4 py-2">Grade</th>
                        <th className="px-4 py-2">Parent</th>
                        <th className="w-[120px] px-4 py-2">Registered</th>
                        <th className="w-[90px] px-4 py-2">Amount</th>
                        <th className="w-[150px] px-4 py-2">Billing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.registrations.map((item, index) => {
                        const badge = STATUS_BADGE[item.billingStatus];
                        return (
                          <tr
                            key={item._id}
                            className={`h-[52px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                              selected.has(item._id)
                                ? 'bg-[#083F92]/15'
                                : index % 2 !== 0
                                  ? 'bg-[#083F92]/5'
                                  : 'bg-white'
                            }`}
                          >
                            <td className="px-6 py-2">
                              <input
                                type="checkbox"
                                aria-label={`Select ${item.player?.name ?? 'registration'}`}
                                checked={selected.has(item._id)}
                                onChange={() => toggleOne(item._id)}
                                className="h-4 w-4 cursor-pointer accent-[#083F92]"
                              />
                            </td>
                            <td className="px-4 py-2 font-semibold text-black">
                              {item.player ? (
                                <Link
                                  href={`/users/${item.player._id}`}
                                  className="underline-offset-2 hover:underline"
                                >
                                  {item.player.name || 'N/A'}
                                </Link>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td className="px-4 py-2 font-semibold">
                              {item.player?.membershipId || '—'}
                            </td>
                            <td className="px-4 py-2 font-semibold">{item.player?.grade || '—'}</td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col leading-4">
                                <span className="font-semibold text-black">
                                  {item.parent?.name || '—'}
                                </span>
                                <span className="text-[11px]">{item.parent?.email || ''}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 font-semibold">{dateLabel(item.registeredAt)}</td>
                            <td className="px-4 py-2 font-bold text-[#083F92]">
                              {formatMoney(item.amount)}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col items-start gap-0.5">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.tone}`}
                                >
                                  {badge.label}
                                </span>
                                {item.invoiceNumber ? (
                                  <span className="text-[11px]">#{item.invoiceNumber}</span>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Appears once something is selected. */}
      {selected.size > 0 ? (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-[880px] flex-col gap-3 rounded-[24px] border border-[#083F92]/20 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(8,63,146,0.25)] sm:flex-row sm:items-center sm:justify-between">
          <span className="font-poppins text-[14px] font-semibold text-[#083F92]">
            {selected.size} selected · {formatMoney(selectedTotal)}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-full px-4"
              onClick={() => setPendingStatus('unbilled')}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              To invoice
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-full px-4"
              onClick={() => setPendingStatus('invoiced')}
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Mark invoiced
            </Button>
            <Button
              className="h-10 rounded-full bg-[#083F92] px-4 hover:bg-[#062f6e]"
              onClick={() => setPendingStatus('paid')}
            >
              <CircleDollarSign className="mr-1.5 h-4 w-4" />
              Mark paid
            </Button>
          </div>
        </div>
      ) : null}

      <EditCouponDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        coupon={coupon ?? null}
        onReplaceCode={() => setIsReplaceOpen(true)}
      />

      <ReplaceCodeDialog
        open={isReplaceOpen}
        onOpenChange={setIsReplaceOpen}
        coupon={coupon ?? null}
      />

      {/* Invoiced / paid: an invoice reference can be attached. */}
      <Dialog
        open={pendingStatus === 'invoiced' || pendingStatus === 'paid'}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setPendingStatus(null);
            setInvoiceNumber('');
          }
        }}
      >
        <DialogContent className="rounded-[24px] p-6 sm:max-w-[460px]">
          <DialogTitle className="font-poppins text-[20px] font-semibold text-[#083F92]">
            Mark {selected.size} registration{selected.size === 1 ? '' : 's'} as{' '}
            {pendingStatus === 'paid' ? 'paid' : 'invoiced'}
          </DialogTitle>
          <p className="font-poppins text-[13px] text-[#8C8C8C]">
            {formatMoney(selectedTotal)} in total.
          </p>

          <div className="mt-2 flex flex-col gap-2">
            <Label
              htmlFor="invoiceNumber"
              className="font-poppins text-[14px] font-medium text-[#181818]"
            >
              Invoice number <span className="text-[#8C8C8C]">(optional)</span>
            </Label>
            <Input
              id="invoiceNumber"
              maxLength={60}
              autoComplete="off"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              disabled={isUpdating}
              className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-full px-6"
              disabled={isUpdating}
              onClick={() => {
                setPendingStatus(null);
                setInvoiceNumber('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-11 rounded-full bg-[#083F92] px-6 hover:bg-[#062f6e]"
              disabled={isUpdating}
              onClick={applyStatus}
            >
              {isUpdating ? 'Saving...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isRestoreOpen}
        onOpenChange={setIsRestoreOpen}
        title="Restore Organization"
        description={`${coupon?.organizationName} moves back to the Inactive tab with its code ${coupon?.code}. The code stays off until you activate it.`}
        confirmText="Restore"
        loadingText="Restoring..."
        tone="primary"
        icon={ArchiveRestore}
        isLoading={isRestoring}
        onConfirm={async () => {
          try {
            await restoreCoupon(id);
            setIsRestoreOpen(false);
          } catch {
            // surfaced by the mutation's toast
          }
        }}
      />

      <ConfirmDialog
        open={pendingStatus === 'unbilled'}
        onOpenChange={(open) => !open && setPendingStatus(null)}
        title="Move back to “To invoice”"
        description={`${selected.size} registration${selected.size === 1 ? '' : 's'} (${formatMoney(selectedTotal)}) will count as not yet invoiced, and their invoice number and dates are cleared.`}
        confirmText="Move back"
        loadingText="Saving..."
        tone="primary"
        icon={RotateCcw}
        isLoading={isUpdating}
        onConfirm={applyStatus}
      />
    </PageTransition>
  );
}
