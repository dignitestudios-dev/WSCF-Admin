import { cn } from '@/lib/utils';

interface EmailVerifiedBadgeProps {
  /** undefined means the API did not say; nothing is shown rather than guessing. */
  verified: boolean | undefined;
  className?: string;
}

/**
 * Whether a parent has confirmed their email.
 *
 * Verification is optional, so "Not verified" is information for the admin, not
 * a warning: the account works either way. Amber rather than red for that
 * reason.
 */
export function EmailVerifiedBadge({ verified, className }: EmailVerifiedBadgeProps) {
  if (verified === undefined) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-poppins text-[12px] font-semibold whitespace-nowrap',
        verified
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-800',
        className
      )}
    >
      {verified ? 'Verified' : 'Not verified'}
    </span>
  );
}
