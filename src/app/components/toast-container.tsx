import { AnimatePresence } from 'motion/react';
import { TransactionToast, TransactionToastProps } from './transaction-toast';

interface ToastContainerProps {
  toasts: TransactionToastProps[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <TransactionToast {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
