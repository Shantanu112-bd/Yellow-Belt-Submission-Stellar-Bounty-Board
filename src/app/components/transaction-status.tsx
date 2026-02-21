import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionStatus as TxStatus } from '../../hooks/useContract';
import { formatTxHash, getExplorerUrl } from '../../lib/stellar-client';

interface TransactionStatusProps {
    status: TxStatus;
    hash: string;
    onClose: () => void;
}

export function TransactionStatus({ status, hash, onClose }: TransactionStatusProps) {
    if (status === 'idle') return null;

    const isSuccess = status === 'success';
    const isError = status === 'error';
    const isPending = status === 'pending';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold">Transaction Status</h3>
                            {!isPending && (
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4">
                            {isPending && (
                                <>
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg mb-1">Processing...</h4>
                                        <p className="text-slate-500 text-sm">Please approve the transaction in your wallet</p>
                                    </div>
                                </>
                            )}

                            {isSuccess && (
                                <>
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg mb-1">Success!</h4>
                                        <p className="text-slate-500 text-sm">Your bounty has been created successfully</p>
                                    </div>
                                    {hash && (
                                        <a
                                            href={getExplorerUrl('tx', hash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            View on Explorer
                                            <span className="text-xs text-slate-400">({formatTxHash(hash)})</span>
                                        </a>
                                    )}
                                </>
                            )}

                            {isError && (
                                <>
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                        <AlertCircle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg mb-1">Transaction Failed</h4>
                                        <p className="text-slate-500 text-sm max-w-[280px] mx-auto">
                                            Something went wrong. Please check your wallet and try again.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Waiting...' : 'Close'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
