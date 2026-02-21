import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TransactionToastProps } from '../components/transaction-toast';

interface ToastContextType {
  toasts: TransactionToastProps[];
  addToast: (toast: Omit<TransactionToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
  showPending: (message?: string, estimatedTime?: string) => string;
  showSuccess: (message?: string, txHash?: string) => string;
  showError: (message?: string, onRetry?: () => void) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<TransactionToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<TransactionToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: TransactionToastProps = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, [removeToast]);

  const showPending = useCallback((message?: string, estimatedTime?: string) => {
    return addToast({
      type: 'pending',
      message,
      estimatedTime,
    });
  }, [addToast]);

  const showSuccess = useCallback((message?: string, txHash?: string) => {
    return addToast({
      type: 'success',
      message,
      txHash,
    });
  }, [addToast]);

  const showError = useCallback((message?: string, onRetry?: () => void) => {
    return addToast({
      type: 'error',
      errorMessage: message,
      onRetry,
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showPending, showSuccess, showError }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
