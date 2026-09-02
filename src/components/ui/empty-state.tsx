'use client';

import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  /** Something recognisable for the module — Trophy, Users, Bell. */
  icon?: LucideIcon;
  /** What is missing, in the reader's words: "No tournaments yet". */
  title: string;
  /** Optional second line — usually how to create the first record. */
  description?: string;
  /** Optional call to action, e.g. an "Add Tournament" button. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The one empty state.
 *
 * Every list used to write its own bare `<div>No … found.</div>`, so they
 * disagreed on wording, colour and padding as well as having no icon at all.
 * Point new lists here rather than adding another one.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#083F92]/10">
        <Icon className="h-7 w-7 text-[#083F92]" aria-hidden="true" />
      </div>

      <p className="font-poppins text-[15px] font-medium text-[#181818]">
        {title}
      </p>

      {description && (
        <p className="font-poppins max-w-[360px] text-[13px] leading-[20px] text-[#787878]">
          {description}
        </p>
      )}

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
