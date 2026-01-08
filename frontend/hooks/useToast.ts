import toast, { ToastOptions } from 'react-hot-toast';

/**
 * Centralized toast notification hook
 * Wraps react-hot-toast with consistent defaults
 */
export const useToast = () => {
  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  };

  const error = (message: string | Error, options?: ToastOptions) => {
    const errorMessage = message instanceof Error ? message.message : message;
    return toast.error(errorMessage || 'An error occurred', {
      duration: 4000,
      ...options,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      ...options,
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
      ...options,
    });
  };

  return {
    success,
    error,
    info,
    warning,
    promise: toast.promise,
  };
};
