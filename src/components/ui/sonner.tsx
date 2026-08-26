"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Toasts, styled to match the player app exactly.
 *
 * `unstyled` is the important part. Sonner ships its own base styles on
 * `[data-sonner-toast]`, and they outrank utility classes passed through
 * `classNames` — set a background there and sonner's own still wins, which is
 * why an earlier attempt at this looked unchanged. Turning its styling off
 * entirely means the classes below are the only ones in play.
 *
 * Everything here mirrors `toast.tsx` in the player app: bottom right, a solid
 * green or red card, a heading with the detail underneath, and a dismiss
 * button.
 */

function SuccessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 12.5L10.5 15L16 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      duration={4000}
      icons={{
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        info: <SuccessIcon />,
        warning: <ErrorIcon />,
      }}
      toastOptions={{
        // Without this, sonner's own styles win and none of the below applies.
        unstyled: true,
        classNames: {
          toast:
            "flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-white font-poppins shadow-[0_8px_24px_rgba(15,23,42,0.2)]",
          success: "bg-emerald-600",
          error: "bg-red-600",
          info: "bg-[#083F92]",
          warning: "bg-amber-600",
          // No `default` entry on purpose. Sonner applies the default class
          // *alongside* the type class, so two `bg-*` utilities would land on
          // the same element and the winner would be decided by Tailwind's
          // emission order rather than by intent — an error toast could come
          // out blue after an unrelated change.
          loading: "bg-[#083F92]",
          icon: "mt-0.5 shrink-0 text-white",
          content: "min-w-0 flex-1",
          title: "text-sm font-semibold text-white",
          description: "mt-0.5 text-sm leading-snug text-white/95",
          closeButton:
            "shrink-0 rounded-md p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white",
          actionButton: "rounded-md bg-white/20 px-2 py-1 text-xs font-semibold text-white",
          cancelButton: "rounded-md px-2 py-1 text-xs font-semibold text-white/80",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
