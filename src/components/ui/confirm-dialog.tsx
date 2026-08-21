'use client';

import { AlertTriangle, Loader2, type LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ConfirmTone = 'danger' | 'primary';

const TONES: Record<ConfirmTone, { badge: string; confirm: string }> = {
  danger: {
    badge: 'bg-[#CE2D32]',
    confirm: 'bg-[#CE2D32] hover:bg-[#CE2D32]/90 shadow-[0px_4px_4px_rgba(206,45,50,0.25)]',
  },
  primary: {
    badge: 'bg-[#083F92]',
    confirm: 'bg-[#083F92] hover:bg-[#083F92]/90 shadow-[0px_4px_4px_rgba(8,63,146,0.25)]',
  },
};

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  tone?: ConfirmTone;
  icon?: LucideIcon;
  /** Extra input the confirmation needs — e.g. a reason for deactivating. */
  children?: React.ReactNode;
  /** Blocks confirm while a required child input is empty. */
  confirmDisabled?: boolean;
}

/**
 * The one confirmation dialog for the whole panel.
 *
 * Styled like the rest of the admin dialogs — Poppins, 12px radius, a solid
 * circular icon badge and pill buttons — rather than the shadcn defaults, so a
 * destructive prompt does not look like it came from a different product.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  loadingText,
  tone = 'danger',
  icon: Icon = AlertTriangle,
  children,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const tones = TONES[tone];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // A confirm in flight must not be dismissed out from under the request.
        if (isLoading) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-[90vw]! sm:w-[440px]! max-w-[440px]! rounded-[12px] border-none bg-white p-0 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-5 px-8 pt-8 text-center">
          <span
            className={cn(
              'flex h-[72px] w-[72px] items-center justify-center rounded-full text-white shadow-md',
              tones.badge
            )}
          >
            <Icon className="h-8 w-8" />
          </span>

          <div className="flex flex-col gap-2">
            <DialogTitle className="font-poppins text-[22px] font-semibold leading-[30px] text-[#181818]">
              {title}
            </DialogTitle>
            <div className="font-poppins text-[14px] leading-[21px] text-[#565656]">
              {description}
            </div>
          </div>
        </div>

        {children ? <div className="px-8 pt-5 text-left">{children}</div> : null}

        <div className="flex flex-col-reverse gap-3 px-8 pb-8 pt-6 sm:flex-row">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="h-[48px] flex-1 cursor-pointer rounded-[100px] border border-[#DADADA] bg-white font-poppins text-[14px] font-semibold text-[#181818] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading || confirmDisabled}
            onClick={onConfirm}
            className={cn(
              'flex h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[100px] font-poppins text-[14px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              tones.confirm
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? (loadingText ?? 'Working...') : confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
