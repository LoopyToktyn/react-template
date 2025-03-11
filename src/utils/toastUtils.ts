// toastUtils.ts
import { toast as og_toast, ToastOptions, Id } from "react-toastify";
import { Logger } from "./logger";

const activeToastMessages = new Set<string>();

/**
 * Wraps react-toastify's toast to prevent duplicate messages.
 * Automatically removes messages from the active set when they close.
 */
const createToastWrapper = (
  toastFunction: (message: string, options?: ToastOptions) => Id
) => {
  return (message: string, options?: ToastOptions) => {
    if (activeToastMessages.has(message)) {
      return;
    }

    activeToastMessages.add(message);

    const toastId = toastFunction(message, {
      ...options,
      onClose: () => {
        // Delay checking toast visibility
        setTimeout(() => {
          if (!og_toast.isActive(toastId)) {
            activeToastMessages.delete(message);
          } else {
          }
        }, 100); // Small delay to let react-toastify confirm state
      },
    });

    return toastId;
  };
};

// Wrapped toast functions to prevent duplicates
const toast = {
  success: createToastWrapper(og_toast.success),
  error: createToastWrapper(og_toast.error),
  info: createToastWrapper(og_toast.info),
  warning: createToastWrapper(og_toast.warning),
  default: createToastWrapper(og_toast),
  dismiss: (toastId?: Id) => og_toast.dismiss(toastId),
  update: (toastId: Id, options: ToastOptions) =>
    og_toast.update(toastId, options),
};

// Toast autologger
const ToastLogger = new Logger();
const proxiedToast = ToastLogger.proxy(toast, "toast");

export default proxiedToast;
