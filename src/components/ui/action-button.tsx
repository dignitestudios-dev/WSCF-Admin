'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionTone = 'primary' | 'danger' | 'success';

const PILL_TONES: Record<ActionTone, { shell: string; badge: string }> = {
  primary: { shell: 'bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000]', badge: 'bg-[#083F92]' },
  danger: { shell: 'bg-[#CE2D32]/10 hover:bg-[#CE2D32]/15 text-[#CE2D32]', badge: 'bg-[#CE2D32]' },
  success: { shell: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700', badge: 'bg-emerald-600' },
};

const ICON_TONES: Record<ActionTone, string> = {
  primary: 'bg-[#083F92]',
  danger: 'bg-[#CE2D32]',
  success: 'bg-emerald-600',
};

interface ActionPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  tone?: ActionTone;
}

/**
 * The panel's signature action button: a soft pill with a solid circular icon
 * badge. Used for page-level actions — Export CSV, Create Team, Deactivate.
 */
export function ActionPillButton({
  icon: Icon,
  label,
  tone = 'primary',
  className,
  ...props
}: ActionPillButtonProps) {
  const tones = PILL_TONES[tone];

  return (
    <button
      type="button"
      className={cn(
        'flex h-[72px] shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-[100px] px-[15px] py-[15px] shadow-sm transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        tones.shell,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-white shadow-md',
          tones.badge
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="pr-2 font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.019em]">
        {label}
      </span>
    </button>
  );
}

interface ActionIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Required — the button has no visible text. */
  label: string;
  tone?: ActionTone;
}

/**
 * The compact round icon button used inside table rows. Solid fill, white glyph,
 * so a row of them reads as one control group rather than loose icons.
 */
export function ActionIconButton({
  icon: Icon,
  label,
  tone = 'primary',
  className,
  ...props
}: ActionIconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#083F92]/40 disabled:cursor-not-allowed disabled:opacity-40',
        ICON_TONES[tone],
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4 text-white" />
    </button>
  );
}
