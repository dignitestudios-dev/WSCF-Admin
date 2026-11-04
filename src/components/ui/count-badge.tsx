import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CountBadgeProps {
  /** Total from the API's pagination block. Undefined until it has loaded. */
  count: number | undefined;
  /** Singular noun; "s" is added for any count other than 1 unless `plural` is given. */
  label: string;
  plural?: string;
  isLoading?: boolean;
  /**
   * A search or filter is narrowing the list, so the number is the size of
   * what matches rather than everything there is. Said out loud, so an admin
   * does not read "3" as the size of the whole table.
   */
  filtered?: boolean;
  className?: string;
}

/**
 * The size of a list, as a small pill beside the page title.
 *
 * The count is the API's `totalItems`, i.e. across every page, not just the
 * rows on screen.
 */
export function CountBadge({
  count,
  label,
  plural,
  isLoading = false,
  filtered = false,
  className,
}: CountBadgeProps) {
  if (count === undefined) {
    return isLoading ? <Skeleton className={cn('h-[28px] w-[84px] rounded-full', className)} /> : null;
  }

  const noun = count === 1 ? label : (plural ?? `${label}s`);

  return (
    <span
      aria-live="polite"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#083F92]/10 px-3 py-1 font-poppins text-[13px] font-medium leading-[20px] text-[#083F92]',
        className,
      )}
    >
      <span className="font-semibold tabular-nums">{count.toLocaleString('en-US')}</span>
      <span>{filtered ? `matching ${noun}` : noun}</span>
    </span>
  );
}
