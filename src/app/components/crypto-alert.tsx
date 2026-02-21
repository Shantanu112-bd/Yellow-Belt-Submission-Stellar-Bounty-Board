import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Ban, RefreshCw, X, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';

export type CryptoAlertVariant = 'wallet-not-found' | 'insufficient-balance' | 'transaction-rejected';

interface CryptoAlertProps {
    variant: CryptoAlertVariant;
    className?: string;
    onDismiss?: () => void;
    /** Current balance for insufficient funds alert */
    currentBalance?: number;
    /** Required balance for insufficient funds alert */
    requiredBalance?: number;
}

export function CryptoAlert({
    variant,
    className,
    onDismiss,
    currentBalance = 25,
    requiredBalance = 50
}: CryptoAlertProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    if (!isVisible) return null;

    const renderContent = () => {
        switch (variant) {
            case 'wallet-not-found':
                return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-orange-900 dark:text-orange-100">
                                    Freighter wallet not detected
                                </span>
                                <span className="text-sm text-orange-800/80 dark:text-orange-200/80">
                                    You need a wallet to interact with this dApp
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-200 bg-white/50 hover:bg-white text-orange-700 hover:text-orange-800 group whitespace-nowrap self-start sm:self-auto"
                            onClick={() => window.open('https://www.freighter.app/', '_blank')}
                        >
                            Install Freighter
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                );

            case 'insufficient-balance':
                return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-full text-red-600 dark:text-red-400 shrink-0">
                                <Ban className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-red-900 dark:text-red-100">
                                    Insufficient XLM balance
                                </span>
                                <span className="text-sm text-red-800/80 dark:text-red-200/80">
                                    You have <span className="font-mono font-medium">{currentBalance} XLM</span>, need <span className="font-mono font-bold">{requiredBalance} XLM</span>
                                </span>
                            </div>
                        </div>
                        <a
                            href="#"
                            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 hover:underline flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                        >
                            Get testnet XLM
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                );

            case 'transaction-rejected':
                return (
                    <div className="flex items-start sm:items-center w-full gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400 shrink-0 animate-pulse">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                                Transaction was rejected
                            </span>
                            <span className="text-sm text-yellow-800/80 dark:text-yellow-200/80">
                                Please approve in your wallet to continue
                            </span>
                        </div>
                    </div>
                );
        }
    };

    const specificStyles = {
        'wallet-not-found': 'bg-[#F97316]/10 border-l-[3px] border-l-[#F97316] border-y border-r border-[#F97316]/20',
        'insufficient-balance': 'bg-[#EF4444]/10 border border-[#EF4444]/20',
        'transaction-rejected': 'bg-[#F59E0B]/10 border border-[#F59E0B]/20',
    };

    const animationProps = variant === 'transaction-rejected' ? {
        animate: {
            boxShadow: [
                "0 0 0 0 rgba(245, 158, 11, 0)",
                "0 0 0 2px rgba(245, 158, 11, 0.1)",
                "0 0 0 4px rgba(245, 158, 11, 0.05)",
                "0 0 0 0 rgba(245, 158, 11, 0)"
            ]
        },
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        } as any
    } : {};

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                    {...animationProps}
                    className={cn(
                        "relative w-full p-4 flex items-start gap-4 mb-4 overflow-hidden rounded-xl",
                        specificStyles[variant],
                        className
                    )}
                >
                    <div className="w-full pr-8">
                        {renderContent()}
                    </div>

                    <button
                        onClick={handleDismiss}
                        className={cn(
                            "absolute top-4 right-4 p-1 rounded-md transition-colors",
                            variant === 'wallet-not-found' && "text-orange-400 hover:bg-orange-200/50 hover:text-orange-600",
                            variant === 'insufficient-balance' && "text-red-400 hover:bg-red-200/50 hover:text-red-600",
                            variant === 'transaction-rejected' && "text-yellow-400 hover:bg-yellow-200/50 hover:text-yellow-600",
                        )}
                    >
                        <X className="w-4 h-4" />
                        <span className="sr-only">Dismiss</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
