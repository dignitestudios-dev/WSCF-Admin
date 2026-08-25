import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"


/**
 * Stops a number field from changing when the wheel rolls over it.
 *
 * Browsers treat a focused number input as a spinner, so scrolling the page
 * with the cursor over one silently edits the value — a trophy count or an
 * entry fee changes without anyone touching it. Blurring on wheel gives the
 * field back to the page.
 */
const preventWheelChange = (event: React.WheelEvent<HTMLInputElement>) => {
  event.currentTarget.blur();
};

function Input({
  className,
  type,
  onWheel,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      onWheel={type === "number" ? preventWheelChange : onWheel}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
