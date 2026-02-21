import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Coins, User, CheckCircle, ShieldCheck } from 'lucide-react';
import { BountyButton } from './bounty-button';
import { Bounty } from '../../types/bounty';
import { stroopsToXlm, getTimeRemaining, shortenAddress } from '../../lib/stellar-client';

import { createPortal } from 'react-dom';

interface BountyDetailsModalProps {
    bounty: Bounty | null;
    isOpen: boolean;
    onClose: () => void;
    onClaim?: (bountyId: number) => void;
}

export function BountyDetailsModal({ bounty, isOpen, onClose, onClaim }: BountyDetailsModalProps) {
    if (!bounty || typeof document === 'undefined') return null;

    // Map contract integer status to string status if necessary
    let displayStatus = bounty.status as any;
    if (displayStatus === 0) displayStatus = 'Open';
    if (displayStatus === 1) displayStatus = 'Assigned';
    if (displayStatus === 2) displayStatus = 'Completed';
    if (displayStatus === 3) displayStatus = 'Cancelled';

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal Overlay */}
                    <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl rounded-2xl border overflow-hidden pointer-events-auto flex flex-col max-h-[90vh] relative"
                        >
                            {/* Header */}
                            <div className="relative p-6 border-b border-border/50 bg-slate-800/50">
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-primary/20 text-primary border border-primary/30">
                                        Bounty #{Number(bounty.id)}
                                    </span>
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        {displayStatus}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold pr-12 line-clamp-2 text-white">{bounty.title}</h2>
                            </div>

                            {/* Scrollable Body */}
                            <div className="p-6 overflow-y-auto w-full flex-1 space-y-8 bg-slate-900">
                                {/* Metrics row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                                        <Coins size={20} className="text-accent mb-2" />
                                        <span className="font-bold text-lg text-white">{stroopsToXlm(bounty.reward)} XLM</span>
                                        <span className="text-xs text-slate-400">Reward</span>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                                        <Clock size={20} className="text-secondary mb-2" />
                                        <span className="font-bold text-lg text-white">{getTimeRemaining(Number(bounty.deadline))}</span>
                                        <span className="text-xs text-slate-400">Deadline</span>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center col-span-2">
                                        <User size={20} className="text-primary mb-2" />
                                        <span className="font-bold text-lg font-mono text-sm text-white">{shortenAddress(bounty.creator, 8)}</span>
                                        <span className="text-xs text-slate-400">Creator</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-white">
                                        <ShieldCheck className="text-primary" size={20} />
                                        Requirements & Description
                                    </h3>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-300 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                        {bounty.description.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2 last:mb-0">
                                                {line || <br />}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center gap-3 justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <CheckCircle size={16} className="text-success" />
                                    <span>Funds Escrowed</span>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <BountyButton variant="outline" onClick={onClose} className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800">
                                        Close
                                    </BountyButton>
                                    {displayStatus === 'Open' && (
                                        <BountyButton variant="primary" onClick={() => onClaim && onClaim(bounty.id)} className="w-full sm:w-auto shadow-lg shadow-primary/20">
                                            Start Working
                                        </BountyButton>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
