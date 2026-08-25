"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Toasts, styled to match the player app.
 *
 * Same corner, same solid green/red card, same heading-plus-detail shape and
 * the same dismiss button — the two interfaces are one product and should not
 * announce things in two different visual languages.
 *
 * `richColors` is deliberately off: it paints its own pale palette and would
 * fight the solid colours set below.
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
      theme="light"
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        info: <SuccessIcon />,
        warning: <ErrorIcon />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-white shadow-[0_8px_24px_rgba(15,23,42,0.2)] border-none font-poppins",
          success: "bg-emerald-600",
          error: "bg-red-600",
          info: "bg-[#083F92]",
          warning: "bg-amber-600",
          icon: "shrink-0 text-white mt-0.5",
          title: "text-sm font-semibold text-white",
          description: "mt-0.5 text-sm leading-snug text-white/95",
          closeButton:
            "bg-transparent border-none text-white/80 hover:bg-white/15 hover:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
