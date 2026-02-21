import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Wallet, ChevronRight, Home, PlusSquare, Award, Clock } from 'lucide-react';
import { cn } from './ui/utils';
import { BountyButton } from './bounty-button';
import { ThemeToggle } from './theme-toggle';

interface MobileNavigationProps {
    onConnectWallet: () => void;
    isConnected: boolean;
    walletAddress?: string;
    onDisconnect: () => void;
}

export function MobileNavigation({
    onConnectWallet,
    isConnected,
    walletAddress,
    onDisconnect
}: MobileNavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navLinks = [
        { id: 'home', label: 'Browse', icon: Home, href: '#browse' },
        { id: 'create', label: 'Create', icon: PlusSquare, href: '#create' },
        { id: 'bounties', label: 'My Bounties', icon: Clock, href: '#my-bounties' },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award, href: '#leaderboard' },
    ];

    return (
        <>
            {/* Top Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 h-[60px] flex items-center justify-between px-4 pb-safe-top">
                {/* Hamburger Menu */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -ml-2 text-foreground hover:bg-muted rounded-full transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Logo Center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-xl">🎯</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Bounty Board
                    </span>
                </div>

                {/* Wallet Button */}
                <button
                    onClick={isConnected ? onDisconnect : onConnectWallet}
                    className={cn(
                        "p-2 -mr-2 rounded-full transition-colors relative",
                        isConnected ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                    )}
                    aria-label={isConnected ? "Wallet connected" : "Connect wallet"}
                >
                    <Wallet className="w-6 h-6" />
                    {isConnected && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                    )}
                </button>
            </nav>

            {/* Side Menu Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-background z-[70] shadow-2xl flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <span className="text-lg font-bold">Menu</span>
                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.id}
                                        href={link.href}
                                        onClick={() => {
                                            setActiveTab(link.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl transition-all active:scale-[0.98]",
                                            activeTab === link.id
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-foreground/80 hover:bg-muted"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon className="w-5 h-5" />
                                            <span className="text-base">{link.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                    </a>
                                ))}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-6 border-t border-border bg-muted/30 pb-safe-bottom">
                                {isConnected ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                                {walletAddress ? walletAddress.substring(0, 2) : '0x'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">Connected</p>
                                                <p className="text-xs text-muted-foreground font-mono truncate">{walletAddress}</p>
                                            </div>
                                        </div>
                                        <BountyButton
                                            variant="outline"
                                            className="w-full justify-center text-error border-error/20 hover:bg-error/10 hover:border-error/50"
                                            onClick={() => {
                                                onDisconnect();
                                                setIsOpen(false);
                                            }}
                                        >
                                            Disconnect
                                        </BountyButton>
                                    </div>
                                ) : (
                                    <BountyButton
                                        variant="primary"
                                        className="w-full justify-center shadow-lg shadow-primary/20"
                                        onClick={() => {
                                            onConnectWallet();
                                            setIsOpen(false);
                                        }}
                                    >
                                        <Wallet className="w-4 h-4 mr-2" />
                                        Connect Wallet
                                    </BountyButton>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe-bottom flex md:hidden justify-between items-center px-6 pt-2 pb-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
                {navLinks.map((link) => {
                    const isActive = activeTab === link.id;
                    return (
                        <button
                            key={link.id}
                            onClick={() => {
                                setActiveTab(link.id);
                                window.location.hash = link.href;
                            }}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative min-w-[64px]",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <link.icon
                                className={cn("w-6 h-6 transition-all", isActive && "scale-110")}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={cn("text-[10px] font-medium", isActive ? "font-bold" : "font-normal")}>
                                {link.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute -top-[9px] w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_rgba(var(--primary),0.5)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Spacer for content */}
            <div className="h-[60px]" />
        </>
    );
}
