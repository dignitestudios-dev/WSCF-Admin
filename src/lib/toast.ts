import { toast as sonner, type ExternalToast } from "sonner";

/**
 * Toasts, shaped the same way the player app shapes them.
 *
 * The two interfaces are the same product and were telling people things in
 * two different visual languages: the player app showed a solid green or red
 * card, bottom right, headed "Success" or "Error" with the detail underneath;
 * the admin panel showed a pale bordered strip, top right, with the message on
 * the title line and nothing under it.
 *
 * Sonner has no way to inject a heading from configuration, so it is done
 * here. Call sites stay exactly as they were — `toast.success("Saved")` — they
 * just import from here instead of from sonner directly.
 */

/**
 * A caller that already supplies its own `description` has written the two
 * lines itself, so its message stays the heading and nothing is substituted.
 */
const shape = (
  heading: string,
  message: string,
  options?: ExternalToast,
): [string, ExternalToast | undefined] =>
  options?.description !== undefined
    ? [message, options]
    : [heading, { ...options, description: message }];

export const toast = {
  success: (message: string, options?: ExternalToast) =>
    sonner.success(...shape("Success", message, options)),
  error: (message: string, options?: ExternalToast) =>
    sonner.error(...shape("Error", message, options)),
  info: (message: string, options?: ExternalToast) =>
    sonner.info(...shape("Info", message, options)),
  warning: (message: string, options?: ExternalToast) =>
    sonner.warning(...shape("Warning", message, options)),

  /** Passed through untouched — these set their own text. */
  promise: sonner.promise,
  dismiss: sonner.dismiss,
  custom: sonner.custom,
};
