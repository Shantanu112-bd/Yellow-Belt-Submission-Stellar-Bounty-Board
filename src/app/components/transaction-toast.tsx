import { motion } from 'motion/react';
import { CheckCircle2, X, AlertCircle, Loader2, Copy, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './ui/utils';

export type ToastType = 'pending' | 'success' | 'error';

export interface TransactionToastProps {
  id: string;
  type: ToastType;
  message?: string;
  txHash?: string;
  estimatedTime?: string;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function TransactionToast({
  type,
  message,
  txHash,
  estimatedTime = '~15 seconds',
  errorMessage,
  onClose,
  onRetry,
}: TransactionToastProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    // Trigger confetti on success
    if (type === 'success') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  }, [type]);

  const handleCopy = async () => {
    if (txHash) {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewExplorer = () => {
    if (txHash) {
      window.open(`https://stellar.expert/explorer/public/tx/${txHash}`, '_blank');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 400, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'relative w-[420px] rounded-xl shadow-2xl overflow-hidden',
        'bg-card/95 backdrop-blur-xl border-2',
        type === 'pending' && 'border-primary/30',
        type === 'success' && 'border-success/30',
        type === 'error' && 'border-error/30'
      )}
    >
      {/* Confetti Animation for Success */}
      {showConfetti && type === 'success' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#10B981', '#6366F1', '#06B6D4', '#F59E0B'][i % 4],
                left: `${Math.random() * 100}%`,
                top: '50%',
              }}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{
                y: [0, -100 - Math.random() * 100],
                x: [(Math.random() - 0.5) * 200],
                opacity: [1, 0],
                scale: [1, 0],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              }}
              transition={{ duration: 0.8, delay: i * 0.02 }}
            />
          ))}
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors group"
        aria-label="Close notification"
      >
        <X size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      {/* Content */}
      <div className="p-5">
        {/* PENDING STATE */}
        {type === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Animated Spinner */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary/50 flex items-center justify-center"
              >
                <Loader2 size={20} className="text-white" />
              </motion.div>

              <div className="flex-1 pt-1">
                <h4 className="font-bold text-base text-card-foreground mb-1">
                  {message || 'Transaction pending...'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Estimated time: {estimatedTime}
                </p>
              </div>
            </div>

            {/* Indeterminate Progress Bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ width: '25%' }}
              />
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {type === 'success' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Animated Checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-success flex items-center justify-center"
              >
                <CheckCircle2 size={24} className="text-white" />
              </motion.div>

              <div className="flex-1 pt-1">
                <h4 className="font-bold text-base text-card-foreground mb-1">
                  {message || 'Transaction successful!'}
                </h4>

                {/* Transaction Hash */}
                {txHash && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                      {txHash.slice(0, 8)}...{txHash.slice(-6)}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Copy transaction hash"
                    >
                      <Copy size={12} className={cn(
                        'transition-colors',
                        copied ? 'text-success' : 'text-muted-foreground'
                      )} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* View on Explorer Link */}
            {txHash && (
              <button
                onClick={handleViewExplorer}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-success/10 hover:bg-success/20 text-success font-semibold text-sm transition-colors group"
              >
                <span>View on Explorer</span>
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
        )}

        {/* ERROR STATE */}
        {type === 'error' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Animated X Icon with Shake */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  x: [0, -4, 4, -4, 4, 0],
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 300, damping: 20 },
                  rotate: { duration: 0.3 },
                  x: { duration: 0.4, delay: 0.3 },
                }}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-error flex items-center justify-center"
              >
                <AlertCircle size={24} className="text-white" />
              </motion.div>

              <div className="flex-1 pt-1">
                <h4 className="font-bold text-base text-card-foreground mb-1">
                  Transaction failed
                </h4>
                <p className="text-sm text-muted-foreground">
                  {errorMessage || 'An error occurred while processing your transaction'}
                </p>
              </div>
            </div>

            {/* Try Again Button */}
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-2 px-4 rounded-lg bg-error/10 hover:bg-error/20 text-error font-semibold text-sm transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Colored Bottom Border */}
      <div className={cn(
        'h-1 w-full',
        type === 'pending' && 'bg-gradient-to-r from-primary to-secondary',
        type === 'success' && 'bg-success',
        type === 'error' && 'bg-error'
      )} />
    </motion.div>
  );
}
