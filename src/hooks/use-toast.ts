
import { toast as sonnerToast } from "sonner";

// Create a wrapper for the sonner toast to match the expected interface
export const toast = {
  success: (title: string, options?: any) => sonnerToast.success(title, options),
  error: (title: string, options?: any) => sonnerToast.error(title, options),
  warning: (title: string, options?: any) => sonnerToast.warning(title, options),
  info: (title: string, options?: any) => sonnerToast.info(title, options),
};

export const useToast = () => {
  return {
    toast,
    toasts: []
  };
};
