import { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { BountyButton } from './bounty-button';
import { Wallet, LogOut } from 'lucide-react';
import { WalletModal } from './wallet-modal';
import { useWallet } from './wallet-provider';
import { ThemeToggle } from './theme-toggle';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, address, connect, disconnect } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Browse', href: '#browse' },
    { label: 'My Bounties', href: '#my-bounties' },
    { label: 'Create', href: '#create' },
    { label: 'Leaderboard', href: '#leaderboard' },
  ];

  const handleConnect = async (walletId: string) => {
    // map walletId to WalletType if necessary, assuming ids match
    await connect(walletId as any);
    // The modal closing is handled by the Modal? No, Modal calls onConnect then we usually close it.
    // But WalletModal calls onConnect then onClose.
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          'h-[72px] flex items-center px-6',
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50'
            : 'bg-background/60 backdrop-blur-md'
        )}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-3xl">🎯</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              Bounty Board
            </span>
          </a>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Theme Toggle & Wallet Button */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isConnected ? (
              <button
                onClick={disconnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border-2 border-primary/20 hover:border-primary/40 transition-all hover:bg-destructive/10 hover:text-destructive group"
              >
                <Wallet size={20} className="text-primary group-hover:text-destructive" />
                <span className="font-mono text-sm font-semibold">
                  {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connected'}
                </span>
                <LogOut size={16} className="text-muted-foreground group-hover:text-destructive" />
              </button>
            ) : (
              <BountyButton
                variant="primary"
                size="md"
                onClick={() => setIsModalOpen(true)}
              >
                <Wallet size={20} />
                Connect Wallet
              </BountyButton>
            )}
          </div>
        </div>
      </nav>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  );
}